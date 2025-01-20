import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { MdAddLocationAlt } from "react-icons/md";
import Modal from 'react-modal';
import Navbar from '../components/Navbar';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

Modal.setAppElement('#root');

const PlanoConPuntero = () => {
    const { proyectoId } = useParams();
    const [lotes, setLotes] = useState([]);
    const [selectedLote, setSelectedLote] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [newLote, setNewLote] = useState(null);
    const [isAddingPointer, setIsAddingPointer] = useState(false);
    const [imagenPlano, setImagenPlano] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

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
            console.error('Error fetching proyecto:', error);
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
            console.error('Error fetching lotes:', error);
        }
    };
    //edit
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

    const handleAddPointer = () => {
        setIsAddingPointer(true);
        setNewLote({ x: 0, y: 0, width: 0, height: 0, fixed: false });
    };

    const handleMapClick = (e) => {
        if (isAddingPointer && !newLote?.fixed) {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            setNewLote({ ...newLote, x, y, fixed: true });
        }
    };

    const handleMouseMove = (e) => {
        if (isAddingPointer && newLote?.fixed) {
            const rect = e.currentTarget.getBoundingClientRect();
            const width = ((e.clientX - rect.left) / rect.width) * 100 - newLote.x;
            const height = ((e.clientY - rect.top) / rect.height) * 100 - newLote.y;
            setNewLote({ ...newLote, width: Math.abs(width), height: Math.abs(height) });
        }
    };

    const handleKeyPress = (e) => {
        if (isAddingPointer && newLote?.fixed && e.key === 'Enter') {
            setIsAddingPointer(false);
            setIsModalOpen(true);
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setNewLote(null);
    };

    const handleAddLote = async () => {
        if (newLote) {
            try {
                const token = localStorage.getItem('token');
                const { x, y, width, height } = newLote;
                const response = await fetch(`${API_URL}/planos`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        x,
                        y,
                        width,
                        height,
                        estado: newLote.estado || 'disponible',
                        manlote: newLote.manlote || 'C1',
                        proyectoId: parseInt(proyectoId, 10),
                    }),
                });

                if (!response.ok) {
                    throw new Error('Error al crear el lote.');
                }

                const data = await response.json();
                setLotes((prevLotes) => [...prevLotes, data]);
                handleModalClose();
                toast.success('Puntero creado satisfactoriamente.');
            } catch (error) {
                toast.error('Error al crear el puntero.');
                console.error('Error adding lote:', error);
            }
        }
    };
    const handleDeleteLote = async () => {
        if (selectedLote) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_URL}/planos/${selectedLote.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Error al eliminar el puntero.');
                }

                setLotes((prevLotes) =>
                    prevLotes.filter((lote) => lote.id !== selectedLote.id)
                );

                handleEditModalClose();
                toast.success('Puntero eliminado satisfactoriamente.');
            } catch (error) {
                toast.error('Error al eliminar el puntero.');
            }
        }
    };
    const exportToPDF = async () => {
        const planoElement = document.getElementById('plano-con-punteros');
      
        try {
            // Captura el contenido del plano usando html2canvas
            const canvas = await html2canvas(planoElement, {
                useCORS: true,
                scale: 5, // Aumenta el valor para mayor calidad
                scrollY: -window.scrollY, // Captura contenido fuera del área visible
                logging: false, // Desactiva los logs de html2canvas
            });
    
            const imgData = canvas.toDataURL('image/png');
    
            // Crear el PDF con el tamaño A4
            const pdf = new jsPDF({
                orientation: 'landscape', // Formato apaisado (A4 landscape)
                unit: 'mm', // Usamos milímetros para un control más preciso
                format: 'a4', // Usamos el formato A4
            });
    
            const pageWidth = pdf.internal.pageSize.getWidth(); // Ancho de la página A4 en mm
            const pageHeight = pdf.internal.pageSize.getHeight(); // Alto de la página A4 en mm
    
            const imgWidth = canvas.width * 0.264583; // Convertir px a mm (1 px = 0.264583 mm)
            const imgHeight = canvas.height * 0.264583; // Convertir px a mm (1 px = 0.264583 mm)
    
            // Escalar la imagen para que se ajuste a la página sin perder partes
            const scale = Math.min(pageWidth / imgWidth, pageHeight / imgHeight); // Ajuste para que quepa completamente
    
            const scaledWidth = imgWidth * scale; // Ancho escalado
            const scaledHeight = imgHeight * scale; // Alto escalado
    
            // Calcular la posición para centrar la imagen en la página
            const xPosition = (pageWidth - scaledWidth) / 2; // Centrar horizontalmente
            const yPosition = (pageHeight - scaledHeight) / 2; // Centrar verticalmente
    
            // Añadir la imagen al PDF, centrada
            pdf.addImage(imgData, 'PNG', xPosition, yPosition, scaledWidth, scaledHeight);
    
            // Guardar el PDF
            pdf.save('Plano.pdf');
        } catch (error) {
            console.error('Error exporting to PDF:', error);
        }
    };
    
    

    const getMarkerColor = (estado) => {
        switch (estado) {
            case 'cuotas':
                return 'blue';

            case 'manzana':
                return 'turquoise'
            case 'reservado':
                return 'yellow';

            case 'vendido':
            default:
                return 'red';
        }
    };

    return (
        <>
            <Navbar />
            <div>
            <button
    onClick={exportToPDF}
    className="fixed bottom-8 left-8 z-50 text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
>
    Descargar PDF
</button>

                <div className="fixed bottom-8 right-8 z-50">
                    <button
                        onClick={handleAddPointer}
                        className="text-gray-900 bg-gradient-to-r from-violet-200 via-violet-400 to-violet-500 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-violet-300 dark:focus:ring-violet-800 shadow-lg shadow-violet-500/50 dark:shadow-lg dark:shadow-violet-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center"
                    >
                        <MdAddLocationAlt className="w-4 h-4 mr-2" />
                        Agregar puntero
                    </button>
                </div>

                <div
                    id="plano-con-punteros"
                    style={{
                        position: 'relative',
                        display: 'inline-block',
                        width: '100%',
                        cursor: isAddingPointer ? 'crosshair' : 'default',
                    }}
                    onClick={handleMapClick}
                    onMouseMove={handleMouseMove}
                    onKeyPress={handleKeyPress}
                    tabIndex={0}
                >
                    <img
                        src={imagenPlano}
                        alt="Plano"
                        style={{ width: '90%', height: 'auto' }}
                    />
                    <br /><br />
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
                                opacity: 0.4,
                                cursor: 'pointer',
                            }}
                        />
                    ))}
                    {newLote && (
                        <div
                            style={{
                                position: 'absolute',
                                left: `${newLote.x}%`,
                                top: `${newLote.y}%`,
                                width: `${newLote.width}%`,
                                height: `${newLote.height}%`,
                                backgroundColor: 'rgba(0, 255, 0, 0.5)',
                                border: '1px dashed blue',
                                pointerEvents: 'none',
                            }}
                        />
                    )}
                </div>
            </div>

            <Modal
                isOpen={isEditModalOpen}
                onRequestClose={handleEditModalClose}
                contentLabel="Editar Puntero"
                className="max-w-xl mx-auto mt-20 bg-white rounded-lg shadow-lg overflow-hidden"
                overlayClassName="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center"
            >
                <div className='p-8'>
                    <h2 className='text-lg font-bold mb-4'>Editar Puntero</h2>
                    {selectedLote && (

                        <form

                            onSubmit={(e) => {
                                e.preventDefault();
                                handleEditLoteSubmit();
                            }}
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium">Estado</label>
                                    <select
                                        value={selectedLote.estado}
                                        className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
                                        onChange={(e) =>
                                            setSelectedLote({ ...selectedLote, estado: e.target.value })
                                        }
                                        required
                                    >
                                        <option value="vendido">Vendido</option>
                                        <option value="reservado">Reservado</option>
                                        <option value="cuotas">Cuotas</option>
                                        <option value="manzana">Se vende por MZ</option>
                                    </select>

                                </div>
                                <div>
                                    <label className='block text-sm font-medium'>Lote</label>
                                    <input
                                        type="text"
                                        value={selectedLote.manlote}
                                        className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
                                        onChange={(e) =>
                                            setSelectedLote({ ...selectedLote, manlote: e.target.value })
                                        }
                                        required
                                    />
                                </div>

                            </div>
                            <br />
                            <div className="flex justify-end mt-4">
                                <button
                                    type="submit"
                                    className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                                >
                                    Guardar

                                </button>

                                <button
                                    type="button"
                                    onClick={handleEditModalClose}
                                    className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeleteLote}
                                    className="bg-red-500 text-white px-4 py-2 rounded mr-2"
                                >

                                    Eliminar
                                </button>
                            </div>
                        </form>

                    )}
                </div>
            </Modal>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onRequestClose={handleModalClose}
                contentLabel="Agregar Puntero"
                className="max-w-xl mx-auto mt-20 bg-white rounded-lg shadow-lg overflow-hidden"
                overlayClassName="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center"
            >
                <div className='p-8'>
                    <h2 className='text-lg font-bold mb-4'>Agregar Puntero</h2>
                    <form onSubmit={(e) => { handleAddLote(); }}>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className='block text-sm font-medium'>Estado</label>
                                <select
                                    value={newLote?.estado || 'disponible'}
                                    className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
                                    onChange={(e) => setNewLote({ ...newLote, estado: e.target.value })}
                                    required
                                >
                                    <option value="vendido">Vendido</option>
                                    <option value="reservado">Reservado</option>
                                    <option value="cuotas">Cuotas</option>
                                    <option value="manzana">Se vende por MZ</option>
                                </select>
                            </div>
                            <div>
                                <label className='block text-sm font-medium'>Descripción</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
                                    value={newLote?.manlote || ''}
                                    onChange={(e) => setNewLote({ ...newLote, manlote: e.target.value })}
                                    required
                                />
                            </div>

                        </div>
                        <div className='flex justify-end mt-4'>
                            <button
                                type="submit"
                                className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                            >Guardar</button>

                            <button
                                type="button"
                                onClick={handleModalClose}
                                className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                            >
                                Cancelar</button>

                        </div>
                    </form>
                </div>
            </Modal>

            <ToastContainer />
        </>
    );
};

export default PlanoConPuntero;

