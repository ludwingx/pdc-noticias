import Navbar from "@/components/Navbar";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "PDC Noticias",
  description: "Aplicación para aprobar o rechazar noticias de Rodrigo Paz, Edman Lara y otras noticias relevantes para su posterior descarga de PDC del boletín de noticias aprobadas del Partido Demócrata Cristiano (PDC)",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
