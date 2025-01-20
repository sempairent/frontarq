import { useState, useEffect } from 'react';
import { FaBars, FaTimes, FaUser } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import logo from '../images/logo1.png';


const navLinks = [
    { title: 'Inicio', url: '/' },
    { title: 'Proyectos', url: '/proyecto' },
    { title: 'Informes', url: '/Informes' },
    { title: 'Plano', url: '/Plano/1' }
];




const Navbar = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 769);
    const [showModal, setShowModal] = useState(false);
    const [user, setUser] = useState({ firstName: '', lastName: '' });
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        const role = localStorage.getItem('role');
        
        if (role) {
            setUserRole(role);
        }
    }, []); 
    

    useEffect(() => {
        const firstName = localStorage.getItem('firstName');
        const lastName = localStorage.getItem('lastName');
        if (firstName && lastName) {
            setUser({ firstName, lastName });
        }
    }, []);



    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 769);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const toggleModal = () => {
        setShowModal(!showModal);
    };

    return (
        <>
            <nav className="w-full fixed top-0 left-0 z-50 bg-black bg-opacity-80">
                <div className="flex justify-between items-center px-6 py-7">
                    <div className="flex items-center">

                        <Link to="/">
                            <img src={logo} alt="Logo" className="h-20 w-auto mr-2 fixed top-1 left-20 z-10" />
                        </Link>
                    </div>
                    <div className="hidden md:flex gap-8">
                        {navLinks.map((link, index) => (
                            <Link key={index} to={link.url} className="text-white text-lg hover:underline">
                                {link.title}
                            </Link>
                        ))}
                        {userRole === 'admin' && (
                                <Link to="/Depositos" className="text-white text-lg hover:underline" onClick={toggleModal}>
                                    Depositos
                                </Link>
                            )}
                        <div className='flex items-center text-white gap-2 md:gap-4'>
                            <Link to="/perfil"> <FaUser className='text-lg md:text-xl' /></Link>
                            <div className='flex flex-col text-sm md:text-base'>
                                <Link to="/perfil">
                                    <span className='truncate'>{user.firstName}</span>


                                </Link>
                                <Link to="/perfil">

                                    <span className='truncate'>{user.lastName}</span>

                                </Link>
                            </div>
                        </div>


                    </div>
                    <div className="md:hidden text-white cursor-pointer" onClick={toggleModal}>
                        <FaBars size={24} />
                    </div>
                </div>

                {isMobile && showModal && (
                    <div className="fixed inset-0 flex justify-center items-center z-50 bg-gray-900 bg-opacity-90">
                        <div className="absolute top-4 right-4 text-white cursor-pointer">
                            <FaTimes size={24} onClick={toggleModal} />
                        </div>
                        <div className='absolute top-4 left-4 flex items-center text-white gap-2 md:gap-4'>
                            <Link to="/perfil"><FaUser className='text-lg md:text-xl' /></Link>
                            <div className='flex flex-col text-sm md:text-base'>
                                <Link to="/perfil">
                                    <span className='truncate'>{user.firstName}</span>

                                </Link>
                                <Link to="/perfil">

                                    <span className='truncate'>{user.lastName}</span>
                                </Link>

                            </div>

                        </div>


                        <div className="flex flex-col gap-6 text-center">
                            {navLinks.map((link, index) => (
                                <Link key={index} to={link.url} className="text-white text-2xl font-light" onClick={toggleModal}>
                                    {link.title}
                                </Link>
                            ))}
                            {userRole === 'admin' && (
                                <Link to="/Depositos" className="text-white text-2xl font-light" onClick={toggleModal}>
                                    Depositos
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </nav>
            <br /><br />
            <br />
            <br />
        </>
    );
};

export default Navbar;