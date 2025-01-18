import PropTypes from 'prop-types';

const Card = ({ onClick, children, imageUrl }) => {
  return (
      <div 
          onClick={onClick}
          className="text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
      >
    
          {children}
      </div>
  );
};

Card.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
 
};

export default Card;
/////card mejoras//////