import Image from "next/image";
import { MdCheckCircle, MdCancel } from "react-icons/md";
import { useState } from "react";

export default function NewsCard({ noticia, manejarEstado, estaActualizando }) {
  const estadoActual = noticia.estado?.toLowerCase() || null;
  const [imagenError, setImagenError] = useState(false);
  const [imagenCargando, setImagenCargando] = useState(true);
  
  const tieneImagenValida = noticia.imagen && !imagenError;

  return (
    <article className="border rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition flex flex-col h-full">
      <h2 className="text-base sm:text-lg font-semibold mb-1">
        {noticia.titulo}
      </h2>
      <p className="text-xs sm:text-sm text-gray-600 mb-2">
        Publicado por{" "}
        <span className="font-medium">{noticia.autor || "Desconocido"}</span> el{" "}
        {new Date(noticia.fecha_publicacion ?? "").toLocaleDateString()}
      </p>
      {tieneImagenValida && (
        <div className="w-full mb-2 flex justify-center">
          <Image
            src={noticia.imagen}
            alt={noticia.titulo}
            width={400}
            height={220}
            className="rounded object-cover w-full max-h-56"
            unoptimized
            priority
            onLoad={() => setImagenCargando(false)}
            onError={() => {
              setImagenError(true);
              setImagenCargando(false);
            }}
          />
        </div>
      )}
      <h6 className={`text-xs font-medium text-gray-500 mb-2 ${tieneImagenValida ? 'mt-2' : 'mt-1'}`}>Resumen IA:</h6>
      <div className="flex-grow">
        <p className={`text-xs sm:text-sm text-gray-700 whitespace-pre-line ${!tieneImagenValida ? 'line-clamp-[8]' : 'line-clamp-[4]'}`}>
          {noticia.resumen_ia}
        </p>
      </div>
      <hr className="my-2" />
      <div className="flex flex-col gap-2 mt-auto">
        <a
          href={noticia.url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-800 hover:underline text-sm"
        >
          Leer más &rarr;
        </a>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => manejarEstado(noticia.id, "aprobado")}
            disabled={estaActualizando}
            className={`flex items-center gap-2 px-4 py-2 rounded text-xs sm:text-sm font-medium transition bg-gray-200 text-gray-700 hover:bg-green-500 hover:text-white ${
              estadoActual === "aprobado"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-green-500 hover:text-white"
            } ${estaActualizando ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <MdCheckCircle className="text-lg" />
            {estaActualizando ? "Actualizando..." : "Aprobar"}
          </button>
          <button
            onClick={() => manejarEstado(noticia.id, "rechazado")}
            disabled={estaActualizando}
            className={`flex items-center gap-2 px-4 py-2 rounded text-xs sm:text-sm font-medium transition bg-gray-200 text-gray-700 hover:bg-red-500 hover:text-white ${
              estadoActual === "rechazado"
                ? "bg-[#e10914] text-white"
                : "bg-gray-200 text-gray-700 hover:bg-red-500 hover:text-white"
            } ${estaActualizando ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <MdCancel className="text-lg" />
            {estaActualizando ? "Actualizando..." : "Rechazar"}
          </button>
        </div>
      </div>
    </article>
  );
}