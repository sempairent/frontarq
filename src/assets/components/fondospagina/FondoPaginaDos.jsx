import React from 'react';
import backgroundImage from '../../images/diseños/city.jpg'

const FondoPaginas = ({ children }) => {
  return (
    <div 
    className='relative w-full h-screen bg-cover bg-center'
      style={{ 
        backgroundImage: `url(${backgroundImage})`, 
        
      }}
    >
      {children}
    </div>
  );
}

export default FondoPaginas;
