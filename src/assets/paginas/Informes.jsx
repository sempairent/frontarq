
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


export default function Informes() {
    //const { proyectoId } = useParams();
    const [lotes, setLotes] = useState([]);
    const [todo, setTodo] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({ tarea: '' });
    const [debouncedFilters, setDebouncedFilters] = useState(filters);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [addModalIsOpen, setAddModalIsOpen] = useState(false);
    const [selectedLote, setSelectedLote] = useState(null);
    const [errors, setErrors] = useState("");
    const [createErrors, setCreateErrors] = useState({
        tarea: '',
        descripcion: '',

    });
    const [newLote, setNewLote] = useState({
        tarea: '',
        descripcion: '',

    });
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const openConfirmModal = () => {
        setIsConfirmModalOpen(true);
        setModalIsOpen(false);
    }

    const closeConfirmModal = () => setIsConfirmModalOpen(false);

    const API_URL = import.meta.env.VITE_API_URL;


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
                `${API_URL}/informes?${query}`, {
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

        const requiredFields = ["tarea", "descripcion"];
        const missingFields = requiredFields.filter((field) => !selectedLote[field] || selectedLote[field].toString().trim() === "");

        if (missingFields.length > 0) {
            toast.error("Por favor, completa todos los campos obligatorios.");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/informes/${selectedLote.id}`, {
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



        // Actualizar el estado del lote
        setSelectedLote((prev) => ({
            ...prev,
            [name]: newValue,
        }));

        // Validaciones específicas por campo
        const newErrors = { ...errors };
        switch (name) {
            //case "nombre":
            case "tarea":
            case "descripcion":
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
        if (!newLote.tarea) errors.tarea = 'El nombre es obligatorio';
        if (!newLote.descripcion) errors.descripcion = 'El apellido es obligatorio';

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

    const handleAddLote = async () => {
        if (!validateForm()) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/informes`, {
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
            tarea: "",
            descripcion: "",
            // Agrega otros campos según sea necesario
        });
        setErrors({});
    };

    const handleDeleteLote = async () => {
        if (!selectedLote) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/informes/${selectedLote.id}`, {
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
                        <Title>Informes</Title>
                        <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
                            {/* Filtros */}

                            <div className="flex items-center space-x-2">
                                <GrWorkshop size={24} className="text-blue-600" />
                                <input
                                    type="text"
                                    name="tarea"
                                    placeholder="Buscar por Tarea"
                                    value={filters.tarea}
                                    onChange={handleFilterChange}
                                    maxLength={8}
                                    className="border p-2 rounded"
                                />
                            </div>
                        </div>





                        <div className="flex flex-wrap gap-2 mb-2">
                            <button
                                onClick={handleOpenAddModal}
                                className="text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 shadow-lg shadow-green-500/50 dark:shadow-lg dark:shadow-green-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-4"
                            >
                                Crear Informe
                            </button>
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
                                        <th className="border px-4 py-2 text-center">Tarea</th>
                                        <th className="border px-4 py-2 text-center">Descripción</th>
                                        <th className="border px-4 py-2 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lotes.length > 0 ? (
                                        lotes.map((lote) => (
                                            <tr key={lote.id}>
                                                <td className="border px-4 py-2 text-center">{lote.tarea}</td>
                                                <td className="border px-4 py-2 text-center">{lote.descripcion}</td>
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
                                <h2 className="text-lg font-bold mb-4">Editar Informe</h2>
                                {selectedLote && (
                                    <form>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium">Tarea</label>
                                                <input
                                                    type="text"
                                                    name="tarea"
                                                    placeholder="Tarea"
                                                    value={selectedLote.tarea}
                                                    onChange={handleInputChange}
                                                    className={`border p-2 rounded ${errors.tarea ? "border-red-500" : "border-gray-300"}`}
                                                />
                                                {errors.tarea && <p className="text-red-500 text-sm mt-1">{errors.tarea}</p>}
                                            </div>
                                            <div>
                                                <label className='block text-sm font-medium'>Descripcion</label>
                                                <input
                                                    type="text"
                                                    name="descripcion"
                                                    placeholder="Descripcion"
                                                    value={selectedLote.descripcion}
                                                    onChange={handleInputChange}
                                                    className={`border p-2 rounded ${errors.descripcion ? "border-red-500" : "border-gray-300"}`}
                                                />
                                                {errors.descripcion && <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>}
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
                                <h2 className="text-lg font-bold mb-4">Añadir Nuevo Informe</h2>
                                <form>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium">Tarea</label>
                                            <input
                                                type="text"
                                                name="tarea"
                                                placeholder="Tarea"
                                                value={newLote.tarea}
                                                onChange={(e) => setNewLote({ ...newLote, tarea: e.target.value })}
                                                className={`border p-2 rounded ${createErrors.tarea ? "border-red-500" : "border-gray-300"}`}
                                            />
                                            {createErrors.tarea && <p className="text-red-500 text-sm mt-1">{createErrors.tarea}</p>}
                                        </div>
                                        <div>
                                            <label className='block text-sm font-medium'>Descripción</label>
                                            <input
                                                type="text"
                                                name="descripcion"
                                                placeholder="Descripcion"
                                                value={newLote.descripcion}
                                                onChange={(e) => setNewLote({ ...newLote, descripcion: e.target.value })}
                                                className={`border p-2 rounded ${createErrors.descripcion ? "border-red-500" : "border-gray-300"}`}
                                            />
                                            {createErrors.descripcion && <p className="text-red-500 text-sm mt-1">{createErrors.descripcion}</p>}
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
