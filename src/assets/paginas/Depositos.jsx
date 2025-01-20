
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Modal from 'react-modal';
import { FaRegEye } from 'react-icons/fa';
import FondoPaginas from '../components/fondospagina/FondoPaginas';
import Navbar from '../components/Navbar';
import CardClientes from '../components/CardClientes';
import Title from '../components/Title';
import { HiCreditCard } from "react-icons/hi2";
import { BsFillCalendarDateFill } from "react-icons/bs";
import { GiTicket } from "react-icons/gi";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import * as XLSX from 'xlsx';


export default function Depositos() {
    //const { proyectoId } = useParams();
    const [lotes, setLotes] = useState(undefined);
    const [todo, setTodo] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({ descripcion: '', fechaInicio: '', fechaFin: '', operacionesBancarias: '' });
    const [debouncedFilters, setDebouncedFilters] = useState(filters);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [addModalIsOpen, setAddModalIsOpen] = useState(false);
    const [selectedLote, setSelectedLote] = useState(null);
    const [newLote, setNewLote] = useState({
        fecha: '',
        descripcion: '',
        operacionesBancarias: '',
        arch: '',
        dinero: 0,
    });

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const openConfirmModal = () => {
        setIsConfirmModalOpen(true);
        setModalIsOpen(false);
    }

    const closeConfirmModal = () => setIsConfirmModalOpen(false);

    const [projectName, setProjectName] = useState(''); // Estado para el nombre del proyecto
    const API_URL = import.meta.env.VITE_API_URL;
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        const role = localStorage.getItem('role');
        if (role) {
            setUserRole(role);
        }
    }, []);

    // Fetch del nombre del proyecto
    /*
    useEffect(() => {
        const fetchProjectName = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_URL}/proyectos/${proyectoId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                },
                );
                const data = await response.json();
                setProjectName(data.nombre); // Asume que el objeto tiene una propiedad "nombre"
            } catch (error) {
                console.error('Error fetching project name:', error);
            }
        };

        fetchProjectName();
    }, [proyectoId]);
    */

    // Debounce para filtros
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedFilters(filters);
        }, 300);

        return () => clearTimeout(handler);
    }, [filters]);

    const fetchLotes = async (page = 1) => {
        const query = new URLSearchParams({
            page,
            limit: 10,
            ...debouncedFilters,
        }).toString();

        try {
            const token = localStorage.getItem('token')
            const response = await fetch(
                `${API_URL}/depositos?${query}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            const data = await response.json();
            setLotes(data.depositos);
            setTotalPages(data.totalPages);
            setCurrentPage(data.currentPage);
        } catch (error) {
            console.error('Error fetching lotes separados:', error);
        }
    };

    useEffect(() => {
        fetchLotes(currentPage);
    }, [debouncedFilters, currentPage]);

    const fetchTodo = async () => {
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(
                `${API_URL}/todosd`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            const data = await response.json();
            setTodo(data.lotes);
        } catch (error) {
            console.error('Error fetching lotes separados:', error);
        }
    };
    useEffect(() => {
        fetchTodo();
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
        setCurrentPage(1);
    };

    const handleOpenModal = (lote) => {
        setSelectedLote(lote);
        setModalIsOpen(true);
    };

    const handleCloseModal = () => {
        setModalIsOpen(false);
        setSelectedLote(null);
    };


    const handleSaveChanges = async () => {
        if (!selectedLote) return;
    
        try {
            const token = localStorage.getItem('token');
    
            const formattedLote = {
                ...selectedLote,
                fecha: selectedLote.fecha ? selectedLote.fecha.split('/').reverse().join('-') : '', // Convertir dd/MM/yyyy -> yyyy-MM-dd
            };
    
            const response = await fetch(`${API_URL}/depositos/${selectedLote.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formattedLote),
            });
    
            if (!response.ok) throw new Error('Error al guardar los cambios.');
            toast.success("Actualizado satisfactoriamente");
    
            fetchLotes(currentPage); // Refresca los datos
            handleCloseModal();
        } catch (error) {
            console.error(error);
            alert('Error al guardar los cambios.');
        }
    };
    

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        let newValue = value;
        if (name === 'fecha') {
            const [day, month, year] = value.split('-'); // Suponiendo que el usuario ingresa dd-MM-yyyy
            newValue = `${year}-${month}-${day}`; // Convertirlo a yyyy-MM-dd
        }
        if (name === 'operacionesBancarias') {
            newValue = value.replace(/\D/g, ''); // Eliminar caracteres no numéricos
        }

        if (name === 'dinero') {
            // Permitir solo números y un solo punto decimal
            newValue = value.replace(/[^0-9.]/g, '');

            // Evita múltiples puntos decimales
            if ((newValue.match(/\./g) || []).length > 1) {
                newValue = newValue.slice(0, -1);
            }

            // Evita que inicie con un punto sin un número antes
            if (newValue.startsWith('.')) {
                newValue = '0' + newValue;
            }

            // Convierte a número flotante y previene valores negativos
            if (newValue && parseFloat(newValue) < 0) {
                newValue = '0';
            }
        }


        setSelectedLote({ ...selectedLote, [name]: newValue });
    };


    //abrir y cerrar mosales
    const handleOpenAddModal = () => {
        setAddModalIsOpen(true);
    };

    const handleCloseAddModal = () => {
        setAddModalIsOpen(false);
        setNewLote({
            fecha: '',
            descripcion: '',
            operacionesBancarias: '',
            arch: '',
            dinero: 0,

        });
    };

    const handleAddLote = async () => {
        try {
            const token = localStorage.getItem('token');
    
            const formattedLote = {
                ...newLote,
                fecha: newLote.fecha ? newLote.fecha.split('/').reverse().join('-') : '', // Convertir dd/MM/yyyy -> yyyy-MM-dd
            };
    
            const response = await fetch(`${API_URL}/depositos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formattedLote),
            });
    
            if (!response.ok) throw new Error('Error al agregar el nuevo lote.');
            toast.success("Creado satisfactoriamente");
    
            fetchLotes(currentPage);
            handleCloseAddModal();
        } catch (error) {
            console.error(error);
            alert('Error al agregar el nuevo lote.');
        }
    };
    

    const handleDeleteLote = async () => {
        if (!selectedLote) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/depositos/${selectedLote.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            toast.success("Lote eliminado correctamente.");
            fetchLotes(currentPage); // Refresca la lista de lotes
            closeConfirmModal();
        } catch (error) {
            console.error(error);
            toast.error("Error al eliminar el lote.");
        }
    };

    const handleDownloadExcel = () => {
        // Clonar y ordenar los datos por "tarea" alfabéticamente
        const sortedData = [...todo].sort((a, b) => b.id - a.id);

        // Filtrar campos no deseados y formatear los valores monetarios
        const filteredData = sortedData.map(({ id, operacionesBancarias, dinero, ...rest }) => ({
            ...rest,
            operacionesBancarias: operacionesBancarias ? `N° ${operacionesBancarias}` : "S/. 0",
            dinero: dinero ? `S/. ${dinero}` : "S/. 0"
        }));

        // Crear una hoja de trabajo
        const ws = XLSX.utils.json_to_sheet(filteredData);

        // Obtener la lista de claves para aplicar estilos a los encabezados
        const headerKeys = Object.keys(filteredData[0] || {});

        // Aplicar estilos a los encabezados (requiere complemento para que funcione en Excel)
        const range = XLSX.utils.decode_range(ws["!ref"]);
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
            if (ws[cellAddress]) {
                ws[cellAddress].s = {
                    font: { bold: true, color: { rgb: "FFFFFF" } }, // Texto blanco en negrita
                    fill: { fgColor: { rgb: "4F81BD" } }, // Fondo azul
                    alignment: { horizontal: "center", vertical: "center" } // Centrar texto
                };
            }
        }

        // Aplicar un marco a toda la tabla
        ws["!cols"] = headerKeys.map(() => ({ wch: 20 })); // Ajustar ancho de columnas

        // Crear un libro de trabajo
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Informes");

        // Descargar el archivo
        XLSX.writeFile(wb, "informes.xlsx");
    };

    return (
        <>
            <FondoPaginas>
                <Navbar />

                <CardClientes>

                    <div className="container mx-auto">
                        {/*<h1 className="text-xl font-bold mb-4">Lotes Separados</h1> */}
                        <Title>Depositos </Title>
                        <div className='flex flex-grap justify-center items-center gap-4 mb-6'>
                            <div className="flex items-center space-x-2">
                                <HiCreditCard size={24} className="text-green-600" />
                                <input
                                    type="text"
                                    name="descripcion"
                                    placeholder="Buscar por descripción"
                                    value={filters.descripcion}
                                    onChange={handleFilterChange}
                                    className="border p-2 rounded"
                                />
                            </div>
                        </div>

                        <div className='flex flex-grap justify-center items-center gap-4 mb-6'>
                            <div className="flex items-center space-x-2">
                                <GiTicket size={24} className="text-green-600" />
                                <input
                                    type="number"
                                    name="operacionesBancarias"
                                    placeholder="Buscar N° Operación"
                                    value={filters.operacionesBancarias}
                                    onChange={handleFilterChange}
                                    className="border p-2 rounded"
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-center items-center gap-4 mb-2">
                            {/* Filtros */}


                            <div className="flex items-center space-x-2">
                                <BsFillCalendarDateFill size={24} className="text-dark" />

                                <input
                                    type="date"
                                    name="fechaInicio"
                                    value={filters.fechaInicio}
                                    onChange={handleFilterChange}
                                    className="border p-2 rounded"
                                />
                                <span>a</span>
                                <input
                                    type="date"
                                    name="fechaFin"
                                    value={filters.fechaFin}
                                    onChange={handleFilterChange}
                                    className="border p-2 rounded"
                                />
                            </div>

                        </div>


                        {userRole === 'admin' && (
                            <div className='flex flex-wrap gap-2 mb-2'>
                                <button
                                    onClick={handleOpenAddModal}
                                    className="text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 shadow-lg shadow-green-500/50 dark:shadow-lg dark:shadow-green-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-4"
                                >
                                    Añadir Deposito
                                </button>
                                <button
                                    onClick={handleDownloadExcel}
                                    className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-4 ml-auto"
                                >
                                    Descargar Excel
                                </button>
                            </div>
                        )}


                        <div className="overflow-x-auto">
                            {/* Tabla */}
                            {userRole === 'admin' && (
                                <table className="min-w-full bg-white bg-opacity-75 border">
                                    <thead>
                                        <tr className="bg-gray-200 text-gray-600 uppercase text-sm">
                                            <th className="border px-4 py-2 text-center">Fecha</th>
                                            <th className="border px-4 py-2 text-center">Descripción</th>
                                            <th className="border px-4 py-2 text-center">Op Bancaria</th>
                                            <th className="border px-4 py-2 text-center">Arch</th>
                                            <th className="border px-4 py-2 text-center">Dinero</th>
                                            <th className="border px-4 py-2 text-center">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lotes && lotes.length > 0 ? (
                                            lotes.map((lote) => (
                                                <tr key={lote.id}>
                                                    <td className="border px-4 py-2 text-center">{lote.fecha}</td>
                                                    <td className="border px-4 py-2 text-center">{lote.descripcion}</td>
                                                    <td className="border px-4 py-2 text-center">N° {lote.operacionesBancarias}</td>
                                                    <td className="border px-4 py-2 text-center">N° {lote.arch}</td>
                                                    <td className="border px-4 py-2 text-center">S/. {lote.dinero}</td>
                                                    <td className="border px-4 py-2 text-center">
                                                        <div className="flex justify-center items-center">
                                                            <FaRegEye
                                                                onClick={() => handleOpenModal(lote)}
                                                                aria-label="View details"
                                                                className="cursor-pointer"
                                                                size={20}
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="8" className="text-center p-4">
                                                    No se encontraron datos.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Paginación */}
                        {userRole === 'admin' && (
                            <div className="flex justify-center mt-4">
                                <button
                                    onClick={() => fetchLotes(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                                >
                                    Anterior
                                </button>
                                <span className="px-4 py-2">{`Página ${currentPage} de ${totalPages}`}</span>
                                <button
                                    onClick={() => fetchLotes(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                                >
                                    Siguiente
                                </button>
                            </div>
                        )}
                        {userRole !== 'admin' && (

                            <div>
                                <br />
                                <h1 className='text-center font-mono'>No deverias estar Aquí</h1>
                            </div>
                        )}


                        <Modal
                            isOpen={isConfirmModalOpen}
                            onRequestClose={closeConfirmModal}
                            className="bg-white p-6 rounded-lg shadow-lg max-w-sm mx-auto"
                            overlayClassName="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center"
                        >
                            <h2 className="text-lg font-bold mb-4">Confirmar Eliminación</h2>
                            <p className="mb-4 text-gray-600">
                                ¿Estás seguro de que quieres eliminar este lote? Esta acción no se puede deshacer.
                            </p>
                            <div className="flex justify-end space-x-2">
                                <button
                                    className="text-white bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-gray-300 dark:focus:ring-gray-800 shadow-lg shadow-gray-500/50 dark:shadow-lg dark:shadow-gray-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                                    onClick={closeConfirmModal}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                                    onClick={handleDeleteLote}
                                >
                                    Sí, eliminar
                                </button>
                            </div>
                        </Modal>

                        {/* Modal */}
                        <Modal
                            isOpen={modalIsOpen}
                            onRequestClose={handleCloseModal}
                            contentLabel="Edit Manzana Modal"
                            className="max-w-xl mx-auto mt-20 bg-white rounded-lg shadow-lg overflow-hidden"
                            overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
                        >
                            <div className="p-8">
                                <h2 className="text-lg font-bold mb-4">Editar Depósito</h2>
                                {selectedLote && (
                                    <form>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium">Fecha</label>
                                                <input
                                                    type="date"
                                                    name="fecha"
                                                    placeholder="Fecha"
                                                    value={selectedLote?.fecha?.substring(0, 10)}
                                                    onChange={handleInputChange}
                                                    className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
                                                />
                                            </div>


                                            <div>
                                                <label className="block text-sm font-medium">Tipo de Operación</label>
                                                <input
                                                    type="text"
                                                    name="descripcion"
                                                    placeholder="Descripcion"
                                                    value={selectedLote.descripcion}
                                                    onChange={handleInputChange}
                                                    className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium">Operaciones Bancarias</label>
                                                <input
                                                    type="text"
                                                    name="operacionesBancarias"
                                                    placeholder="N° op Bancaria"
                                                    value={selectedLote.operacionesBancarias}
                                                    onChange={handleInputChange}
                                                    className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium">ARCH</label>
                                                <input
                                                    type="text"
                                                    name="arch"
                                                    placeholder="1"
                                                    value={selectedLote.arch}
                                                    onChange={handleInputChange}
                                                    className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium">Dinero Depositado S/.</label>
                                                <input
                                                    type="number"
                                                    name="dinero"
                                                    placeholder="Dinero"
                                                    min="0"
                                                    value={selectedLote.dinero}
                                                    onChange={handleInputChange}
                                                    className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
                                                />
                                            </div>

                                        </div>
                                        <div className="flex justify-end mt-4">
                                            <button
                                                type="button"
                                                onClick={handleSaveChanges}
                                                className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 "
                                            >
                                                Guardar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={openConfirmModal} // Llamamos a la función eliminar
                                                className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                                            >
                                                Eliminar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleCloseModal}
                                                className="text-white bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-gray-300 dark:focus:ring-gray-800 shadow-lg shadow-gray-500/50 dark:shadow-lg dark:shadow-gray-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>


                        </Modal>
                        {/* Modal para añadir lote */}
                        <Modal
                            isOpen={addModalIsOpen}
                            onRequestClose={handleCloseAddModal}
                            contentLabel="Edit Manzana Modal"
                            className="max-w-xl mx-auto mt-20 bg-white rounded-lg shadow-lg overflow-hidden"
                            overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
                        >
                            <div className="p-8">
                                <h2 className="text-lg font-bold mb-4">Crear Depósito</h2>
                                <form>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium">Fecha</label>
                                            <input
                                                type="date"
                                                name="fecha"
                                                placeholder="Fecha"
                                                value={newLote.fecha}
                                                onChange={(e) => setNewLote({ ...newLote, fecha: e.target.value })}
                                                className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium">Tipo de Operación</label>
                                            <input
                                                type="text"
                                                name="descripcion"
                                                placeholder="Descripcion"
                                                value={newLote.descripcion}
                                                onChange={(e) => setNewLote({ ...newLote, descripcion: e.target.value })}
                                                className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium">ARCH</label>
                                            <input
                                                type="text"
                                                name="arch"
                                                placeholder="1"
                                                value={newLote.arch}
                                                onChange={(e) => setNewLote({ ...newLote, arch: e.target.value })}
                                                className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium">Operaciones Bancarias</label>
                                            <input
                                                type="text"
                                                name="operacionesBancarias"
                                                placeholder="N° op Bancaria"
                                                value={newLote.operacionesBancarias}
                                                //onChange={(e) => setNewLote({ ...newLote, operacionesBancarias: e.target.value })}
                                                onChange={(e) => {

                                                    const { name, value } = e.target;
                                                    setNewLote((prev) => ({
                                                        ...prev,
                                                        [name]: name === 'operacionesBancarias' ? value.replace(/\D/g, '') : value,
                                                    }));
                                                }}
                                                className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium">Dinero Depositado S/.</label>
                                            <input
                                                type="number"
                                                name="dinero"
                                                placeholder="Dinero"
                                                value={newLote.dinero}
                                                onChange={(e) => {
                                                    let value = e.target.value;

                                                    // Permitir solo números y un punto decimal
                                                    if (!/^\d*\.?\d*$/.test(value)) return;

                                                    // Evitar múltiples puntos decimales
                                                    if ((value.match(/\./g) || []).length > 1) return;

                                                    // Evitar que comience con un punto sin número antes
                                                    if (value.startsWith('.')) {
                                                        value = '0' + value;
                                                    }

                                                    // Evitar valores negativos
                                                    if (parseFloat(value) < 0) value = "0";

                                                    setNewLote({ ...newLote, dinero: value });
                                                }}
                                                min="0" // También evita valores negativos al usar las flechas del input
                                                step="0.01" // Permite valores decimales
                                                className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
                                            />
                                        </div>

                                    </div>
                                    <div className="flex justify-end mt-4">
                                        <button
                                            onClick={handleCloseAddModal}
                                            className="text-white bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-gray-300 dark:focus:ring-gray-800 shadow-lg shadow-gray-500/50 dark:shadow-lg dark:shadow-gray-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleAddLote}
                                            className="text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 shadow-lg shadow-green-500/50 dark:shadow-lg dark:shadow-green-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                                        >
                                            Añadir
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </Modal>
                    </div>
                </CardClientes>
                <ToastContainer />
            </FondoPaginas>
        </>

    );
}
