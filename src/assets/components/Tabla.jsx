import React, { useState } from 'react';

export default function Tabla() {
  const [clientes, setClientes] = useState([
    { id: 1, nombre: "John Doe", fechaCompra: "2023-01-15", ubicacion: "Lote 5, Sector A", tamaño: "200m²", precio: "$30,000", estadoPago: "Pagado" },
    { id: 2, nombre: "Jane Smith", fechaCompra: "2023-03-22", ubicacion: "Lote 12, Sector B", tamaño: "250m²", precio: "$35,000", estadoPago: "Pendiente" },
  ]);

  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 2;

  const agregarCliente = () => {
    const nombre = prompt("Ingrese el nombre del cliente:");
    const fechaCompra = prompt("Ingrese la fecha de compra (YYYY-MM-DD):");
    const ubicacion = prompt("Ingrese la ubicación del terreno:");
    const tamaño = prompt("Ingrese el tamaño del terreno (en m²):");
    const precio = prompt("Ingrese el precio del terreno:");
    const estadoPago = prompt("Ingrese el estado de pago:");

    const nuevoCliente = {
      id: Date.now(),
      nombre,
      fechaCompra,
      ubicacion,
      tamaño,
      precio,
      estadoPago
    };

    setClientes([...clientes, nuevoCliente]);
  };

  const eliminarCliente = (id) => {
    setClientes(clientes.filter(cliente => cliente.id !== id));
  };

  const modificarCliente = (id) => {
    const clienteModificado = clientes.find(cliente => cliente.id === id);

    const nombre = prompt("Ingrese el nuevo nombre del cliente:", clienteModificado.nombre);
    const fechaCompra = prompt("Ingrese la nueva fecha de compra (YYYY-MM-DD):", clienteModificado.fechaCompra);
    const ubicacion = prompt("Ingrese la nueva ubicación del terreno:", clienteModificado.ubicacion);
    const tamaño = prompt("Ingrese el nuevo tamaño del terreno (en m²):", clienteModificado.tamaño);
    const precio = prompt("Ingrese el nuevo precio del terreno:", clienteModificado.precio);
    const estadoPago = prompt("Ingrese el nuevo estado de pago:", clienteModificado.estadoPago);

    setClientes(clientes.map(cliente => cliente.id === id ? {
      ...cliente,
      nombre,
      fechaCompra,
      ubicacion,
      tamaño,
      precio,
      estadoPago
    } : cliente));
  };

  const totalPaginas = Math.ceil(clientes.length / elementosPorPagina);

  const clientesPaginados = clientes.slice((paginaActual - 1) * elementosPorPagina, paginaActual * elementosPorPagina);

  return (
    <section className="text-gray-600 body-font">
      <div className="container px-5 py-24 mx-auto">
        <div className="flex flex-col text-center w-full mb-20">
          <h1 className="sm:text-4xl text-3xl font-medium title-font mb-2 text-gray-900">Tabla de Clientes de Terrenos</h1>
          <p className="lg:w-2/3 mx-auto leading-relaxed text-base">Registro detallado de clientes que han adquirido terrenos a través de nuestra constructora, incluyendo información sobre la fecha de compra, ubicación del terreno, tamaño, precio, y estado de pago.</p>
        </div>
        <div className="lg:w-2/3 w-full mx-auto overflow-auto">
          <table className="table-auto w-full text-left whitespace-no-wrap">
            <thead>
              <tr>
                <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100 rounded-tl rounded-bl">Cliente</th>
                <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Fecha de Compra</th>
                <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Ubicación de Terreno</th>
                <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Tamaño de Terreno</th>
                <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Precio</th>
                <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Estado de Pago</th>
                <th className="w-10 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100 rounded-tr rounded-br"></th>
              </tr>
            </thead>
            <tbody>
              {clientesPaginados.map(cliente => (
                <tr key={cliente.id}>
                  <td className="px-4 py-3">{cliente.nombre}</td>
                  <td className="px-4 py-3">{cliente.fechaCompra}</td>
                  <td className="px-4 py-3">{cliente.ubicacion}</td>
                  <td className="px-4 py-3">{cliente.tamaño}</td>
                  <td className="px-4 py-3">{cliente.precio}</td>
                  <td className="px-4 py-3">{cliente.estadoPago}</td>
                  <td className="w-10 text-center">
                    <button onClick={() => modificarCliente(cliente.id)} className="text-blue-500">Modificar</button>
                    <button onClick={() => eliminarCliente(cliente.id)} className="text-red-500 ml-2">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between mt-4">
            <button onClick={agregarCliente} className="text-white bg-green-500 border-0 py-2 px-6 focus:outline-none hover:bg-green-600 rounded">Agregar Cliente</button>
            <div>
              {Array.from({ length: totalPaginas }, (_, i) => (
                <button key={i + 1} onClick={() => setPaginaActual(i + 1)} className={`mx-1 px-3 py-1 ${paginaActual === i + 1 ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-black'} rounded`}>
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
