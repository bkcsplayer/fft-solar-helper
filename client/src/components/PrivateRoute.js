import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  const token = localStorage.getItem('token');

  if (!token && !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
