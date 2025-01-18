import { useState } from 'react';
import { GiWilliamTellSkull } from "react-icons/gi";
import { GoAlert } from "react-icons/go";

const ConfirmEditModal = ({ onConfirmEdit, onConfirmDelete }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [actionType, setActionType] = useState(null); // Para determinar si es editar o eliminar

  const handleConfirmEdit = () => {
    setActionType('edit');
    setShowConfirm(true); // Muestra el modal de confirmación
  };

  const handleConfirmDelete = () => {
    setActionType('delete');
    setShowConfirm(true); // Muestra el modal de confirmación
  };

  const handleConfirmResponse = (confirm) => {
    if (confirm) {
      if (actionType === 'edit') {
        onConfirmEdit(); // Realiza la acción de editar si se confirma
      } else if (actionType === 'delete') {
        onConfirmDelete(); // Realiza la acción de eliminar si se confirma
      }
    }
    setShowConfirm(false); // Cierra el modal
  };

  return (
    <>
      {/* Botón para editar */}
      <button
        type="button"
        onClick={handleConfirmEdit}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 ease-in-out"
      >
        Guardar
      </button>

      {/* Botón para eliminar */}
      <button
        type="button"
        onClick={handleConfirmDelete}
        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 ease-in-out ml-4"
      >
        Eliminar
      </button>

      {/* Modal de confirmación */}
      {showConfirm && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <div className="flex flex-col items-center">
              {/* Imagen de advertencia */}
              <div>
                {actionType === 'edit' ? (
                  <GoAlert size={100} color='yellow' /> // Imagen de alerta para la acción de guardar
                ) : (
                  <GiWilliamTellSkull size={100} color='red' /> // Imagen de alerta para la acción de eliminar
                )}
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                Confirmar {actionType === 'edit' ? 'Edición' : 'Eliminación'}
              </h4>
              <p className="text-gray-600 mb-6 text-center">
                ¿Estás seguro de que quieres {actionType === 'edit' ? 'editar' : 'eliminar'} este lote?
              </p>
            </div>

            <div className="flex justify-between space-x-4">
              {/* Botón de Confirmar, ahora en la posición del botón de cancelar */}
              <button
                className={`${actionType === 'edit' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'} 
              text-white py-2 px-4 rounded-lg transition-all duration-300 ease-in-out`}
                onClick={() => handleConfirmResponse(true)}
              >
                Confirmar
              </button>

              {/* Botón de Cancelar, ahora en la posición del botón de confirmar */}
              <button
                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-all duration-300 ease-in-out"
                onClick={() => handleConfirmResponse(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConfirmEditModal;
