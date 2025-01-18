import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import sideImage from '../images/merge.avif';
import sideImage2 from '../images/logo1.png';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FondoLogin from '../components/Fondos/FondoLogin';
import { login } from '../../../public/apis/apiService'

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        //login api rest .
        try {
            //llamado de api
            await login(email, password);
            toast.success('Inicio Exitoso')

            setTimeout(() => {
                navigate('/')
            }, 1000);

        } catch (error) {
            toast.error(error.message)
        }

    };

    return (
        <FondoLogin>
            <div className="md:backdrop-sepia-0 md:bg-white/15 shadow-lg rounded-lg w-full max-w-lg md:max-w-4xl md:h-auto md:p-8 p-5 flex flex-col justify-center">
                <div className="flex flex-col md:flex-row h-full sm:flex-col">

                    {/* Lado izquierdo */}
                    <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
                        {/* Imagen en la parte superior */}
                        <div className="flex justify-center mb-6">
                            <img src={sideImage2} alt="JINGEC" className="w-400 h-40 object-contain" />
                        </div>
                        <h2 className="text-3xl text-white font-semibold mb-6">Inicia sesión aquí</h2>
                        <form onSubmit={handleLogin}>
                            <div className="mb-4">
                                <label className="text-white block text-sm font-semibold mb-2">Correo electrónico</label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-2 border border-gray-500 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-6">
                                <label className="text-white block text-sm font-semibold mb-2">Contraseña</label>
                                <input
                                    type="password"
                                    className="w-full px-4 py-2 border border-gray-500 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="w-full px-6 py-2 text-white rounded-md shadow-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:bg-gradient-to-b shadow-blue-400 hover:shadow-xl hover:shadow-blue-900 transition">
                                Iniciar Sesión
                            </button>
                        </form>
                    </div>
                    {/* Lado derecho con imagen de fondo */}
                    <div
                        className="w-full md:w-1/2 h-64 md:h-auto bg-cover bg-center flex items-center justify-center sm:h-40 sm:w-full"
                        style={{
                            backgroundImage: `url(${sideImage})`,
                            backgroundSize: 'contain',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                        }}
                    >
                    </div>
                </div>
            </div>

            <ToastContainer />
        </FondoLogin>
    );
}

export default Login;
