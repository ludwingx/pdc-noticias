"use client";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { CiLogout } from "react-icons/ci";
import { MdWarningAmber, MdClose } from "react-icons/md";

export default function SignOutButton() {
  const [showModal, setShowModal] = useState(false);

  const handleSignOut = () => setShowModal(true);

  const confirmSignOut = () => {
    setShowModal(false);
    signOut({ callbackUrl: "/" });
  };

  const cancelSignOut = () => setShowModal(false);

  const onModalContentClick = (e) => e.stopPropagation();

  return (
    <>
      <button
        onClick={handleSignOut}
        className="flex items-center gap-2 text-[#006168] hover:text-[#da0b0a] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#123488] focus:ring-offset-2 rounded"
        aria-haspopup="dialog"
        aria-expanded={showModal}
        aria-controls="signout-modal"
      >
        Cerrar sesión
        <CiLogout size={22} />
      </button>

      {showModal && (
        <div
          id="signout-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="signout-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm animate-fade-in"
          onClick={cancelSignOut}
        >
          <div
            onClick={onModalContentClick}
            className="relative bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center animate-modal-pop"
          >
            <button
              onClick={cancelSignOut}
              className="absolute top-3 right-3 text-gray-400 hover:text-[#da0b0a] transition-colors focus:outline-none focus:ring-2 focus:ring-[#da0b0a] rounded"
              aria-label="Cerrar diálogo"
            >
              <MdClose size={22} />
            </button>

            <div className="flex flex-col items-center mb-6">
              <MdWarningAmber size={48} className="text-[#da0b0a] mb-3" />
              <h2
                id="signout-title"
                className="mb-2 text-black font-semibold text-xl"
              >
                ¿Estás seguro que quieres salir?
              </h2>
              <p className="text-gray-600 text-sm max-w-lg">
                Tu sesión se cerrará y deberás volver a iniciar sesión para
                acceder nuevamente.
              </p>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={confirmSignOut}
                className="flex items-center gap-2 px-4 py-1.5 rounded bg-[#da0b0a] text-white hover:bg-[#b30a08] focus:outline-none focus:ring-4 focus:ring-[#da0b0a]/70 font-semibold transition-colors"
              >
                <CiLogout size={18} />
                Sí, salir
              </button>
              <button
  onClick={cancelSignOut}
  className="flex items-center gap-2 px-4 py-1.5 rounded bg-white border border-[#123488] text-[#123488] hover:bg-[#e6f0ff] focus:outline-none focus:ring-4 focus:ring-[#123488]/50 font-semibold transition-colors"
>
  <MdClose size={18} />
  Cancelar
</button>

            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.25s ease forwards;
        }
        @keyframes modal-pop {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-modal-pop {
          animation: modal-pop 0.25s ease forwards;
        }
      `}</style>
    </>
  );
}
