import { Link } from "react-router-dom";

export default function Buntoons() {
  return (
    <div className="flex flex-wrap justify-center gap-8 mt-12">
  
  <Link to="/proyectos/totorani">
  <article className="relative flex flex-col justify-end overflow-hidden rounded-xl w-80 h-60 bg-white shadow-lg">
    <img src="https://th.bing.com/th/id/R.9358e71d8188de873e65a2b241b4b196?rik=ufRKoRmbIxkSNg&pid=ImgRaw&r=0" alt="University of Southern California" className="absolute inset-0 h-full w-full object-cover opacity-80"/>
    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40"></div>
    <div className="relative z-10 flex flex-col items-start p-4">
      <h3 className="text-xl font-semibold text-white mb-2">Puno</h3>
      <div className="text-sm text-gray-300">City of love</div>
    </div>
  </article>
  </Link>
  

  <Link to="/proyectos/totorani">
  <article className="relative flex flex-col justify-end overflow-hidden rounded-xl w-80 h-60 bg-white shadow-lg">
    <img src="https://www.iperu.org/wp-content/uploads/2023/08/Turismo-en-Juliaca.webp" alt="University of Southern California" className="absolute inset-0 h-full w-full object-cover opacity-80"/>
    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40"></div>
    <div className="relative z-10 flex flex-col items-start p-4">
      <h3 className="text-xl font-semibold text-white mb-2">JUliaca</h3>
      <div className="text-sm text-gray-300">City of history</div>
    </div>
  </article>
  </Link>

  <Link to="/proyectos/totorani">
  <article className="relative flex flex-col justify-end overflow-hidden rounded-xl w-80 h-60 bg-white shadow-lg">
    <img src="https://th.bing.com/th/id/R.3f933ce1af84ba4430fda42f916091b3?rik=yhOjpNo7NK2hpw&riu=http%3a%2f%2fwww.viajejet.com%2fwp-content%2fviajes%2farequipa.jpg&ehk=P3ijvc8Ceh4%2bpUFLyX1LfdzLQDoH4tkGGLHPUxGxId0%3d&risl=&pid=ImgRaw&r=0" alt="University of Southern California" className="absolute inset-0 h-full w-full object-cover opacity-80"/>
    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40"></div>
    <div className="relative z-10 flex flex-col items-start p-4">
      <h3 className="text-xl font-semibold text-white mb-2">Arequipa</h3>
      <div className="text-sm text-gray-300">City of dreams</div>
    </div>
  </article>
  </Link>
</div>

  );
}
