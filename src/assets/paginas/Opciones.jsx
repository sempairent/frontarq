import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Navbar from '../components/Navbar';
import Cardpaginas from '../components/cardPaginas';
import Title from '../components/Title';
import FondoPaginas from '../components/fondospagina/FondoPaginas';
import BackButton from '../components/button/BackButton';


export default function Opciones() {
  const { id } = useParams();
  const proyectoId = id;
  const [proyecto, setProyecto] = useState(null); // Para almacenar los datos del proyecto
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
      const role = localStorage.getItem('role');
      if (role) {
          setUserRole(role);
      }
  }, []); 

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const token = localStorage.getItem('token'); // Asegúrate de que el token esté almacenado en localStorage

    fetch(`${API_URL}/proyectos`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Agrega el token en el encabezado Authorization
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error fetching project data');
        }
        return response.json();
      })
      .then((data) => setProyecto(data))
      .catch((error) => console.error('Error fetching project data:', error));
  }, []);

  // Verifica si los datos están cargados


  return (
    <>
      <FondoPaginas>
        <Navbar />
        {/* Solo muestra el botón BackButton en pantallas pequeñas */}
        <div className="block md:hidden">
          <BackButton />
        </div>
        <Cardpaginas>
          <Title>PROYECTOS</Title>
          <div className="container mx-auto p-4 max-w-screen-lg">
            {/* Botones dinámicos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
              {/* Botón para lotesSeparados */}
              <button
                className="w-full text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br 
      focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 shadow-lg shadow-teal-500/50 
      dark:shadow-lg dark:shadow-teal-800/80 font-bold rounded-lg text-lg px-6 py-4"
                onClick={() => navigate(`/LotesSeparados/${proyectoId}`)}
              >
                Lotes Separados
              </button>

              {/* Botón para lotesVendidos */}
              <button
                className="w-full text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br 
      focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 shadow-lg shadow-teal-500/50 
      dark:shadow-lg dark:shadow-teal-800/80 font-bold rounded-lg text-lg px-6 py-4"
                onClick={() => navigate(`/LotesVendidos/${proyectoId}`)}
              >
                Lotes Vendidos
              </button>

              {/* Botón para depósitos */}
              {userRole === 'admin' && (
                <button
                  className="w-full text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br 
focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 shadow-lg shadow-teal-500/50 
dark:shadow-lg dark:shadow-teal-800/80 font-bold rounded-lg text-lg px-6 py-4"
                  onClick={() => navigate(`/Depositos/${proyectoId}`)}
                >
                  Depósitos
                </button>
              )}


              {/* Botón para Plano */}
              <button
                className="w-full text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br 
      focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 shadow-lg shadow-teal-500/50 
      dark:shadow-lg dark:shadow-teal-800/80 font-bold rounded-lg text-lg px-6 py-4"
                onClick={() => navigate(`/Plano/${proyectoId}`)}
              >
                Plano
              </button>
            </div>
          </div>

        </Cardpaginas>
      </FondoPaginas>
    </>
  );
}
