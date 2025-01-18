
const API_URL = import.meta.env.VITE_API_URL;
//console.log(API_URL)


// Función para obtener el token almacenado
const getToken = () => {
  return localStorage.getItem('token');
};

export const login = async (email, password) => {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
    
        const data = await response.json();
    
        if (!response.ok) {
            throw new Error(data.error || 'Error en el inicio de sesión');
        }
    
        //toast.success('Inicio exitoso');
    
        localStorage.setItem('token', data.token);
        localStorage.setItem('firstName', data.user.firstName);
        localStorage.setItem('lastName', data.user.lastName);
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('role', data.user.role);
    /*
        setTimeout(() => {
            navigate('/');
        }, 1000);
        */
       return data;
    } catch (err) {
        //console.log("error durante el login",err);
        throw err;
    }
}

// Función para obtener manzanas
export const fetchManzanas = async (page, pageSize, searchTerms) => {
    try {
      const token = getToken();
      const query = new URLSearchParams({ page, pageSize, ...searchTerms }).toString();
      const response = await fetch(`${API_URL}/manzanas?${query}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Error fetching data');
      return await response.json();
    } catch (error) {
      throw new Error('Error fetching manzanas');
    }
  };
  
  // Función para actualizar una manzana
  export const updateManzana = async (id, data) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/manzanas/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error updating data');
      }
  
      return await response.json();
    } catch (error) {
      throw new Error('Error updating manzana');
    }
  };


// datos de l perfil
export const fetchUserProfile = async () => {
  try {
      const token = getToken();
      const response = await fetch(`${API_URL}/profile`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Error fetching profile data');
      return await response.json();
  } catch (error) {
      throw new Error('Error fetching user profile');
  }
};

// actualizar el perfil
export const updateUserProfile = async (id, updatedFields) => {
  try {
      const token = getToken();
      const response = await fetch(`${API_URL}/update`, {
          method: 'PATCH',
          headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id, ...updatedFields }),
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error updating profile');
      }

      return await response.json();
  } catch (error) {
      throw new Error('Error updating user profile');
  }
};

/////provincias///
export const fetchProvincias = async () => {
  try {
    const token = getToken();
    const response = await fetch(`${API_URL}/provincias`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Error fetching provincias');
    return await response.json();
  } catch (error) {
    console.error('Error fetching provincias', error);
    throw error;
  }
};