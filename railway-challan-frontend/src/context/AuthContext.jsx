import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  // state to hold auth token and user info
  // initialize with values from localStorage if available
  const [auth, setAuth] = useState({
    token: localStorage.getItem('token'),
    refreshToken: localStorage.getItem('refreshToken'),
    user: JSON.parse(localStorage.getItem('user')),
  });

  // set default axios headers when token is available
  useEffect(() => {
    if (auth?.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${auth.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }

    const interceptor = axios.interceptors.response.use(
      res => res,
      async err => {
        const originalRequest = err.config;

        if (err.response?.status === 401 && !originalRequest._retry && auth.refreshToken) {
          originalRequest._retry = true;
          try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}}/api/auth/refresh`, { token: auth.refreshToken }
            );

            const newToken = res.data.token;
            localStorage.setItem('token', newToken);
            setAuth(prev => ({ ...prev, token: newToken }));
            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            logout();
          }
        }
        return Promise.reject(err);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, [auth.token, auth.refreshToken]);

  // function to login user and set token and user info in state and localStorage
  const login = (token, refreshToken ,user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', user.refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    setAuth({ token, refreshToken, user });
  };

  // function to logout user, clear token and user info from state and localStorage
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setAuth({ token: null, refreshToken:null, user: null });
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// hook to use context
export const useAuth = () => useContext(AuthContext);
