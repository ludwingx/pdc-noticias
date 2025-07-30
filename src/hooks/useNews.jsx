import { useState, useEffect } from "react";

export function useNews() {
  const [articulosBrutos, setArticulosBrutos] = useState([]);
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ejecutandoWebhook, setEjecutandoWebhook] = useState(false);
  const [webhookError, setWebhookError] = useState(null);
  const [timer, setTimer] = useState(20);
  const [waiting, setWaiting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [noNews, setNoNews] = useState(false);
  const [intentosSinNoticias, setIntentosSinNoticias] = useState(0);
  const [actualizandoEstado, setActualizandoEstado] = useState({});
  const [contador, setContador] = useState(null);
  const [horaLocal, setHoraLocal] = useState("");
  const [mostrarModalCargaNoticias, setMostrarModalCargaNoticias] = useState(false);

  // Filtrar noticias por categoría: solo 'RODRI' o 'LARA'
  const noticiasFiltradas = noticias.filter(
    (n) => {
      const cat = (n.categoria || "").toUpperCase();
      return cat === "RODRI" || cat === "LARA";
    }
  );
  const hayNoticias = noticiasFiltradas.length > 0;

  useEffect(() => {
    const updateHora = () => {
      const ahora = new Date();
      setHoraLocal(ahora.toLocaleTimeString());
    };
    updateHora();
    const interval = setInterval(updateHora, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let interval;
    async function fetchNoticias() {
      const res = await fetch("/api/noticias");
      let data = await res.json();
      if (!Array.isArray(data)) data = [];
      setNoticias(data);
      setLoading(false);
    }
    async function fetchArticulosBrutos() {
      try {
        const res = await fetch("/api/articulos-brutos");
        let data = await res.json();
        if (!Array.isArray(data)) data = [];
        setArticulosBrutos(data);
      } catch (e) {
        setArticulosBrutos([]);
      }
    }
    fetchNoticias();
    fetchArticulosBrutos();
    interval = setInterval(() => {
      fetchNoticias();
      fetchArticulosBrutos();
    }, 60000); // 60 segundos
    return () => clearInterval(interval);
  }, []);

  // Efecto para el contador de recarga
  useEffect(() => {
    let interval;
    function updateContador() {
      if (hayNoticias) {
        setContador(getTiempoRestanteHasta830amSiguiente());
      } else {
        setContador(null);
      }
    }
    updateContador();
    if (hayNoticias) {
      interval = setInterval(updateContador, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [hayNoticias]);

  async function esperarCambioNoticias(condicionCambio, maxIntentos = 3, mostrarModal = true) {
    if (mostrarModal) {
      setWaiting(true);
      setShowModal(true);
    }
    setNoNews(false);
    setTimer(60);
    setIntentosSinNoticias(0);

    let keepWaiting = true;
    let foundCambio = false;
    let intentos = 0;

    try {
      while (keepWaiting) {
        for (let t = 60; t > 0; t--) {
          setTimer(t);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        setTimer(0);

        const noticiasRes = await fetch("/api/noticias");
        const nuevasNoticias = await noticiasRes.json();

        if (condicionCambio(nuevasNoticias)) {
          setNoticias(nuevasNoticias);
          foundCambio = true;
          keepWaiting = false;
          if (mostrarModal) {
            setWaiting(false);
            setShowModal(false);
          }
          setIntentosSinNoticias(0);
          setNoNews(false);
          break;
        } else {
          intentos++;
          setIntentosSinNoticias(intentos);
          if (intentos >= maxIntentos) {
            setNoNews(true);
          }
        }
      }
      if (!foundCambio && mostrarModal) {
        setWaiting(false);
        setShowModal(false);
      }
    } catch (err) {
      console.error(err);
      setWebhookError("Error al esperar cambios en las noticias.");
      if (mostrarModal) {
        setWaiting(false);
        setShowModal(false);
      }
      setIntentosSinNoticias(0);
      setNoNews(false);
    }
  }

  async function ejecutarWebhook() {
    setEjecutandoWebhook(true);
    setWebhookError(null);
    setMostrarModalCargaNoticias(true); // Mostrar el modal
  
    try {
      const res = await fetch(
        "https://political-news-n8n.af9gwe.easypanel.host/webhook/pdc-news",
        { method: "POST" }
      );
      if (!res.ok) throw new Error("Error al ejecutar el webhook");
  
      await esperarCambioNoticias(
        (nuevasNoticias) => Array.isArray(nuevasNoticias) && nuevasNoticias.length > 0
      );
    } catch (err) {
      setWebhookError("Error al ejecutar el flujo de N8N.");
    } finally {
      setEjecutandoWebhook(false);
      setMostrarModalCargaNoticias(false); // Ocultar modal al finalizar
    }
  }
  
  async function manejarEstado(id, nuevoEstado) {
    // Aplica el cambio local optimista
    setNoticias((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, estado: nuevoEstado.toUpperCase() } : n
      )
    );
  
    setActualizandoEstado((prev) => ({ ...prev, [id]: true }));
  
    try {
      const res = await fetch("/api/noticias", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, estado: nuevoEstado.toUpperCase() }),
      });
  
      if (!res.ok) throw new Error("Error al actualizar estado");
      await res.json();
    } catch (err) {
      alert("No se pudo actualizar el estado de la noticia.");
    } finally {
      setActualizandoEstado((prev) => ({ ...prev, [id]: false }));
    }
  }
  
  function getTiempoRestanteHasta830amSiguiente() {
    const ahora = new Date();
    const ahoraBolivia = new Date(
      ahora.toLocaleString("en-US", { timeZone: "America/La_Paz" })
    );
    let siguiente830 = new Date(ahoraBolivia);
    siguiente830.setHours(8, 30, 0, 0);

    if (ahoraBolivia >= siguiente830) {
      siguiente830.setDate(siguiente830.getDate() + 1);
    }

    const diff = siguiente830 - ahoraBolivia;
    const horas = Math.floor(diff / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diff % (1000 * 60)) / 1000);

    return { horas, minutos, segundos };
  }

  // Agrupar noticias por categoría específica
  const noticiasRodrigo = noticias.filter(
    (n) => (n.categoria || '').toUpperCase() === 'RODRI'
  );
  const noticiasEdman = noticias.filter(
    (n) => (n.categoria || '').toUpperCase() === 'LARA'
  );
  const noticiasOtros = noticias.filter(
    (n) => {
      const cat = (n.categoria || '').toUpperCase();
      return cat !== 'RODRI' && cat !== 'LARA';
    }
  );

  return {
    noticias: noticiasFiltradas,
    noticiasRodrigo,
    noticiasEdman,
    noticiasOtros,
    articulosBrutos,
    loading,



    ejecutarWebhook,
    manejarEstado,
    actualizandoEstado,
    ejecutandoWebhook,
    waiting,
    showModal,
    mostrarModalCargaNoticias,
    timer,
    noNews,
    intentosSinNoticias,
    webhookError,
    contador,
    horaLocal,
    hayNoticias,
    mostrarModalCargaNoticias,
  };
}
