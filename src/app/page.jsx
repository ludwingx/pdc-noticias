"use client";

import { useSession } from "next-auth/react";

function HomePage() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden flex flex-col justify-between items-center bg-gradient-to-br from-white via-blue-50 to-white px-4 sm:px-6 md:px-8">
      {/* Main centrado entre navbar y footer */}
      <main className="flex flex-col items-center justify-center gap-6 text-center flex-grow">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
          Panel de Noticias
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed max-w-md">
          Administra noticias: revisa, aprueba y genera boletines informativos de forma fácil y rápida.
        </p>

        <a
          href={session ? "/dashboard" : "/auth/login"}
          className="inline-block rounded-full bg-[#1a3680] px-6 sm:px-8 py-2 text-white text-sm sm:text-base font-semibold shadow-md hover:bg-[#163065] focus:outline-none focus:ring-4 focus:ring-[#1a3680]/50 transition"
        >
          {session ? "Ver noticias" : "Iniciar sesión"}
        </a>
      </main>

      {/* Footer con menos padding para evitar scroll */}
      <footer className="py-3 text-center text-xs sm:text-sm text-gray-500 w-full">
        &copy; {new Date().getFullYear()} Intelexia Labs
      </footer>
    </div>
  );
}

export default HomePage;
