import React, { useState, useEffect } from 'react';
import { FaBars, FaTimes, FaUser } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import logo from '../images/logo1.png';
import bgImage from '../images/image2.jpg';

const navLinks = [
    { title: 'Inicio', url: '/' },
    { title: 'Proyectos', url: '/proyecto' },
    { title: 'Informes', url: '/Informes' },
    { title: 'Plano', url: '/Plano/1' }
];

const NavbarHome = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 769);
    const [showModal, setShowModal] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const [user, setUser] = useState({ firstName: '', lastName: '' });

    const [mainText, setMainText] = useState('');
    const [subText, setSubText] = useState('');

    const fullMainText = ` Bienvenido ${user.firstName} `;
    const fullSubText = 'A la constructora JINGEC ';
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        const role = localStorage.getItem('role');
       
        if (role) {
            setUserRole(role);
        }
    }, []); 

    useEffect(() => {
        let mainIndex = 0;
        let subIndex = 0;

        const typeMainText = () => {
            if (mainIndex < fullMainText.length) {
                setMainText(fullMainText.substring(0, mainIndex + 1));
                mainIndex++;
            } else {
                clearInterval(mainInterval);
                const subInterval = setInterval(() => {
                    if (subIndex < fullSubText.length) {
                        setSubText(fullSubText.substring(0, subIndex + 1));
                        subIndex++;
                    } else {
                        clearInterval(subInterval);
                    }
                }, 100);
            }
        };

        const mainInterval = setInterval(typeMainText, 100);

        return () => {
            clearInterval(mainInterval);
        };
    }, [user.firstName]);

    useEffect(() => {
        const firstName = localStorage.getItem('firstName') || '';
        const lastName = localStorage.getItem('lastName') || '';
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

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > lastScrollY) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }
            setLastScrollY(window.scrollY);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [lastScrollY]);

    const toggleModal = () => {
        setShowModal(!showModal);
    };

    return (
        <header
            className="relative w-full h-screen bg-cover bg-center"
            style={{ backgroundImage: `url(${bgImage})` }}
        >
            <nav className={`w-full fixed top-0 left-0 z-10 bg-black bg-opacity-90 ${isVisible ? 'transform translate-y-0' : 'transform -translate-y-full'}`}>
                <div className="flex justify-between items-center px-6 py-7">
                    <div className="flex items-center">
                        <img src={logo} alt="Logo" className="h-20 w-auto mr-2 fixed top-1 left-20 z-10" />
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
                    </div>

                    <div className="md:hidden text-white cursor-pointer" onClick={toggleModal}>
                        <FaBars size={24} />
                    </div>
                </div>
            </nav>

            {isMobile && showModal && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-80">
                    <div className="absolute top-4 right-4 text-white cursor-pointer">
                        <FaTimes size={24} onClick={toggleModal} />
                    </div>

                    <div className="absolute top-4 left-4 flex items-center text-white gap-2 md:gap-4">
                        <Link to="/perfil"><FaUser className='text-lg md:text-xl' /></Link>
                        <div className='flex flex-col text-sm md:text-base'>
                            <Link to="perfil">
                                <span className='truncate'>{user.firstName}</span>
                            </Link>
                            <Link to="perfil">
                                <span className='truncate'>{user.lastName}</span>
                            </Link>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6 text-center h-full justify-center items-center">
                        {navLinks.map((link, index) => (
                            <Link
                                key={index}
                                to={link.url}
                                className="text-white text-2xl font-light"
                                onClick={toggleModal}
                            >
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

            <div className="flex flex-col items-center justify-center h-full text-center text-white opacity-100 px-14 pb-0">
                <h1 className="text-5xl font-bold mb-8">{mainText}</h1>
                <p className="text-xl mb-12">{subText}</p>
                <Link to="/proyecto" className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-lg px-6 py-4 text-center me-2 mb-2 ">
                    PROYECTOS
                </Link>
            </div>
        </header>
    );
};

export default NavbarHome;
