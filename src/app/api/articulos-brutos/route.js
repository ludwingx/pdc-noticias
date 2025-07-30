import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const articulosBrutos = await prisma.articuloBruto.findMany({
      orderBy: { creado: "desc" }
    });

    return new Response(JSON.stringify(articulosBrutos), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, max-age=0"
      }
    });

  } catch (error) {
    console.error("[ERROR] En GET /api/articulos-brutos:", error);
    return new Response(
      JSON.stringify({ 
        error: "Error al obtener artículos brutos", 
        details: error.message 
      }),
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return new Response(
        JSON.stringify({ error: "Falta el campo 'url'" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const articuloBruto = await prisma.articuloBruto.create({
      data: { url }
    });

    return new Response(JSON.stringify(articuloBruto), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("[ERROR] En POST /api/articulos-brutos:", error);
    return new Response(
      JSON.stringify({ 
        error: "Error al crear artículo bruto", 
        details: error.message 
      }),
      { status: 500 }
    );
  }
}

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

    const articuloBruto = await prisma.articuloBruto.update({
      where: { id: Number(id) },
      data: { estado }
    });

    return new Response(JSON.stringify(articuloBruto), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("[ERROR] En PUT /api/articulos-brutos:", error);
    return new Response(
      JSON.stringify({ 
        error: "Error al actualizar artículo bruto", 
        details: error.message 
      }),
      { status: 500 }
    );
  }
}
