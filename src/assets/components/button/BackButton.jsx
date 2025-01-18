import { useNavigate } from 'react-router-dom';
import { IoArrowBackCircleOutline } from 'react-icons/io5';

const BackButton = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); 
  };

  return (
    <IoArrowBackCircleOutline
      onClick={handleBack}
      size={40} 
      style={{ cursor: 'pointer',
        marginTop: '-30',
       }}
    />
  );
};

export default BackButton;
