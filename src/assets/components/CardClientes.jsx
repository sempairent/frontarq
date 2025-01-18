import React from 'react';

export default function CardClientes({ children }) {
  return (
    <>
      <br />
      <div className="hidden md:flex justify-center min-h-screen">
        <div className="flex flex-col text-black-700 backdrop-blur-md bg-white/30 ... shadow-2xl ... bg-clip-border rounded-xl w-11/12 max-w-8xl h-auto p-8">
          {children}
        </div>
      </div>
      <div className="md:hidden">{children}</div>
      <br />
    </>
  );
}