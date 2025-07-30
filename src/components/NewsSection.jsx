import NewsCard from "./NewsCard";

export default function NewsSection({
  title,
  noticias,
  colorClass,
  manejarEstado,
  actualizandoEstado,
  noNewsMessage,
}) {
  return (
    <div className="mb-8">
      <h2 className={`text-[#e10914]xl font-bold mb-4 ${colorClass}`}>{title}</h2>
      {(Array.isArray(noticias) && noticias.length > 0) ? (
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2">
          {Array.isArray(noticias) && noticias.map((noticia) => (
            <NewsCard
              key={noticia.id}
              noticia={noticia}
              manejarEstado={manejarEstado}
              estaActualizando={actualizandoEstado[noticia.id]}
            />
          ))}
        </div>
      ) : (
        <p className="text-[#e10914]gray-500">{noNewsMessage}</p>
      )}
      <hr className="border-t border-[#006168]300 mt-6" />
    </div>
  );
}