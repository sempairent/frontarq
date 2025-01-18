import React from 'react';

export default function Cardpaginas({ children }) {
  return (
    <>
      <br />
      <div className="flex justify-center min-h-screen">
        <div className="flex flex-col text-black-700 backdrop-grayscale-0 bg-white/30 ... shadow-2xl ... bg-clip-border rounded-xl w-11/12 max-w-8xl h-auto p-8">
          {children}
        </div>
      </div>
      <br />
    </>
  );
}