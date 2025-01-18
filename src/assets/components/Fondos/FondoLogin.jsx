
import videoFile from '/walpaper/small.webm'

const FondoLogin = ({ children }) => {
  return (
    <div className="relative w-full h-screen overflow-hidden">
     
      <video
        autoPlay
        loop
        muted
        className="absolute top-0 left-0 w-full h-full object-cover "
      >
        <source src={videoFile} type="video/webm" />
        Tu navegador no soporta video.
      </video>

      
      <div className="relative z-10 flex items-center justify-center w-full h-full bg-black bg-opacity-10">
        {children}
      </div>
    </div>
  );
};

export default FondoLogin;

//login//