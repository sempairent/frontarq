import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';




function Totorani() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        projectName: 'Totorani',
        terrainName: '',
        lotName: '',
    });
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [editingId, setEditingId] = useState(null);
    const [creating, setCreating] = useState(false);
    const [editFormData, setEditFormData] = useState({
        projectName: '',
        terrainName: '',
        lotName: '',
        price: '',
        clientName: '',
    });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [terrainToDelete, setTerrainToDelete] = useState(null);



    useEffect(() => {
        fetchData();
    }, [filters, page, pageSize]);

    const fetchData = async () => {
        setLoading(true);
        let query = `page=${page}&pageSize=${pageSize}`;
        if (filters.projectName) query += `&projectName=${filters.projectName}`;
        if (filters.terrainName) query += `&terrainName=${filters.terrainName}`;
        if (filters.lotName) query += `&lotName=${filters.lotName}`;

        const token = localStorage.getItem('token');

        const response = await fetch(`http://localhost:3000/api/data?${query}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        const result = await response.json();
        setData(result);
        setLoading(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilters({
            ...filters,
            [name]: value,
        });
        setPage(1); // Reset page to 1 on filter change
    };

    const handleEditClick = (item) => {
        setEditingId(item.id);
        setEditFormData({
            projectName: item.projectName,
            terrainName: item.terrainName,
            lotName: item.lotName,
            price: item.price,
            clientName: item.clientName,
        });
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData({
            ...editFormData,
            [name]: value,
        });
    };
    const handleSaveClick = async () => {
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`http://localhost:3000/api/data/${editingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(editFormData),
            });

            if (!response.ok) {
                throw new Error('Error al guardar los cambios');
            }

            toast.success('Cambios guardados con éxito!');
            setEditingId(null);
            fetchData();
        } catch (error) {
            toast.error(error.message);
        }
    };


    const handleDeleteClick = (id) => {
        setTerrainToDelete(id);
        setIsDeleteModalOpen(true);
    };
    const confirmDelete = async () => {
        const token = localStorage.getItem('token');
        try {
            const responseDelete = await fetch(`http://localhost:3000/api/data/${terrainToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!responseDelete.ok) {
                throw new Error('Error al eliminar el terreno');
            }
            toast.success('Se eliminó exitosamente');
            fetchData();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsDeleteModalOpen(false);  // Cierra el modal después de la operación
            setTerrainToDelete(null);    // Limpia el ID del terreno a eliminar
        }
    };



    const handleCreateClick = () => {
        setCreating(true);
        setEditFormData({
            projectName: '',
            terrainName: '',
            lotName: '',
            price: '',
            clientName: '',
        });
    };

    const handleCreateSaveClick = async () => {
        const token = localStorage.getItem('token');

        await fetch(`http://localhost:3000/api/data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(editFormData),
        });
        setCreating(false);
        fetchData();
    };

    const handleCancelClick = () => {
        setCreating(false);
        setEditingId(null);
    };

    const handlePreviousPage = () => {
        if (page > 1) {
            setPage(page - 1);
        }
    };

    const handleNextPage = () => {
        setPage(page + 1);
    };

    return (
        <div className="container mx-auto p-4 max-w-screen-lg">
            <h1 className="text-2xl font-bold mb-4">Data Table</h1>

            {/* Filtrado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <input
                    type="text"
                    name="projectName"
                    placeholder="Filter by Project Name"
                    value={filters.projectName}
                    onChange={handleInputChange}
                    className="border rounded-lg px-4 py-2 w-full"
                />
                <input
                    type="text"
                    name="terrainName"
                    placeholder="Filter by Terrain Name"
                    value={filters.terrainName}
                    onChange={handleInputChange}
                    className="border rounded-lg px-4 py-2 w-full"
                />
                <input
                    type="text"
                    name="lotName"
                    placeholder="Filter by Lot Name"
                    value={filters.lotName}
                    onChange={handleInputChange}
                    className="border rounded-lg px-4 py-2 w-full"
                />
            </div>

            {/* Botón para crear un nuevo terreno */}
            <button
                onClick={handleCreateClick}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors mb-4"
            >
                Create Terrain
            </button>

            {/* Tabla */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border">Nombre del Proyecto</th>
                            <th className="py-2 px-4 border">Nombre de Terreno</th>
                            <th className="py-2 px-4 border">Numero de Lote</th>
                            <th className="py-2 px-4 border">Precio</th>
                            <th className="py-2 px-4 border">Nombre del Cliente</th>
                            <th className="py-2 px-4 border">Accciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" className="py-4 text-center">Loading...</td></tr>
                        ) : (
                            data.map(item => (
                                <tr key={item.id} className="hover:bg-gray-100">
                                    <td className="py-2 px-4 border">{item.projectName}</td>
                                    <td className="py-2 px-4 border">{item.terrainName}</td>
                                    <td className="py-2 px-4 border">{item.lotName}</td>
                                    <td className="py-2 px-4 border">{item.price}</td>
                                    <td className="py-2 px-4 border">{item.clientName}</td>
                                    <td className="py-2 px-4 border">
                                        <button
                                            onClick={() => handleEditClick(item)}
                                            className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors mr-2"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(item.id)}
                                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                                        >
                                            Borrar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginación */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 space-y-2 sm:space-y-0">
                <button
                    onClick={handlePreviousPage}
                    disabled={page === 1}
                    className={`px-4 py-2 rounded-lg ${page === 1 ? 'bg-gray-300' : 'bg-blue-500 text-white hover:bg-blue-600 transition-colors'}`}
                >
                    Anterior
                </button>
                <span>Page {page}</span>
                <button
                    onClick={handleNextPage}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Siguiente
                </button>
            </div>

            {/* Formulario de creación */}
            {creating && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white p-4 rounded-lg shadow-lg max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Crear Nuevo Terreno</h2>
                        <div className="mb-4">
                            <input
                                type="text"
                                name="projectName"
                                value={editFormData.projectName}
                                onChange={handleEditChange}
                                placeholder="Project Name"
                                className="border rounded-lg px-4 py-2 w-full"
                            />
                        </div>
                        <div className="mb-4">
                            <input
                                type="text"
                                name="terrainName"
                                value={editFormData.terrainName}
                                onChange={handleEditChange}
                                placeholder="Terrain Name"
                                className="border rounded-lg px-4 py-2 w-full"
                            />
                        </div>
                        <div className="mb-4">
                            <input
                                type="text"
                                name="lotName"
                                value={editFormData.lotName}
                                onChange={handleEditChange}
                                placeholder="Lot Name"
                                className="border rounded-lg px-4 py-2 w-full"
                            />
                        </div>
                        <div className="mb-4">
                            <input
                                type="text"
                                name="price"
                                value={editFormData.price}
                                onChange={handleEditChange}
                                placeholder="Price"
                                className="border rounded-lg px-4 py-2 w-full"
                            />
                        </div>
                        <div className="mb-4">
                            <input
                                type="text"
                                name="clientName"
                                value={editFormData.clientName}
                                onChange={handleEditChange}
                                placeholder="Client Name"
                                className="border rounded-lg px-4 py-2 w-full"
                            />
                        </div>
                        <div className="flex justify-between">
                            <button
                                onClick={handleCreateSaveClick}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                Guardar
                            </button>
                            <button
                                onClick={handleCancelClick}
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Formulario de edición */}
            {editingId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white p-4 rounded-lg shadow-lg max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Editar Terrain</h2>
                        <div className="mb-4">
                            <input
                                type="text"
                                name="projectName"
                                value={editFormData.projectName}
                                onChange={handleEditChange}
                                placeholder="Project Name"
                                className="border rounded-lg px-4 py-2 w-full"
                            />
                        </div>
                        <div className="mb-4">
                            <input
                                type="text"
                                name="terrainName"
                                value={editFormData.terrainName}
                                onChange={handleEditChange}
                                placeholder="Terrain Name"
                                className="border rounded-lg px-4 py-2 w-full"
                            />
                        </div>
                        <div className="mb-4">
                            <input
                                type="text"
                                name="lotName"
                                value={editFormData.lotName}
                                onChange={handleEditChange}
                                placeholder="Lot Name"
                                className="border rounded-lg px-4 py-2 w-full"
                            />
                        </div>
                        <div className="mb-4">
                            <input
                                type="text"
                                name="price"
                                value={editFormData.price}
                                onChange={handleEditChange}
                                placeholder="Price"
                                className="border rounded-lg px-4 py-2 w-full"
                            />
                        </div>
                        <div className="mb-4">
                            <input
                                type="text"
                                name="clientName"
                                value={editFormData.clientName}
                                onChange={handleEditChange}
                                placeholder="Client Name"
                                className="border rounded-lg px-4 py-2 w-full"
                            />
                        </div>
                        <div className="flex justify-between">
                            <button
                                onClick={handleSaveClick}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                Guardar
                            </button>
                            <button
                                onClick={handleCancelClick}
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

{isDeleteModalOpen && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full transform transition-all duration-300 ease-in-out scale-100 hover:scale-105">
            <h2 className="text-xl font-bold mb-4 text-gray-800">¿Estás seguro que quieres borrar el terreno?</h2>
            <div className="flex justify-between">
                <button
                    onClick={confirmDelete}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                    Aceptar
                </button>
                <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                    Cancelar
                </button>
            </div>
        </div>
    </div>
)}

            <ToastContainer />
        </div>
    );
}

export default Totorani;

