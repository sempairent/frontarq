import React from 'react';
import './Glitch.css';  // Efecto del glitch para el fondo
import './ButtonGlitch.css';  // Efecto específico para el botón
import { Link } from 'react-router-dom';

const Error404 = () => {
  return (
    <div className="error-page">
      <div className="glitch-wrapper">
        <div className="glitch-text">
          ERROR 404: <br />
          Página no encontrada
        </div>
      </div>
      <div className="flex justify-center mt-4">
        <Link to="/">

        <button className="glitch-button bg-black hover:bg-black  text- font-bold py-2 px-4 border-b-4 border-black hover:border-black rounded">
  Volver al Inicio
</button>
        </Link>
      </div>
    </div>
  );
};

export default Error404;
