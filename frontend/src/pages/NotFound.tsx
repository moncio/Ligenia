
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm text-center animate-fade-in-up">
        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8">
          <span className="text-4xl font-bold text-blue-600">404</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900">Página no encontrada</h1>
        <p className="text-gray-600 mb-8">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        <a 
          href="/" 
          className="inline-flex items-center justify-center py-3 px-6 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors duration-200"
        >
          <Home size={18} className="mr-2" />
          Volver al inicio
        </a>
      </div>
    </div>
  );
};

export default NotFound;
