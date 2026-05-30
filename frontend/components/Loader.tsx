export default function Loader() {
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <div className="relative">
        {/* Círculo exterior con gradiente */}
        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-indigo-600"></div>
        {/* Círculo interior */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="animate-pulse text-4xl">🏠</div>
        </div>
      </div>
      <p className="mt-4 text-gray-600 font-medium">Cargando...</p>
    </div>
  );
}
