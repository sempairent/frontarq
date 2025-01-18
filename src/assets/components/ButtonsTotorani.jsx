import React from 'react';

export default function ButtonsTotorani() {
  return (
    <div className="flex flex-col md:flex-row justify-center gap-6 mt-20">
      {/* Primera tarjeta */}
      <div className="relative max-w-xs mx-auto">
        <img
          className="h-64 w-full object-cover rounded-md"
          src="https://images.unsplash.com/photo-1680725779155-456faadefa26"
          alt="Random image"
        />
        <div className="absolute inset-0 bg-gray-700 opacity-60 rounded-md"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <h2 className="text-white text-3xl font-bold">Proyecto Totorani1</h2>
        </div>
      </div>

      {/* Segunda tarjeta */}
      <div className="relative max-w-xs mx-auto">
        <img
          className="h-64 w-full object-cover rounded-md"
          src="https://images.unsplash.com/photo-1680725779155-456faadefa26"
          alt="Random image"
        />
        <div className="absolute inset-0 bg-gray-700 opacity-60 rounded-md"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <h2 className="text-white text-3xl font-bold">Proyecto Totorani2</h2>
        </div>
      </div>

      {/* Tercera tarjeta */}
      <div className="relative max-w-xs mx-auto">
        <img
          className="h-64 w-full object-cover rounded-md"
          src="https://images.unsplash.com/photo-1680725779155-456faadefa26"
          alt="Random image"
        />
        <div className="absolute inset-0 bg-gray-700 opacity-60 rounded-md"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <h2 className="text-white text-3xl font-bold">Proyecto Totorani3</h2>
        </div>
      </div>
    </div>
  );
}
