import React from 'react';

const ModalEditProfile = ({ isOpen, onClose, userData, handleInputChange, handleSaveEdit }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background overlay with blur */}
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-md" onClick={onClose}></div>

      {/* Modal content */}
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg p-8 z-10">
        <h2 className="text-2xl font-bold text-center mb-6">Editar Perfil</h2>

        {/* Input fields */}
        <div className="space-y-4">
          {[
            { name: 'firstName', label: 'Nombres', type: 'text', icon: '👤' },
            { name: 'lastName', label: 'Apellidos', type: 'text', icon: '👥' },
            { name: 'email', label: 'Correo electrónico', type: 'email', icon: '✉️' },
          ].map((field) => (
            <div key={field.name} className="flex items-center">
              <div className="flex-shrink-0 w-6 h-6 mr-2 text-xl">{field.icon}</div>
              <input
                type={field.type}
                name={field.name}
                value={userData[field.name]}
                onChange={handleInputChange}
                placeholder={field.label}
                className="w-full bg-gray-100 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña:</label>
            <input
              type="password"
              name="password"
              value={userData.password}
              onChange={handleInputChange}
              className="w-full mt-1 py-2 px-3 bg-gray-100 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={handleSaveEdit}
            className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition duration-300"
          >
            Guardar Cambios
          </button>
          <button
            onClick={onClose}
            className="bg-gray-800 text-white px-4 py-2 rounded-full hover:bg-gray-900 transition duration-300"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEditProfile;
