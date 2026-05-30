export default function Home() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center space-y-8 px-4">
        {/* Hero principal */}
        <div className="space-y-4">
          <div className="inline-block animate-bounce">
            <span className="text-8xl">🏠</span>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
            Roomies Chile
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 max-w-2xl mx-auto">
            Encuentra el roommate perfecto y el lugar ideal para vivir
          </p>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <a
            href="/listings"
            className="group bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-indigo-500/50 transform hover:-translate-y-1 transition-all duration-200 flex items-center space-x-2"
          >
            <span>Ver publicaciones</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </a>
          <a
            href="/register"
            className="bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-xl font-bold text-lg shadow-lg border-2 border-gray-200 hover:border-indigo-300 transform hover:-translate-y-1 transition-all duration-200"
          >
            Registrarse
          </a>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto pt-16">
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="font-bold text-lg mb-2 text-gray-900">Búsqueda fácil</h3>
            <p className="text-gray-600 text-sm">Encuentra habitaciones en tu comuna ideal</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-3">💰</div>
            <h3 className="font-bold text-lg mb-2 text-gray-900">Precios claros</h3>
            <p className="text-gray-600 text-sm">Sin sorpresas, todo incluido desde el inicio</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-3">👥</div>
            <h3 className="font-bold text-lg mb-2 text-gray-900">Comunidad</h3>
            <p className="text-gray-600 text-sm">Conecta con roommates compatibles</p>
          </div>
        </div>
      </div>
    </div>
  );
}
