export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  if (!url) return new Response("Missing url", { status: 400 });
  try {
    const response = await fetch(url);
    if (!response.ok) return new Response("Image fetch failed", { status: 400 });
    const contentType = response.headers.get("content-type");
    const buffer = await response.arrayBuffer();
    return new Response(Buffer.from(buffer), {
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return new Response("Proxy error", { status: 500 });
  }
}