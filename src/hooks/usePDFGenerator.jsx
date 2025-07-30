import { useState } from "react";
import jsPDF from "jspdf";

export function usePDFGenerator(noticias) {
  const [generando, setGenerando] = useState(false);
  const [errorGen, setErrorGen] = useState(null);
  const [noticiasDescartadas, setNoticiasDescartadas] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [pdfPendiente, setPdfPendiente] = useState(null);

  async function getBase64ImageFromUrl(imageUrl) {
    try {
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error("No se pudo cargar imagen");
      const blob = await response.blob();

      return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async function generarBoletin() {
    setGenerando(true);
    setErrorGen(null);

    try {
      const res = await fetch("/api/noticias");
      if (!res.ok)
        throw new Error("Error al obtener noticias desde la base de datos");
      const data = await res.json();

      const noticiasAprobadas = data.filter(
        (n) => n.estado?.toLowerCase() === "aprobado"
      );

      if (noticiasAprobadas.length === 0) {
        setErrorGen("No hay noticias aprobadas para generar el boletín.");
        setGenerando(false);
        return;
      }

      // Array para rastrear noticias descartadas por errores
      const noticiasDescartadas = [];

      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;
      let y = margin;

      // Cargar imágenes de cabecera desde URLs
      const [logoIzquierda, logoCentro] = await Promise.all([
        getBase64ImageFromUrl("https://i.ibb.co/h1g43r2n/image-5-1.png"),
        getBase64ImageFromUrl("https://i.ibb.co/M5fYmwbJ/image-5-2.png"),
      ]);

      // Altura máxima para la cabecera
      const headerHeight = 40;
      const logoWidth = 100;
      const logoY = y;
      const logoHeight = headerHeight;

      // Agregar logo izquierdo (alineado extremo izquierdo)
      if (logoIzquierda) {
        doc.addImage(
          logoIzquierda,
          "PNG",
          margin,
          logoY,
          logoWidth,
          logoHeight
        );
      }

      // Agregar logo derecho (alineado extremo derecho)
      if (logoCentro) {
        doc.addImage(
          logoCentro,
          "PNG",
          pageWidth - margin - logoWidth,
          logoY,
          logoWidth,
          logoHeight
        );
      }

      // Título centrado en la cabecera
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.setTextColor("#12358d");
      doc.text("Samuel Noticias", pageWidth / 2, logoY + 28, { align: "center" });

      // Fecha y hora centradas debajo del título
      const fechaHora = new Date().toLocaleString("es-ES", {
        dateStyle: "full",
        timeStyle: "short",
      });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor("#6c757d");
      doc.text(fechaHora, pageWidth / 2, logoY + 45, { align: "center" });

      y += headerHeight + 32; // Espacio después de la cabecera

      // Primera página: máximo 2 noticias
      let noticiasEnPrimeraPagina = Math.min(noticiasAprobadas.length, 2);
      let noticiasRestantes = noticiasAprobadas.length - noticiasEnPrimeraPagina;

      // Procesar primera página (2 noticias)
      let noticiasProcesamientoExitoso = 0;
      for (let i = 0; i < noticiasEnPrimeraPagina; i++) {
        const noticia = noticiasAprobadas[i];
        try {
          y = await agregarNoticiaAPDF(doc, noticia, y, pageWidth, margin, false);
          noticiasProcesamientoExitoso++;
        } catch (error) {
          console.error(`Error procesando noticia ID ${noticia.id || 'desconocido'}: ${noticia.titulo || 'Sin título'}`, error);
          noticiasDescartadas.push({
            id: noticia.id || 'desconocido',
            titulo: noticia.titulo || 'Sin título',
            error: error.message
          });
        }
      }

      // Si hay más noticias, crear nuevas páginas con 3 noticias cada una
      if (noticiasRestantes > 0) {
        doc.addPage();
        y = margin;
        let noticiasEnPagina = 0;

        for (let i = noticiasEnPrimeraPagina; i < noticiasAprobadas.length; i++) {
          const noticia = noticiasAprobadas[i];

          try {
            // Si ya hay 3 noticias en la página, crear nueva página
            if (noticiasEnPagina === 3) {
              doc.addPage();
              y = margin;
              noticiasEnPagina = 0;
            }

            y = await agregarNoticiaAPDF(doc, noticia, y, pageWidth, margin, true);
            noticiasEnPagina++;
            noticiasProcesamientoExitoso++;
          } catch (error) {
            console.error(`Error procesando noticia ID ${noticia.id || 'desconocido'}: ${noticia.titulo || 'Sin título'}`, error);
            noticiasDescartadas.push({
              id: noticia.id || 'desconocido',
              titulo: noticia.titulo || 'Sin título',
              error: error.message
            });
          }
        }
      }

      // Nombre del archivo PDF
      const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
      ];
      const fechaActual = new Date();
      const dia = fechaActual.getDate();
      const sufijo = dia === 1 ? "ro" : "";
      const mes = meses[fechaActual.getMonth()];
      const nombrePDF = `SamuelNoticias-${dia}${sufijo} de ${mes}`;

      // Verificar si se procesó al menos una noticia
      if (noticiasProcesamientoExitoso === 0) {
        throw new Error("No se pudo procesar ninguna noticia para el PDF");
      }

      // Si hay noticias descartadas, mostrar modal antes de descargar
      if (noticiasDescartadas.length > 0) {
        console.warn(`Se descartaron ${noticiasDescartadas.length} noticias por errores:`, noticiasDescartadas);
        setNoticiasDescartadas(noticiasDescartadas);
        setPdfPendiente({ doc, nombrePDF });
        setMostrarModal(true);
      } else {
        // Si no hay noticias descartadas, descargar directamente
        doc.save(`${nombrePDF}.pdf`);
      }
    } catch (e) {
      console.error(e);
      setErrorGen("Error generando PDF: " + e.message);
    } finally {
      setGenerando(false);
    }
  }

  async function agregarNoticiaAPDF(doc, noticia, y, pageWidth, margin, isCompact = false) {
    // Validaciones básicas
    if (!noticia) {
      throw new Error("Noticia es null o undefined");
    }
    
    if (!noticia.titulo || typeof noticia.titulo !== 'string') {
      throw new Error("Noticia no tiene título válido");
    }

    const boxWidth = pageWidth - margin * 2;
    const padding = 15;
    let cursorY = y + padding;
    let tieneImagenValida = false; // Variable para rastrear si se procesó una imagen

    // Estilo de la caja
    doc.setDrawColor("#e0e0e0");
    doc.setFillColor("#ffffff");
    doc.setLineWidth(1);

    // Metadatos con manejo seguro de fecha
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor("#000000");
    
    let fechaPub = "Fecha no disponible";
    try {
      if (noticia.fecha_publicacion) {
        const fecha = new Date(noticia.fecha_publicacion);
        if (!isNaN(fecha.getTime())) {
          fechaPub = fecha.toLocaleDateString();
        }
      }
    } catch (error) {
      console.warn("Error procesando fecha de publicación:", error);
    }
    
    const metaText = `${fechaPub} | Autor: ${noticia.autor || "Desconocido"}`;
    doc.text(metaText, margin + padding, cursorY);
    cursorY += 18;

    // Título con validación
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor("#12358d");
    
    let tituloSeguro = noticia.titulo.trim();
    if (tituloSeguro.length > 200) {
      tituloSeguro = tituloSeguro.substring(0, 197) + "...";
    }
    
    const titleLines = doc.splitTextToSize(tituloSeguro, boxWidth - padding * 2);
    doc.text(titleLines, margin + padding, cursorY);
    cursorY += titleLines.length * 18;

    // Imagen expandida casi a todo el ancho con manejo robusto de errores
    if (noticia.imagen && typeof noticia.imagen === 'string' && noticia.imagen.trim()) {
      try {
        const imgData = await getBase64ImageFromUrl(noticia.imagen);
        if (imgData) {
          // Deja solo un pequeño margen a los lados
          const sideMargin = 12;
          const maxImgWidth = boxWidth - sideMargin * 2;
          const imgObj = document.createElement("img");
          imgObj.src = imgData;
          
          await new Promise((resolve, reject) => {
            imgObj.onload = resolve;
            imgObj.onerror = () => reject(new Error("Error cargando imagen"));
            // Timeout para evitar esperas infinitas
            setTimeout(() => reject(new Error("Timeout cargando imagen")), 5000);
          });
          
          // Validar dimensiones de imagen
          if (!imgObj.naturalWidth || !imgObj.naturalHeight || imgObj.naturalWidth <= 0 || imgObj.naturalHeight <= 0) {
            throw new Error("Dimensiones de imagen inválidas");
          }
          
          const ratio = imgObj.naturalHeight / imgObj.naturalWidth;
          let imgWidth = maxImgWidth;
          let imgHeight = imgWidth * ratio;
          
          // Ajuste de tamaño
          if (isCompact) {
            imgHeight = Math.min(imgHeight, 100);
          } else {
            imgHeight = Math.min(imgHeight, 170);
          }
          imgWidth = imgHeight / ratio;
          // Si la imagen es demasiado ancha, recorta al máximo permitido
          if (imgWidth > maxImgWidth) imgWidth = maxImgWidth;
          
          // Validar que las dimensiones finales sean válidas
          if (imgWidth <= 0 || imgHeight <= 0 || !isFinite(imgWidth) || !isFinite(imgHeight)) {
            throw new Error("Dimensiones calculadas inválidas");
          }
          
          // Centrado horizontal
          const imgX = margin + sideMargin + (maxImgWidth - imgWidth) / 2;
          // Marco para la imagen (sutil sombra)
          doc.setFillColor("#f8fafc");
          doc.roundedRect(
            imgX - 4,
            cursorY - 4,
            imgWidth + 8,
            imgHeight + 8,
            8,
            8,
            "F"
          );
          doc.addImage(
            imgData,
            "PNG",
            imgX,
            cursorY,
            imgWidth,
            imgHeight
          );
          cursorY += imgHeight + 18;
          tieneImagenValida = true; // Marcar que se procesó una imagen exitosamente
        }
      } catch (error) {
        console.warn(`Error procesando imagen para noticia ${noticia.id || 'desconocido'}:`, error);
        // Continuar sin imagen en lugar de fallar toda la noticia
      }
    }

    // Resumen (limitado para evitar solapamiento) con validación
    doc.setFont("helvetica", "italic");
    doc.setFontSize(11);
    doc.setTextColor("#000000");
    
    let resumenMostrar = "";
    try {
      resumenMostrar = noticia.resumen_ia || noticia.resumen || "Sin resumen disponible";
      if (typeof resumenMostrar !== 'string') {
        resumenMostrar = String(resumenMostrar);
      }
      // Limpiar caracteres problemáticos
      resumenMostrar = resumenMostrar.replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ');
    } catch (error) {
      console.warn("Error procesando resumen:", error);
      resumenMostrar = "Error procesando resumen";
    }
    
    let resumenLines = doc.splitTextToSize(resumenMostrar, boxWidth - padding * 2);
    // Ajustar número de líneas según si tiene imagen o no
    const maxResumenLines = tieneImagenValida ? 4 : 6; // Menos líneas para evitar solapes
    if (resumenLines.length > maxResumenLines) {
      resumenLines = resumenLines.slice(0, maxResumenLines);
      resumenLines[maxResumenLines - 1] += " ...";
    }
    doc.text(resumenLines, margin + padding, cursorY);
    cursorY += resumenLines.length * (isCompact ? 12 : 14);

    // Calcular altura de la caja dinámicamente según el contenido (sin contar 'Leer más')
    let boxHeightReal;
    if (isCompact) {
      // Para modo compacto, ajustar según si tiene imagen
      boxHeightReal = tieneImagenValida ? 260 : 180;
    } else {
      boxHeightReal = cursorY - y + padding + 20; // +20 para espacio visual extra
    }

    // Dibuja la caja primero
    doc.setDrawColor("#e0e0e0"); // gris claro
    doc.setLineWidth(1.2);
    doc.roundedRect(margin, y, boxWidth, boxHeightReal, 12, 12, "S");

    // Leer más SIEMPRE al fondo de la caja (con margen inferior)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor("#f59e42");
    let urlSegura = "#";
    try {
      if (noticia.url && typeof noticia.url === 'string' && noticia.url.trim()) {
        urlSegura = noticia.url.trim();
      }
    } catch (error) {
      console.warn("Error procesando URL:", error);
    }
    // Lo ubicamos a 18px del borde inferior de la caja
    const leerMasY = y + boxHeightReal - 18;
    doc.textWithLink("Leer más", margin + padding, leerMasY, {
      url: urlSegura,
    });

    // Espaciado después de la caja también ajustado
    const espaciadoDespues = tieneImagenValida ? (isCompact ? 5 : 20) : (isCompact ? 3 : 15);
    return y + boxHeightReal + espaciadoDespues;
  }

  const confirmarYDescargar = () => {
    if (pdfPendiente) {
      pdfPendiente.doc.save(`${pdfPendiente.nombrePDF}.pdf`);
      setPdfPendiente(null);
    }
    setMostrarModal(false);
    setNoticiasDescartadas([]);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setNoticiasDescartadas([]);
    setPdfPendiente(null);
  };

  return { 
    generarBoletin, 
    generando, 
    errorGen, 
    noticiasDescartadas,
    mostrarModal,
    confirmarYDescargar,
    cerrarModal
  };
}