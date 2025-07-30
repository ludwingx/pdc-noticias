import { useEffect, useState } from "react";

export default function LoadingModal({ timer }) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + "." : ""));
    }, 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center min-w-[300px]">
        <span className="text-lg font-semibold mb-2">
          Buscando noticias{dots}
        </span>
        <span className="text-sm text-gray-600">Tiempo restante: {timer}s</span>
      </div>
    </div>
  );
}