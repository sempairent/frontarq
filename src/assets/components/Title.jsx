import React from 'react';

export default function Title({ children }) {
  return (
    <div className="mb-4">
      <h1 className="font-sans text-2xl font-semibold leading-snug tracking-normal text-blue-gray-900 ">
        
        <span className="box-decoration-slice bg-gradient-to-r from-sky-500 to-teal-600 text-white px-2 ...">
        {children}
</span>
      </h1>
      <div className="mt-2 border-b-2 border-black  shadow-md ..."></div>
    </div>
  );
}
