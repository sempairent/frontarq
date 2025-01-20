
import { useState, useEffect } from 'react';
import { data, useActionData, useParams } from 'react-router-dom';
import Modal from 'react-modal';
import { FaRegEye } from 'react-icons/fa';
import FondoPaginas from '../components/fondospagina/FondoPaginas';
import Navbar from '../components/Navbar';
import CardClientes from '../components/CardClientes';
import Title from '../components/Title';
import { FaAddressCard } from "react-icons/fa";
import { FaHouseChimney } from "react-icons/fa6";
import { IoIosPerson } from "react-icons/io";
import { AiOutlineDollar } from "react-icons/ai";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import * as XLSX from 'xlsx';


export default function LotesSeparados() {
    const { proyectoId } = useParams();
    const [lotes, setLotes] = useState([]);
    const [todo, setTodo] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({ dni: '', mzYLote: '', asesor: '', financiado: '' });
    const [debouncedFilters, setDebouncedFilters] = useState(filters);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [addModalIsOpen, setAddModalIsOpen] = useState(false);
    const [selectedLote, setSelectedLote] = useState(null);
    const [errors, setErrors] = useState("");
    const [createErrors, setCreateErrors] = useState({
        nombre: '',
        apellido: '',
        dni: '',
        celular: '',
        mzYLote: '',
        financiado: '',
        adelanto: '',
        total: '',
        asesor: '',
    });
    const [newLote, setNewLote] = useState({
        nombre: '',
        apellido: '',
        dni: '',
        celular: '',
        mzYLote: '',
        financiado: `Si Tiene Financiación\nfechas de pago:\n- 01/12/2025: pago S/.2000\n- 01/12/2025: no pago`,
        adelanto: 0,
        total: 1,
        asesor: '',
    });
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const openConfirmModal = () => {
        setIsConfirmModalOpen(true);
        setModalIsOpen(false);
    }

    const closeConfirmModal = () => setIsConfirmModalOpen(false);

    const [projectName, setProjectName] = useState('');
    //const token = localStorage.getItem('token')
    const API_URL = import.meta.env.VITE_API_URL;
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        const role = localStorage.getItem('role');
        if (role) {
            setUserRole(role);
        }
    }, []);
    useEffect(() => {
        const token = localStorage.getItem('token');
        const fetchProjectName = async () => {
            try {
                const response = await fetch(`${API_URL}/proyectos/${proyectoId}`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                    }
                );
                const data = await response.json();
                setProjectName(data.nombre);

            } catch (error) {
                toast.error('Error fetching project name:', error);
            }
        };
        fetchProjectName();
    }, [proyectoId]);

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
                `${API_URL}/separar/${proyectoId}?${query}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            },
            );
            const data = await response.json();
            setLotes(data.lotes);
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
                `${API_URL}/todos/${proyectoId}`, {
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
        resetForm();
    };


    const handleSaveChanges = async () => {
        if (!selectedLote) return;

        const requiredFields = ["nombre", "apellido", "dni", "celular", "mzYLote", "financiado", "adelanto", "total", "asesor"];
        const missingFields = requiredFields.filter((field) => !selectedLote[field] || selectedLote[field].toString().trim() === "");

        if (missingFields.length > 0) {
            toast.error("Por favor, completa todos los campos obligatorios.");
            return;
        }
        const { dni, celular } = selectedLote;

        const adelanto = parseFloat(selectedLote.adelanto) || 0;
        const total = parseFloat(selectedLote.total) || 0;

        if (adelanto > total) {
            toast.error("El adelanto no puede ser mayor que el total.");
            return;
        }
        if (adelanto < 0 || total < 0) {
            toast.error("El Adelanto/Total no tienen que ser negativos.")
        }
        if (dni.length !== 8) {
            toast.error("El DNI debe tener 8 dígitos.");
            return;
        }
        if (celular.length !== 9) {
            toast.error("El celular debe tener 9 dígitos.");
            return;
        }


        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/separar/${selectedLote.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(selectedLote),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            toast.success(data.message);

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
        if (name === 'dni' || name === 'celular') {
            newValue = value.replace(/\D/g, ''); // Eliminar caracteres no numéricos
        }
        if (name === "mzYLote") {
            newValue = value.toUpperCase();
        }

        if (name === "adelanto" || name === "total") {
            // Permitir solo números y un solo punto decimal, eliminando signos '+' y '-'
            newValue = value.replace(/[^0-9.]/g, "");

            // Evitar múltiples puntos decimales
            const dotCount = (newValue.match(/\./g) || []).length;
            if (dotCount > 1) {
                return; // No actualiza el estado si hay más de un punto
            }

            // Evitar que empiece con un punto (ejemplo: ".50" → "0.50")
            if (newValue.startsWith(".")) {
                newValue = "0" + newValue;
            }

            // Evitar que termine con un punto (ejemplo: "100." no es válido)
            if (newValue.endsWith(".")) {
                return;
            }

        }




        // Actualizar el estado del lote
        setSelectedLote((prev) => ({
            ...prev,
            [name]: newValue,
        }));

        // Validaciones específicas por campo
        const newErrors = { ...errors };
        switch (name) {
            case "nombre":
            case "apellido":
            case "financiado":
            case "asesor":
                if (newValue.trim() === "") {
                    newErrors[name] = "Este campo es obligatorio.";
                } else {
                    delete newErrors[name];
                }
                break;
            case "dni":
                if (!/^\d{8}$/.test(newValue)) {
                    newErrors[name] = "El DNI debe tener 8 dígitos.";
                } else {
                    delete newErrors[name];
                }
                break;
            case "celular":
                if (!/^\d{9}$/.test(newValue)) {
                    newErrors[name] = "El celular debe tener 9 dígitos.";
                } else {
                    delete newErrors[name];
                }
                break;
            case "adelanto":
            case "total":
                if (newValue === "" || parseFloat(newValue) < 0) {
                    newErrors[name] = "Debe ser un número mayor o igual a 0.";
                } else {
                    delete newErrors[name];
                }
                break;
            default:
                break;
        }

        setErrors(newErrors);
    };

    // parte del fromulario de añadir lote y restricciones
    // Manejo de cambios en los campos de entrada


    // Validación antes de guardar
    const validateForm = () => {
        const errors = {};

        // Validar cada campo
        if (!newLote.nombre) errors.nombre = 'El nombre es obligatorio';
        if (!newLote.apellido) errors.apellido = 'El apellido es obligatorio';
        if (!newLote.dni) errors.dni = 'El DNI es obligatorio';
        else if (!/^\d{8}$/.test(newLote.dni)) errors.dni = 'El DNI debe tener 8 dígitos';

        if (!newLote.celular) errors.celular = 'El celular es obligatorio';
        else if (!/^\d{9}$/.test(newLote.celular)) errors.celular = 'El celular debe tener 9 dígitos';

        if (!newLote.mzYLote) errors.mzYLote = 'El Mz y Lote son obligatorios';
        if (!newLote.financiado) errors.financiado = 'El Campo es obligatorios';
        if (!newLote.adelanto || newLote.adelanto <= 0) errors.adelanto = 'El adelanto debe ser mayor que 0';
        if (!newLote.total || newLote.total <= 0) errors.total = 'El total debe ser mayor que 0';
        if (!newLote.asesor) errors.asesor = 'El asesor es obligatorio';

        setCreateErrors(errors);
        return Object.keys(errors).length === 0; // Retorna true si no hay errores
    };



    const handleOpenAddModal = () => {
        setAddModalIsOpen(true);
    };

    const handleCloseAddModal = () => {
        setAddModalIsOpen(false);
        setNewLote({
            nombre: '',
            apellido: '',
            dni: '',
            celular: '',
            mzYLote: '',
            financiado: `Si Tiene Financiación\nfechas de pago:\n- dd/MM/YYYY: pago S/.2000\n- dd/MM/YYYY: no pago`,
            adelanto: 0,
            total: 0,
            asesor: '',
        });
        setCreateErrors({});

    };

    const handleAddLote = async () => {
        if (!validateForm()) return;
        if (newLote.adelanto < 0) {
            toast.error('El adelanto no puede ser negativo')
            return;
        }
        if (newLote.total < 0) {
            toast.error('El Total no puede ser negativo')
            return;
        }
        if (newLote.adelanto > newLote.total) {
            toast.error("El adelanto es mayor que el Total");
            return;
        }



        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/separar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...newLote, proyectoId: parseInt(proyectoId, 10) }),
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
            nombre: "",
            apellido: "",
            asesor: "",
            dni: "",
            celular: "",
            mzYLote: "",
            financiado: "",
            adelanto: "",
            total: "",
            // Agrega otros campos según sea necesario
        });
        setErrors({});
    };

    const handleDeleteLote = async () => {
        if (!selectedLote) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/separar/${selectedLote.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            toast.success("Lote eliminado correctamente.");
            fetchLotes(currentPage); // Refresca la lista de lotes
            //handleCloseModal(); // Cierra el modal después de eliminar
            closeConfirmModal();
        } catch (error) {
            console.error(error);
            toast.error("Error al eliminar el lote.");
        }
    };

    //exel

    const handleDownloadExcel = () => {
        // Clonar y ordenar los datos por "tarea" alfabéticamente
        const sortedData = [...todo].sort((a, b) => a.nombre.localeCompare(b.nombre));

        // Filtrar campos no deseados y formatear los valores monetarios
        const filteredData = sortedData.map(({ id, proyectoId, adelanto, total, asesor, financiado, ...rest }) => ({
            ...rest,
            adelanto: adelanto ? `S/. ${adelanto}` : "S/. 0",
            total: total ? `S/. ${total}` : "S/. 0",
            asesor,
            financiado
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
        XLSX.utils.book_append_sheet(wb, ws, "Lotes_Separados");

        // Descargar el archivo
        XLSX.writeFile(wb, "Lotes_Separados.xlsx");
    };


    return (
        <>
            <FondoPaginas>
                <Navbar />

                <CardClientes>

                    <div className="container mx-auto">
                        {/*<h1 className="text-xl font-bold mb-4">Lotes Separados</h1> */}
                        <Title>Lotes Separados en {projectName || 'cargando...'}</Title>
                        <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
                            {/* Filtros */}

                            <div className="flex items-center space-x-2">
                                <FaAddressCard size={24} className="text-blue-600" />
                                <input
                                    type="text"
                                    name="dni"
                                    placeholder="Buscar por DNI"
                                    value={filters.dni}
                                    onChange={handleFilterChange}
                                    maxLength={8}
                                    className="border p-2 rounded"
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <FaHouseChimney size={24} className="text-blue-600" />
                                <input
                                    type="text"
                                    name="mzYLote"
                                    placeholder="Buscar por Mz y Lote"
                                    value={filters.mzYLote}
                                    onChange={handleFilterChange}
                                    className="border p-2 rounded"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <IoIosPerson size={24} className="text-blue-600" />
                                <input
                                    type="text"
                                    name="asesor"
                                    placeholder="Buscar por Asesor"
                                    value={filters.asesor}
                                    onChange={handleFilterChange}
                                    className="border p-2 rounded"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <AiOutlineDollar size={24} className="text-blue-600" />
                                <input
                                    type="text"
                                    name="financiado"
                                    placeholder="Si Financiado/No Financiado"
                                    value={filters.financiado}
                                    onChange={handleFilterChange}
                                    className="border p-2 rounded"
                                />
                            </div>
                        </div>



                        <div className='flex flex-wrap gap-2 mb-2'>
                            {userRole === 'admin' && (
                                <button
                                    onClick={handleOpenAddModal}
                                    className="text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 shadow-lg shadow-green-500/50 dark:shadow-lg dark:shadow-green-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-4"
                                >
                                    Separar Lote
                                </button>
                            )}

                            <button
                                onClick={handleDownloadExcel}
                                className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-4 ml-auto"
                            >
                                Descargar Excel
                            </button>
                        </div>


                        <div className="overflow-x-auto">
                            {/* Tabla */}
                            <table className="min-w-full bg-white bg-opacity-75 border">
                                <thead>
                                    <tr className="bg-gray-200 text-gray-600 uppercase text-sm">
                                        <th className="border px-4 py-2 text-center">DNI</th>
                                        <th className="border px-4 py-2 text-center">Nombre</th>
                                        <th className="border px-4 py-2 text-center">Apellido</th>
                                        <th className="border px-4 py-2 text-center">Celular</th>
                                        <th className="border px-4 py-2 text-center">Mz y Lote</th>
                                        <th className="border px-4 py-2 text-center">Financiación</th>
                                        <th className="border px-4 py-2 text-center">Adelanto</th>
                                        <th className="border px-4 py-2 text-center">Total</th>
                                        <th className="border px-4 py-2 text-center">Asesor</th>
                                        {userRole === 'admin' && (
                                            <th className="border px-4 py-2 text-center">Acciones</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {lotes.length > 0 ? (
                                        lotes.map((lote) => (
                                            <tr key={lote.id}>
                                                <td className="border px-4 py-2 text-center">{lote.dni}</td>
                                                <td className="border px-4 py-2 text-center">{lote.nombre}</td>
                                                <td className="border px-4 py-2 text-center">{lote.apellido}</td>
                                                <td className="border px-4 py-2 text-center">{lote.celular}</td>
                                                <td className="border px-4 py-2 text-center">{lote.mzYLote}</td>
                                                <td className="border px-4 py-2 text-center">S/.{lote.adelanto}</td>
                                                <td className="border px-4 py-2 text-center">S/.{lote.total}</td>
                                                <td className="border px-4 py-2 text-center">{lote.asesor}</td>
                                                <td className="border px-4 py-2 text-start">
                                                    <div className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[110px]" title={lote.financiado}>
                                                        {lote.financiado}
                                                    </div>
                                                </td>
                                                {userRole === 'admin' && (
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
                                                )}
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
                            contentLabel="Editar Lote"
                            className="max-w-xl mx-auto mt-20 bg-white rounded-lg shadow-lg overflow-hidden"
                            overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
                        >
                            <div className='p-8'>
                                <h2 className="text-lg font-bold mb-4">Editar Lote</h2>
                                {selectedLote && (
                                    <form>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-sm font-medium">Nombres</label>
                                                <input
                                                    type="text"
                                                    name="nombre"
                                                    placeholder="Nombre"
                                                    value={selectedLote.nombre}
                                                    onChange={handleInputChange}
                                                    className={`border p-2 rounded ${errors.nombre ? "border-red-500" : "border-gray-300"}`}
                                                />
                                                {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
                                            </div>
                                            <div>
                                                <label className='block text-sm font-medium'>Apellidos</label>
                                                <input
                                                    type="text"
                                                    name="apellido"
                                                    placeholder="Apellido"
                                                    value={selectedLote.apellido}
                                                    onChange={handleInputChange}
                                                    className={`border p-2 rounded ${errors.apellido ? "border-red-500" : "border-gray-300"}`}
                                                />
                                                {errors.apellido && <p className="text-red-500 text-sm mt-1">{errors.apellido}</p>}
                                            </div>
                                            <div>
                                                <label className='block text-sm font-medium'>DNI</label>
                                                <input
                                                    type="text"
                                                    name="dni"
                                                    placeholder="DNI"
                                                    value={selectedLote.dni}
                                                    maxLength={8}
                                                    onChange={handleInputChange}
                                                    className={`border p-2 rounded ${errors.dni ? "border-red-500" : "border-gray-300"}`}
                                                />
                                                {errors.dni && <p className="text-red-500 text-sm mt-1">{errors.dni}</p>}
                                            </div>
                                            <div>
                                                <label className='block text-sm font-medium'>Celular</label>
                                                <input
                                                    type="text"
                                                    name="celular"
                                                    placeholder="Celular"
                                                    maxLength={9}
                                                    value={selectedLote.celular}
                                                    onChange={handleInputChange}
                                                    className={`border p-2 rounded ${errors.celular ? "border-red-500" : "border-gray-300"}`}
                                                />
                                                {errors.celular && <p className="text-red-500 text-sm mt-1">{errors.celular}</p>}
                                            </div>
                                            <div>
                                                <label className='block text-sm font-medium'>Manzana/Lote</label>
                                                <input
                                                    type="text"
                                                    name="mzYLote"
                                                    placeholder="Mz y Lote"
                                                    value={selectedLote.mzYLote}
                                                    onChange={handleInputChange}
                                                    className={`border p-2 rounded ${errors.mzYLote ? "border-red-500" : "border-gray-300"}`}
                                                />
                                                {errors.mzYLote && <p className="text-red-500 text-sm mt-1">{errors.mzYLote}</p>}
                                            </div>

                                            <div>
                                                <label className='block text-sm font-medium'>Adelanto</label>
                                                <input
                                                    type="number"
                                                    name="adelanto"
                                                    placeholder="Adelanto"
                                                    value={selectedLote.adelanto}
                                                    onChange={handleInputChange}

                                                    className={`border p-2 rounded ${errors.adelanto ? "border-red-500" : "border-gray-300"}`}
                                                />
                                                {errors.adelanto && <p className="text-red-500 text-sm mt-1">{errors.adelanto}</p>}
                                            </div>
                                            <div>
                                                <label className='block text-sm font-medium'>Total</label>
                                                <input
                                                    type="number"
                                                    name="total"
                                                    placeholder="Total"
                                                    value={selectedLote.total}
                                                    onChange={handleInputChange}
                                                    className={`border p-2 rounded ${errors.total ? "border-red-500" : "border-gray-300"}`}
                                                />
                                                {errors.total && <p className="text-red-500 text-sm mt-1">{errors.total}</p>}

                                            </div>
                                            <div>
                                                <label className='block text-sm font-medium'>Asesor</label>
                                                <input
                                                    type="text"
                                                    name="asesor"
                                                    placeholder="Asesor"
                                                    value={selectedLote.asesor}
                                                    onChange={handleInputChange}
                                                    className={`border p-2 rounded ${errors.asesor ? "border-red-500" : "border-gray-300"}`}
                                                />
                                                {errors.asesor && <p className="text-red-500 text-sm mt-1">{errors.asesor}</p>}
                                            </div>

                                        </div>
                                        <div>
                                            <label className='block text-sm font-medium'>Financiación</label>
                                            <textarea
                                                type="text"
                                                name="financiado"
                                                placeholder="Mz y Lote"
                                                value={selectedLote.financiado}
                                                onChange={handleInputChange}
                                                className={`border p-2 rounded w-full h-32 resize-y ${errors.financiado ? "border-red-500" : "border-gray-300"}`}
                                            />
                                            {errors.financiado && <p className="text-red-500 text-sm mt-1">{errors.financiado}</p>}
                                        </div>
                                        <div className="flex justify-end mt-4">
                                            <button
                                                type="button"
                                                onClick={handleSaveChanges}
                                                className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
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
                            contentLabel="Separar Lote"
                            className="max-w-xl mx-auto mt-20 bg-white rounded-lg shadow-lg overflow-hidden"
                            overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
                        >
                            <div className='p-8'>
                                <h2 className="text-lg font-bold mb-4">Añadir Nuevo Lote</h2>
                                <form>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium">Nombres</label>
                                            <input
                                                type="text"
                                                name="nombre"
                                                placeholder="Nombre"
                                                value={newLote.nombre}
                                                onChange={(e) => setNewLote({ ...newLote, nombre: e.target.value })}
                                                className={`border p-2 rounded ${createErrors.nombre ? "border-red-500" : "border-gray-300"}`}
                                            />
                                            {createErrors.nombre && <p className="text-red-500 text-sm mt-1">{createErrors.nombre}</p>}
                                        </div>
                                        <div>
                                            <label className='block text-sm font-medium'>Apellidos</label>
                                            <input
                                                type="text"
                                                name="apellido"
                                                placeholder="Apellido"
                                                value={newLote.apellido}
                                                onChange={(e) => setNewLote({ ...newLote, apellido: e.target.value })}
                                                className={`border p-2 rounded ${createErrors.apellido ? "border-red-500" : "border-gray-300"}`}
                                            />
                                            {createErrors.apellido && <p className="text-red-500 text-sm mt-1">{createErrors.apellido}</p>}
                                        </div>
                                        <div>
                                            <label className='block text-sm font-medium'>DNI</label>
                                            <input
                                                type="text"
                                                name="dni"
                                                placeholder="DNI"
                                                maxLength={8}
                                                value={newLote.dni}
                                                onChange={(e) => {

                                                    const { name, value } = e.target;
                                                    setNewLote((prev) => ({
                                                        ...prev,
                                                        [name]: name === 'dni' || name === 'celular' ? value.replace(/\D/g, '') : value,
                                                    }));
                                                }}

                                                className={`border p-2 rounded ${createErrors.dni ? "border-red-500" : "border-gray-300"}`}
                                            />
                                            {createErrors.dni && <p className="text-red-500 text-sm mt-1">{createErrors.dni}</p>}
                                        </div>
                                        <div>
                                            <label className='block text-sm font-medium'>Celular</label>
                                            <input
                                                type="text"
                                                name="celular"
                                                placeholder="Celular"
                                                maxLength={9}
                                                value={newLote.celular}
                                                //onChange={(e) => setNewLote({ ...newLote, celular: e.target.value })}
                                                onChange={(e) => {
                                                    const { name, value } = e.target;
                                                    setNewLote((prev) => ({
                                                        ...prev,
                                                        [name]: name === 'dni' || name === 'celular' ? value.replace(/\D/g, '') : value,
                                                    }));
                                                }}

                                                className={`border p-2 rounded ${createErrors.celular ? "border-red-500" : "border-gray-300"}`}
                                            />
                                            {createErrors.celular && <p className="text-red-500 text-sm mt-1">{createErrors.celular}</p>}

                                        </div>
                                        <div>
                                            <label className='block text-sm font-medium'>Manzana/Lote</label>
                                            <input
                                                type="text"
                                                name="mzYLote"
                                                placeholder="Mz y Lote"

                                                value={newLote.mzYLote}
                                                onChange={(e) => setNewLote({ ...newLote, mzYLote: e.target.value.toUpperCase() })}
                                                className={`border p-2 rounded ${createErrors.mzYLote ? "border-red-500" : "border-gray-300"}`}
                                            />
                                            {createErrors.mzYLote && <p className="text-red-500 text-sm mt-1">{createErrors.mzYLote}</p>}
                                        </div>

                                        <div>
                                            <label className='block text-sm font-medium'>Adelanto</label>
                                            <input
                                                type="number"
                                                name="adelanto"
                                                placeholder="Adelanto"
                                                value={newLote.adelanto}
                                                //onChange={(e) => setNewLote({ ...newLote, adelanto: parseFloat(e.target.value) })}
                                                onChange={(e) => setNewLote({ ...newLote, adelanto: parseFloat(e.target.value) })}
                                                className={`border p-2 rounded ${createErrors.adelanto ? "border-red-500" : "border-gray-300"}`}
                                            />
                                            {createErrors.adelanto && <p className="text-red-500 text-sm mt-1">{createErrors.adelanto}</p>}
                                        </div>
                                        <div>
                                            <label className='block text-sm font-medium'>Total</label>
                                            <input
                                                type="number"
                                                name="total"
                                                placeholder="Total"
                                                value={newLote.total}
                                                onChange={(e) => setNewLote({ ...newLote, total: parseFloat(e.target.value) })}
                                                className={`border p-2 rounded ${createErrors.total ? "border-red-500" : "border-gray-300"}`}
                                            />
                                            {createErrors.total && <p className="text-red-500 text-sm mt-1">{createErrors.total}</p>}
                                        </div>
                                        <div>
                                            <label className='block text-sm font-medium'>Asesor</label>
                                            <input
                                                type="text"
                                                name="asesor"
                                                placeholder="Asesor"
                                                value={newLote.asesor}
                                                onChange={(e) => setNewLote({ ...newLote, asesor: e.target.value })}
                                                className={`border p-2 rounded ${createErrors.asesor ? "border-red-500" : "border-gray-300"}`}
                                            />
                                            {createErrors.asesor && <p className="text-red-500 text-sm mt-1">{createErrors.asesor}</p>}
                                        </div>
                                    </div>
                                    <div>
                                        <label className='block text-sm font-medium'>Financiación</label>
                                        <textarea
                                            type="text"
                                            name="financiado"
                                            placeholder={`Si Tiene Financiación\nfechas de pago:\n- 01/12/2025: pago S/.2000\n- 01/12/2025: no pago`}
                                            value={newLote.financiado}
                                            onChange={(e) => setNewLote({ ...newLote, financiado: e.target.value })}
                                            className={`border p-2 rounded w-full h-32 resize-y ${createErrors.financiado ? "border-red-500" : "border-gray-300"}`}
                                        />
                                        {createErrors.financiado && <p className="text-red-500 text-sm mt-1">{createErrors.financiado}</p>}
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
