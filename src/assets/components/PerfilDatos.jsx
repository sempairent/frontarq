import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import Navbar from './Navbar';
import FondoPaginas from '../components/fondospagina/FondoPaginas';
import { fetchUserProfile, updateUserProfile } from '../../../public/apis/apiService.js';
import ModalEditProfile from './ModalEditProfile.jsx';
import 'react-toastify/dist/ReactToastify.css';
import { AiOutlineUser, AiOutlineMail } from 'react-icons/ai';
import { Link } from 'react-router-dom';

export default function PerfilDatos() {
  const [userData, setUserData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: ''
  });
  const [originalUserData, setOriginalUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('');

  //const role = localStorage.getItem('role');
  //setUserRole(role);
  useEffect(()=>{
    const role = localStorage.getItem('role');
    setUserRole(role);

  },[])

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchUserProfile();
        setUserData(data);
        setOriginalUserData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError('Error al cargar los datos del usuario');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getUpdatedFields = () => {
    const updatedFields = {};
    Object.keys(userData).forEach(key => {
      if (userData[key] !== originalUserData[key]) {
        updatedFields[key] = userData[key];
      }
    });
    return updatedFields;
  };

  const handleSaveEdit = async () => {
    const updatedFields = getUpdatedFields();
    if (Object.keys(updatedFields).length === 0) {
      toast.info('No se han realizado cambios.');
      return;
    }

    try {
      await updateUserProfile(userData.id, updatedFields);
      toast.success('Datos actualizados correctamente');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating user data:', error);
      toast.error('Ocurrió un error al actualizar los datos');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.info('Has cerrado sesión');
    navigate('/login');
  };

  return (
    <FondoPaginas>
      <Navbar />
      <div className="w-full min-h-screen flex items-start justify-center mt-4 ">
        <ToastContainer />
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl p-8">
          {/* Gradientes elegantes */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-violet-300 via-stone-200 to-white opacity-80 z-0"></div>
          <div className="relative z-10 p-8 md:p-20">
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 overflow-hidden bg-gradient-to-r from-gray-400 to-gray-800 rounded-full mb-6 shadow-lg">
                <AiOutlineUser className="w-full h-full text-white p-8" />
              </div>

              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-gray-700 mb-2">
                  {userData.firstName}
                </h2>
                <p className="text-xl font-medium text-gray-500 mb-2">
                  {userData.lastName}
                </p>
                <div className="flex items-center justify-center text-gray-600">
                  <AiOutlineMail className="mr-2" />
                  <p className="text-md">{userData.email}</p>
                </div>
              </div>

              <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 w-full justify-center">
                {userRole === 'admin' &&(
                  <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-teal-700 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600 transition duration-300 shadow-md"
                >
                  Editar Perfil
                </button>
                )}
                {userRole === 'admin' &&(
                  <Link to='/UsersControl'>
                  <button
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-700 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition duration-300 shadow-md"
                >
                  Panel de Control
                </button>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-fuchsia-700 to-violet-500 text-white rounded-lg hover:from-violet-500 hover:to-fuchsia-800 transition duration-300 shadow-md"
                >
                  Cerrar sesión
                </button>
              </div>

            </div>
          </div>
        </div>

        <ModalEditProfile
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          userData={userData}
          handleInputChange={(e) => setUserData({ ...userData, [e.target.name]: e.target.value })}
          handleSaveEdit={handleSaveEdit}
        />
      </div>
    </FondoPaginas>
  );
}
