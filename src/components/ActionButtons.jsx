
export default function ActionButtons({
  ejecutarWebhook,
  generarBoletin,
  ejecutandoWebhook,
  generando,
  hayNoticias,
  contador,
  showFullButtons = false,
  errorGen,
  webhookError,
}) {
  // Mensaje para el botón de boletín
  let boletinLabel = "Descargar Boletín";
  if (generando) boletinLabel = "Generando PDF...";
  if (errorGen) boletinLabel = "Error al generar PDF";

  // Mensaje para el botón de extracción
  let extraccionLabel = "Procesar Noticias 🤖";
  if (ejecutandoWebhook) extraccionLabel = "Procesando...";
  if (webhookError) extraccionLabel = "Error al procesar noticias";

  // Mensaje de espera
  let esperaLabel = "Próxima extracción disponible en ";
  if (contador) {
    esperaLabel += `${contador.horas.toString().padStart(2, "0")}:${
      contador.minutos.toString().padStart(2, "0")
    }:${contador.segundos.toString().padStart(2, "0")}`;
  }

  return (
    <div className="flex flex-row gap-2 justify-center items-center sm:mt-3 w-full">
      {showFullButtons && (
        <button
          onClick={generarBoletin}
          disabled={generando || !!errorGen}
          className={`w-[220px] sm:w-[210px] min-h-[40px] sm:min-h-[44px] min-w-[100px] flex items-center justify-center gap-1 bg-[#006168] text-white px-2 py-1 sm:px-3 sm:py-1 rounded-md hover:bg-[#0f2c6b] disabled:opacity-50 transition text-sm sm:text-sm ${errorGen ? 'bg-[#e10914] hover:bg-[#e10914]' : ''}`}
        >
          {generando ? (
            "Generando PDF..."
          ) : errorGen ? ( 
            "Error al generar PDF"
          ) : (
            "Descargar Boletín📄"
          )}
        </button>
      )}
      <div className="flex flex-col items-center justify-center">
        <button
          onClick={ejecutarWebhook}
          disabled={ejecutandoWebhook || !!webhookError || (hayNoticias && contador !== null)}
          className={`w-[150px] sm:w-[210px] min-h-[40px] sm:min-h-[44px] min-w-[100px] flex flex-col items-center justify-center gap-1 bg-[#e10914] text-white px-2 py-1 sm:px-3 sm:py-1 rounded-md hover:ring-[#006168] disabled:opacity-50 transition text-sm sm:text-sm relative ${webhookError ? 'bg-[#e10914] hover:bg-[#e10914]' : ''}`}
        >
          {hayNoticias && contador !== null ? (
            <>
              <span className="block sm:hidden text-[#006168] text-xs font-semibold leading-tight mt-0.5">
                Disponible en {contador.horas.toString().padStart(2, "0")}:{contador.minutos.toString().padStart(2, "0")}:{contador.segundos.toString().padStart(2, "0")}
              </span>
              <span className="hidden sm:block text-white text-xs font-semibold leading-tight mt-0.5">
                Próxima extracción disponible en {contador.horas.toString().padStart(2, "0")}:{contador.minutos.toString().padStart(2, "0")}:{contador.segundos.toString().padStart(2, "0")}
              </span>
            </>
          ) : (
            extraccionLabel
          )}
        </button>
      </div>
    </div>
  );
}