import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

interface ProtectedRouteProps {
  element: React.ReactElement;
  allowedRole: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, allowedRole }) => {
  // Read the user cookie
  const userCookie = Cookies.get('user');
  let userRole = '';
  
  try {
    if (userCookie) {
      const userData = JSON.parse(userCookie);
      userRole = userData.role;
    }
  } catch (error) {
    console.error('Error parsing user cookie:', error);
  }

  // If user has the correct role, render the requested page, otherwise redirect to login
  if (userRole === allowedRole) {
    return element;
  } else {
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
