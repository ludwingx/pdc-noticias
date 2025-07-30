import { PrismaClient } from "@prisma/client";
import { DateTime } from "luxon";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    // 1. Configuración de zonas horarias
    const zonaBolivia = "America/La_Paz";
    
    // 2. Obtener tiempos actuales
    const ahoraUTC = DateTime.utc();
    const ahoraBolivia = ahoraUTC.setZone(zonaBolivia);
    
    console.log(`[DEBUG] Hora actual Bolivia: ${ahoraBolivia.toFormat("dd/MM/yyyy HH:mm:ss")}`);

    // 3. Definir el corte diario a las 8:30 AM Bolivia
    const corteHoyBolivia = ahoraBolivia.set({ 
      hour: 8, 
      minute: 30, 
      second: 0, 
      millisecond: 0 
    });

    // 4. Determinar el rango de búsqueda
    let inicioBusquedaUTC, finBusquedaUTC;

    if (ahoraBolivia < corteHoyBolivia) {
      // Si es antes de 8:30 AM hoy, mostrar desde 8:30 AM de ayer
      inicioBusquedaUTC = corteHoyBolivia.minus({ days: 1 }).toUTC();
      finBusquedaUTC = corteHoyBolivia.toUTC();
    } else {
      // Si es después de 8:30 AM hoy, mostrar desde 8:30 AM hoy
      inicioBusquedaUTC = corteHoyBolivia.toUTC();
      finBusquedaUTC = corteHoyBolivia.plus({ days: 1 }).toUTC();
    }

    console.log(`[DEBUG] Rango de búsqueda:`);
    console.log(`- UTC: ${inicioBusquedaUTC.toFormat("dd/MM/yyyy HH:mm:ss")} - ${finBusquedaUTC.toFormat("dd/MM/yyyy HH:mm:ss")}`);
    console.log(`- Bolivia: ${inicioBusquedaUTC.setZone(zonaBolivia).toFormat("dd/MM/yyyy HH:mm:ss")} - ${finBusquedaUTC.setZone(zonaBolivia).toFormat("dd/MM/yyyy HH:mm:ss")}`);

    // 5. Consulta a la base de datos
    const noticias = await prisma.news.findMany({
      where: {
        created_at: {
          gte: inicioBusquedaUTC.toJSDate(),
          lt: finBusquedaUTC.toJSDate()
        }
      },
      orderBy: { created_at: "desc" }
    });

    // 6. Transformar las fechas para el frontend
    const noticiasConFechaFormateada = noticias.map(noticia => {
      const fechaUTC = DateTime.fromJSDate(noticia.created_at).toUTC();
      const fechaBolivia = fechaUTC.setZone(zonaBolivia);
      
      return {
        ...noticia,
        created_at: fechaBolivia.toISO(),
        fecha_bolivia: fechaBolivia.toFormat("dd/MM/yyyy HH:mm:ss"),
        fecha_utc: fechaUTC.toFormat("dd/MM/yyyy HH:mm:ss")
      };
    });

    console.log(`[DEBUG] Noticias encontradas: ${noticiasConFechaFormateada.length}`);
    
    // 7. Enviar respuesta
    return new Response(JSON.stringify(noticiasConFechaFormateada), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, max-age=0"
      }
    });

  } catch (error) {
    console.error("[ERROR] En GET /api/noticias:", error);
    return new Response(
      JSON.stringify({ 
        error: "Error al obtener noticias", 
        details: error.message 
      }),
      { status: 500 }
    );
  }
}
// PUT permanece igual
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, estado } = body;

    if (!id || !estado) {
      return new Response(
        JSON.stringify({ error: "Faltan campos: 'id' o 'estado'" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const noticiaActualizada = await prisma.news.update({
      where: { id: Number(id) },
      data: { estado },
    });

    return new Response(JSON.stringify(noticiaActualizada), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Error al actualizar noticia", detail: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}