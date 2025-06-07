import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { token, user } = useAuth();

  // Check if the user is authenticated and has the required role
  // If not, redirect to login or unauthorized page
  if (!token) return <Navigate to="/login" replace />;

  // If roles are specified, check if the user's role is allowed
  
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default PrivateRoute;
