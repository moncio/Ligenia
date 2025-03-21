
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("Error crítico: Elemento root no encontrado en el DOM");
} else {
  const root = createRoot(rootElement);
  root.render(<App />);
  console.log("Aplicación renderizada correctamente");
}
