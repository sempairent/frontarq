import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function ProtectedRoute({ children }) {
    const token = localStorage.getItem('token');
    const firstName = localStorage.getItem('firstName');
    const lastName = localStorage.getItem('lastName');
    const role = localStorage.getItem('role');

    if (token) {
        try {
            const decodedToken = jwtDecode(token);
            const currentTime = Date.now() / 1000;

            if (decodedToken.exp < currentTime) {
                //console.log('Token expirado');
                localStorage.removeItem('token');
                setTimeout(() => {
                    window.location.reload(); 
                }, 0);
                return <Navigate to="/login" replace />;
            }

           // console.log('Token válido:', token);
           // console.log('Token válido:', firstName);
            //console.log('Token válido:', lastName);
           // console.log('rol: ', role);
        } catch (error) {
            console.error('Error al decodificar el token:', error);
            localStorage.removeItem('token');
            setTimeout(() => {
                window.location.reload(); 
            }, 0);
            return <Navigate to="/login" />;
            
        }
    } else {
        //console.log('No hay token');
        return <Navigate to="/login" />;
    }

    return children;
}

export default ProtectedRoute;
