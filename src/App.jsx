import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './assets/paginas/Home';
import Proyecto from './assets/paginas/Proyecto';
import Opciones from './assets/paginas/Opciones';
import LotesSeparados from './assets/paginas/LotesSeparados';
import LotesVendidos from './assets/paginas/LotesVendidos';
import ProtectedRoute from './assets/components/ProtectedRoute';
import Login from './assets/paginas/Login';
import Perfil from './assets/paginas/Perfil/Perfil';
import Depositos from './assets/paginas/Depositos';
import Plano from './assets/paginas/Plano';
import Informes from './assets/paginas/Informes';
import Error from './assets/components/404/Error';
import Users from './assets/paginas/Users';

function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path="/Login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
            } />
          <Route path="/proyecto" element={ <ProtectedRoute> <Proyecto /></ProtectedRoute> } />
          <Route path="/opciones/:id" element={<ProtectedRoute><Opciones /></ProtectedRoute>} />
          <Route path="/LotesSeparados/:proyectoId" element={<ProtectedRoute><LotesSeparados /></ProtectedRoute>} />
          <Route path="/LotesVendidos/:proyectoId" element={<ProtectedRoute> <LotesVendidos/> </ProtectedRoute>} /> 
          <Route path="/Depositos" element={<ProtectedRoute><Depositos/> </ProtectedRoute>} />
          <Route path="/Plano/:proyectoId" element={<ProtectedRoute><Plano/> </ProtectedRoute>} />
          <Route path="/Informes" element={<ProtectedRoute><Informes/> </ProtectedRoute>} />
          <Route path="/UsersControl" element={<ProtectedRoute><Users/></ProtectedRoute>}/>
          <Route path='/perfil' element={
            <ProtectedRoute>
              <Perfil />
            </ProtectedRoute>
          } />
          <Route path='*' element={<Error/>} />
        </Routes>

      </Router>


    </>
  )
}

export default App
