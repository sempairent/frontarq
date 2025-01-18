import React from 'react';
import backgroundImage from '../../images/diseños/house.jpg'

const FondoPaginas = ({ children }) => {
  return (
    <div 
      style={{ 
        backgroundImage: `url(${backgroundImage})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center', 
        minHeight: '100vh', 
        padding: '20px' 
      }}
    >
      {children}
    </div>
  );
}

export default FondoPaginas;
