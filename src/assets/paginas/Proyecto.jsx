import { useState, useEffect } from "react";
import Modal from "react-modal";
import Card from "../components/Card";
import Navbar from "../components/Navbar";
import Cardpaginas from "../components/cardPaginas";
import Title from "../components/Title";
import FondoPaginas from "../components/fondospagina/FondoPaginas";
import BackButton from "../components/button/BackButton";
import { useNavigate } from "react-router-dom";

Modal.setAppElement("#root"); // Evita advertencias de accesibilidad

export default function Proyecto() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [newProject, setNewProject] = useState({ nombre: "", descripcion: "" });
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
      const role = localStorage.getItem('role');
      if (role) {
          setUserRole(role);
      }
  }, []); 

  useEffect(() => {
    fetchProjects();
  }, []);

  // Función para obtener los proyectos
  const fetchProjects = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/proyectos`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Error al obtener los proyectos");
      }
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProvinciaClick = (id) => {
    navigate(`/opciones/${id}`);
  };

  // Función para manejar la creación de un nuevo proyecto
  const handleCreateProject = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/proyectos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newProject),
      });

      if (!response.ok) {
        throw new Error("Error al crear el proyecto");
      }

      // Cierra el modal y recarga la lista de proyectos
      setModalIsOpen(false);
      setNewProject({ nombre: "", descripcion: "" });
      fetchProjects();
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  return (
    <>
      <FondoPaginas>
        <Navbar />
        <div className="block md:hidden">
          <BackButton />
        </div>
        <Cardpaginas>
          <Title>PROYECTOS</Title>

          <div className="container mx-auto p-4 max-w-screen-lg">
            {/* Botón para abrir el modal */}
            {userRole === 'admin' && (
              <button
              onClick={() => setModalIsOpen(true)}
              className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
            >
              Crear Proyecto
            </button>
            )}
            <br /><br />

            {loading ? (
              <p>Cargando proyectos...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {projects.map((project) => (
                  <Card key={project.id} onClick={() => handleProvinciaClick(project.id)}>
                    <h2 className="text-xl font-bold">{project.nombre}</h2>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Cardpaginas>
      </FondoPaginas>

      {/* MODAL PARA CREAR PROYECTO */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        className={`max-w-xl mx-auto mt-20 bg-white rounded-lg shadow-lg overflow-hidden`}
        overlayClassName={`fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center`}
      >
        <div className="p-8">
          <h2 className="text-xl font-bold mb-4">Nuevo Proyecto</h2>

          <form onSubmit={handleCreateProject}>
            <div className="mb-3">
              <label className="block text-sm font-semibold">Nombre</label>
              <input
                type="text"
                className="border rounded w-full p-2"
                placeholder="Nombre del Proyecto"
                value={newProject.nombre}
                onChange={(e) => setNewProject({ ...newProject, nombre: e.target.value })}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold">Descripción (Imagen)</label>
              <input
                type="text"
                className="border rounded w-full p-2"
                placeholder="/planos/nombre_imagen.avif"
                value={newProject.descripcion}
                onChange={(e) => setNewProject({ ...newProject, descripcion: e.target.value })}
                required
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setModalIsOpen(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancelar
              </button>
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
                Guardar
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
