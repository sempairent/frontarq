import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { MdAddLocationAlt } from "react-icons/md";
import Modal from 'react-modal';

Modal.setAppElement('#root');

const Pruebas = () => {
    const { proyectoId } = useParams();
    const [lotes, setLotes] = useState([]);
    const [selectedLote, setSelectedLote] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddingPointer, setIsAddingPointer] = useState(false);
    const [imagenPlano, setImagenPlano] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newLote, setNewLote] = useState(null);

    useEffect(() => {
        fetchProyecto();
        fetchLotes();
    }, [proyectoId]);

    const API_URL = import.meta.env.VITE_API_URL;

    const fetchProyecto = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/proyectos/${proyectoId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setImagenPlano(data.descripcion);
        } catch (error) {
            toast.error('Error al obtener el plano del proyecto.');
        }
    };

    const fetchLotes = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/planos/${proyectoId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setLotes(data);
        } catch (error) {
            toast.error('Error al obtener los lotes.');
        }
    };

    const handleEditLote = (lote) => {
        setSelectedLote(lote);
        setIsEditModalOpen(true);
    };

    const handleEditModalClose = () => {
        setIsEditModalOpen(false);
        setSelectedLote(null);
    };

    const handleEditLoteSubmit = async () => {
        if (selectedLote) {
            try {
                const token = localStorage.getItem('token');
                const { id, x, y, width, height, estado, manlote, proyectoId } = selectedLote;
                const response = await fetch(`${API_URL}/planos/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ x, y, width, height, estado, manlote, proyectoId }),
                });

                if (!response.ok) {
                    throw new Error('Error al editar el puntero.');
                }

                const updatedLote = await response.json();
                setLotes((prevLotes) =>
                    prevLotes.map((lote) => (lote.id === updatedLote.id ? updatedLote : lote))
                );

                handleEditModalClose();
                toast.success('Puntero actualizado satisfactoriamente.');
            } catch (error) {
                toast.error('Error al editar el puntero.');
            }
        }
    };

    const getMarkerColor = (estado) => {
        switch (estado) {
            case 'vendido':
                return 'red';
            case 'reservado':
                return 'yellow';
            case 'disponible':
            default:
                return 'green';
        }
    };

    return (
        <>
            <div>
                <div
                    id="plano-con-punteros"
                    style={{ position: 'relative', width: '100%' }}
                >
                    <img
                        src={imagenPlano}
                        alt="Plano"
                        style={{ width: '100%', height: 'auto' }}
                    />
                    {lotes.map((lote) => (
                        <div
                            key={lote.id}
                            onClick={() => handleEditLote(lote)}
                            style={{
                                position: 'absolute',
                                left: `${lote.x}%`,
                                top: `${lote.y}%`,
                                width: `${lote.width}%`,
                                height: `${lote.height}%`,
                                backgroundColor: getMarkerColor(lote.estado),
                                border: '1px solid red',
                                cursor: 'pointer',
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Modal para editar puntero */}
            <Modal
                isOpen={isEditModalOpen}
                onRequestClose={handleEditModalClose}
                contentLabel="Editar Puntero"
                style={{
                    content: {
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                    },
                }}
            >
                <h2>Editar Puntero</h2>
                {selectedLote && (
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleEditLoteSubmit();
                        }}
                    >
                        <label>
                            Estado:
                            <select
                                value={selectedLote.estado}
                                onChange={(e) =>
                                    setSelectedLote({ ...selectedLote, estado: e.target.value })
                                }
                            >
                                <option value="vendido">Vendido</option>
                                <option value="reservado">Reservado</option>
                                <option value="disponible">Disponible</option>
                            </select>
                        </label>
                        <label>
                            Manzana/Lote:
                            <input
                                type="text"
                                value={selectedLote.manlote}
                                onChange={(e) =>
                                    setSelectedLote({ ...selectedLote, manlote: e.target.value })
                                }
                            />
                        </label>
                        <div>
                            <button type="submit">Guardar</button>
                            <button type="button" onClick={handleEditModalClose}>
                                Cancelar
                            </button>
                        </div>
                    </form>
                )}
            </Modal>

            <ToastContainer />
        </>
    );
};

export default Pruebas;
