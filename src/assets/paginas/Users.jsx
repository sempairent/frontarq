
import { useState, useEffect } from 'react';
//import { data, useActionData, useParams } from 'react-router-dom';
import Modal from 'react-modal';
import { FaRegEye } from 'react-icons/fa';
import FondoPaginas from '../components/fondospagina/FondoPaginas';
import Navbar from '../components/Navbar';
import CardClientes from '../components/CardClientes';
import Title from '../components/Title';
import { GrWorkshop } from "react-icons/gr";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';


export default function Users() {
    //const { proyectoId } = useParams();
    const [lotes, setLotes] = useState([]);
    const [todo, setTodo] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({ email: '' });
    const [debouncedFilters, setDebouncedFilters] = useState(filters);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [addModalIsOpen, setAddModalIsOpen] = useState(false);
    const [selectedLote, setSelectedLote] = useState(null);
    const [errors, setErrors] = useState("");
    const [createErrors, setCreateErrors] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: '',

    });
    const [newLote, setNewLote] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'user',

    });
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const openConfirmModal = () => {
        setIsConfirmModalOpen(true);
        setModalIsOpen(false);
    }

    const closeConfirmModal = () => setIsConfirmModalOpen(false);

    const API_URL = import.meta.env.VITE_API_URL;
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        const role = localStorage.getItem('role');
        if (role) {
            setUserRole(role);
        }
    }, []);


    // Debounce para filtros
    useEffect(() => {

        const handler = setTimeout(() => {
            setDebouncedFilters(filters);
        }, 300);

        return () => clearTimeout(handler);
    }, [filters]);

    const fetchLotes = async (page = 1) => {
        const token = localStorage.getItem('token')
        const query = new URLSearchParams({
            page,
            limit: 10,
            ...debouncedFilters,
        }).toString();

        try {
            const response = await fetch(
                `${API_URL}/users?${query}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            },
            );
            const data = await response.json();
            setLotes(data.users);
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
                `${API_URL}/todosi`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            const data = await response.json();
            setTodo(data.lotes);
        } catch (error) {
            console.error('Error al obtener Informes', error);
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
        resetForm();
    };


    const handleSaveChanges = async () => {
        if (!selectedLote) return;

        const requiredFields = ["email", "firstName", "lastName", "role"];
        const missingFields = requiredFields.filter((field) => !selectedLote[field] || selectedLote[field].toString().trim() === "");

        if (missingFields.length > 0) {
            toast.error("Por favor, completa todos los campos obligatorios.");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/users/${selectedLote.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(selectedLote),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            toast.success("Editado satisfactoriamente");

            fetchLotes(currentPage); // Refresca los datos
            handleCloseModal();
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Procesar campos específicos como 'dni' o 'celular'
        let newValue = value;



        // Actualizar el estado del lote
        setSelectedLote((prev) => ({
            ...prev,
            [name]: newValue,
        }));

        // Validaciones específicas por campo
        const newErrors = { ...errors };
        switch (name) {
            //case "nombre":
            case "email":
            case "firstName":
            case "lastName":
            case "role":
                if (newValue.trim() === "") {
                    newErrors[name] = "Este campo es obligatorio.";
                } else {
                    delete newErrors[name];
                }
                break;
            default:
                break;
        }

        setErrors(newErrors);
    };

    const validateForm = () => {
        const errors = {};

        // Validar cada campo
        if (!newLote.email) errors.email = 'El email es obligatorio';
        if (!newLote.password) errors.password = 'El contraseña es obligatoria';
        if (!newLote.firstName) errors.firstName = 'El nombre es obligatorio';
        if (!newLote.lastName) errors.lastName = 'El apellido es obligatorio';
        if (!newLote.role) errors.role = 'El rol es obligatorio';


        setCreateErrors(errors);
        return Object.keys(errors).length === 0; // Retorna true si no hay errores
    };

    const handleOpenAddModal = () => {
        setAddModalIsOpen(true);
    };

    const handleCloseAddModal = () => {
        setAddModalIsOpen(false);
        setNewLote({
            tarea: '',
            descripcion: '',

        });
        setCreateErrors({});

    };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Definir el regex al inicio
    const handleAddLote = async () => {
        if (!validateForm()) return;
        if (!emailRegex.test(newLote.email)) {
            setCreateErrors((prev) => ({ ...prev, email: "Ingrese un email válido" }));
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...newLote }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            toast.success(data.message);
            fetchLotes(currentPage);
            handleCloseAddModal();
        } catch (error) {
            console.error('Error:', error);
            toast.error(error.message || 'Ocurrió un error inesperado.');
        }
    };

    // Limpiar Modal
    const resetForm = () => {
        setSelectedLote({
            email: '',
            //password: '',
            firstName: '',
            lastName: '',
            role: '',

        });
        setErrors({});
    };

    const handleDeleteLote = async () => {
        if (!selectedLote) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/deleteu/${selectedLote.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            toast.success(data.message);
            fetchLotes(currentPage); // Refresca la lista de lotes
            //handleCloseModal(); // Cierra el modal después de eliminar
            closeConfirmModal();
        } catch (error) {
            console.error(error);
            toast.error("Error al eliminar el lote.");
        }
    };
    //exel
    /*
    const handleDownloadExcel = () => {
        if (lotes.length === 0) {
            toast.error("No hay datos para exportar.");
            return;
        }

        // Crear una hoja de trabajo
        const worksheet = XLSX.utils.json_to_sheet(lotes);

        // Crear un libro de trabajo
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Informes");

        // Descargar el archivo
        XLSX.writeFile(workbook, "Informes.xlsx");
    };
    */
    const handleDownloadExcel = () => {
        // Clonar y ordenar los datos por "tarea" alfabéticamente
        const sortedData = [...todo].sort((a, b) => a.tarea.localeCompare(b.tarea));

        // Filtrar campos no deseados y formatear los valores monetarios
        const filteredData = sortedData.map(({ id, ...rest }) => ({
            ...rest,
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
                        <Title>Control Usuarios</Title>
                        <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
                            {/* Filtros */}

                            <div className="flex items-center space-x-2">
                                <GrWorkshop size={24} className="text-blue-600" />
                                <input
                                    type="text"
                                    name="tarea"
                                    placeholder="Buscar por Email"
                                    value={filters.email}
                                    onChange={handleFilterChange}
                                    maxLength={8}
                                    className="border p-2 rounded"
                                />
                            </div>
                        </div>





                        <div className="flex flex-wrap gap-2 mb-2">
                            {userRole === "admin" && (
                                <button
                                    onClick={handleOpenAddModal}
                                    className="text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 shadow-lg shadow-green-500/50 dark:shadow-lg dark:shadow-green-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-4"
                                >
                                    Crear Usuario
                                </button>
                            )}

                        </div>


                        <div className="overflow-x-auto">
                            {/* Tabla */}
                            {userRole === 'admin' && (
                                <table className="min-w-full bg-white bg-opacity-75 border">
                                <thead>
                                    <tr className="bg-gray-200 text-gray-600 uppercase text-sm">
                                        <th className="border px-4 py-2 text-center">Email</th>
                                        <th className="border px-4 py-2 text-center">Nombres</th>
                                        <th className="border px-4 py-2 text-center">Apellidos</th>
                                        <th className="border px-4 py-2 text-center">Tipo de Usuario</th>
                                        <th className="border px-4 py-2 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lotes.length > 0 ? (
                                        lotes.map((lote) => (
                                            <tr key={lote.id}>
                                                <td className="border px-4 py-2 text-center">{lote.email}</td>
                                                <td className="border px-4 py-2 text-center">{lote.firstName}</td>
                                                <td className="border px-4 py-2 text-center">{lote.lastName}</td>
                                                <td className="border px-4 py-2 text-center">{lote.role}</td>
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
                                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
                                    onClick={closeConfirmModal}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
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
                            contentLabel="Editar Lote"
                            className="max-w-xl mx-auto mt-20 bg-white rounded-lg shadow-lg overflow-hidden"
                            overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
                        >
                            <div className='p-8'>
                                <h2 className="text-lg font-bold mb-4">Editar Usuario</h2>
                                {selectedLote && (
                                    <form>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium">Email</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    placeholder="ejmeplo@gmail.com"
                                                    value={selectedLote.email}
                                                    required
                                                    onChange={handleInputChange}
                                                    className={`border p-2 rounded ${errors.email ? "border-red-500" : "border-gray-300"}`}
                                                />
                                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                            </div>
                                            <div>
                                                <label className='block text-sm font-medium'>Nombres</label>
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    required
                                                    placeholder="Nombres"
                                                    value={selectedLote.firstName}
                                                    onChange={handleInputChange}
                                                    className={`border p-2 rounded ${errors.firstName ? "border-red-500" : "border-gray-300"}`}
                                                />
                                                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                                            </div>
                                            <div>
                                                <label className='block text-sm font-medium'>Apellidos</label>
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    required
                                                    placeholder="Apellidos"
                                                    value={selectedLote.lastName}
                                                    onChange={handleInputChange}
                                                    className={`border p-2 rounded ${errors.lastName ? "border-red-500" : "border-gray-300"}`}
                                                />
                                                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                                            </div>


                                            <div>
                                                <label className='block text-sm font-medium'>Tipo de Usuario</label>

                                                <select
                                                    name="role"
                                                    required
                                                    placeholder="user"
                                                    value={selectedLote.role}
                                                    onChange={handleInputChange}
                                                    className={`w-full p-2 border rounded-md ${errors.role ? "border-red-500" : "border-gray-300"}`}
                                                >
                                                    <option value="admin">Administrador</option>
                                                    <option value="user">Usuario Normal</option>

                                                </select>
                                                {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
                                            </div>

                                        </div>
                                        <div className="flex justify-end mt-4">
                                            <button
                                                type="button"
                                                onClick={handleSaveChanges}
                                                className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                                            >
                                                Guardar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={openConfirmModal} // Llamamos a la función eliminar
                                                className="bg-red-500 text-white px-4 py-2 rounded mr-2"
                                            >
                                                Eliminar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleCloseModal}
                                                className="bg-gray-500 text-white px-4 py-2 rounded"
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
                            contentLabel="Separar Lote"
                            className="max-w-xl mx-auto mt-20 bg-white rounded-lg shadow-lg overflow-hidden"
                            overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
                        >
                            <div className='p-8'>
                                <h2 className="text-lg font-bold mb-4">Crear Nuevo Usuario</h2>
                                <form>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium">Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                required
                                                placeholder="ejemplo@gmail.com"
                                                value={newLote.email}
                                                onChange={(e) => setNewLote({ ...newLote, email: e.target.value })}
                                                className={`border p-2 rounded ${createErrors.email ? "border-red-500" : "border-gray-300"}`}
                                            />
                                            {createErrors.email && <p className="text-red-500 text-sm mt-1">{createErrors.email}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium">Contraseña</label>
                                            <input
                                                type="password"
                                                name="password"
                                                required
                                                placeholder="*********"
                                                value={newLote.password}
                                                onChange={(e) => setNewLote({ ...newLote, password: e.target.value })}
                                                className={`border p-2 rounded ${createErrors.password ? "border-red-500" : "border-gray-300"}`}
                                            />
                                            {createErrors.password && <p className="text-red-500 text-sm mt-1">{createErrors.password}</p>}
                                        </div>
                                        <div>
                                            <label className='block text-sm font-medium'>Nombres</label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                required
                                                placeholder="Nombres"
                                                value={newLote.firstName}
                                                onChange={(e) => setNewLote({ ...newLote, firstName: e.target.value })}
                                                className={`border p-2 rounded ${createErrors.firstName ? "border-red-500" : "border-gray-300"}`}
                                            />
                                            {createErrors.firstName && <p className="text-red-500 text-sm mt-1">{createErrors.firstName}</p>}
                                        </div>
                                        <div>
                                            <label className='block text-sm font-medium'>Apellidos</label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                required
                                                placeholder="Apellidos"
                                                value={newLote.lastName}
                                                onChange={(e) => setNewLote({ ...newLote, lastName: e.target.value })}
                                                className={`border p-2 rounded ${createErrors.lastName ? "border-red-500" : "border-gray-300"}`}
                                            />
                                            {createErrors.lastName && <p className="text-red-500 text-sm mt-1">{createErrors.lastName}</p>}
                                        </div>

                                        <div>
                                            <label className='block text-sm font-medium'>Tipo de Usuario</label>

                                            <select
                                                name="role"
                                                required
                                                placeholder="user"
                                                defaultValue="user"
                                                value={newLote.role}
                                                onChange={(e) => setNewLote({ ...newLote, role: e.target.value })}
                                                className={`w-full p-2 border rounded-md ${createErrors.role ? "border-red-500" : "border-gray-300"}`}
                                            >
                                                <option value="user">Usuario Normal</option>
                                                <option value="admin">Administrador</option>


                                            </select>
                                            {createErrors.role && <p className="text-red-500 text-sm mt-1">{createErrors.role}</p>}
                                        </div>

                                    </div>
                                    <div className="flex justify-end mt-4">
                                        <button
                                            onClick={handleCloseAddModal}
                                            className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleAddLote}
                                            className="bg-green-500 text-white px-4 py-2 rounded"
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
