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
  let userData = null;
  
  try {
    if (userCookie) {//Check if user cookie exists
       userData = JSON.parse(userCookie);
      userRole = userData.role;
    }else{
      return <Navigate to="/login" replace />;
    }
  } catch (error) {
    console.error('Error parsing user cookie:', error);
  }

  // If user has the correct role, render the requested page, otherwise redirect to login
  if (userRole === allowedRole) {
    return element;
  }else if(allowedRole === "" && userData ){ // If no role is specified, render the requested page
    return element;
  } else {
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
