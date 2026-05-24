import "./globals.css";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gray-50 text-gray-800 min-h-screen flex flex-col">
        {/* Navbar */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-blue-600">Roomies Chile</h1>
            <nav className="space-x-6">
              <Link href="/listings" className="hover:text-blue-600">Publicaciones</Link>
              <Link href="/listings/new" className="hover:text-blue-600">Crear</Link>
              <Link href="/profile" className="hover:text-blue-600">Perfil</Link>
            </nav>
          </div>
        </header>

        {/* Contenido principal */}
        <main className="flex-1 max-w-4xl mx-auto px-4 py-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-gray-100 text-center py-4 text-sm text-gray-500">
          © 2026 Roomies Chile · Todos los derechos reservados
        </footer>
      </body>
    </html>
  );
}
