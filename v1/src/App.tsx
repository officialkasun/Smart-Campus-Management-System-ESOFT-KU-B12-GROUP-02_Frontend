import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Public/Home';
import About from './pages/Public/About';
import Contact from './pages/Public/Contact';
import Error404 from './pages/Public/Error404';
import { Container } from '@mui/material';
import Navbar from './components/Navbar';
import Login from './pages/Auth/Login';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ManageMe from './pages/MyAccount/ManageMe';
import Users from './pages/Features/Admin/Users';
import Courses from './pages/Features/Admin/Courses';
import { default as CoursesLecture } from './pages/Features/Lecturer/Courses';
import Events from './pages/Features/Admin/Events';
import Resources from './pages/Features/Admin/Resources';
import Students from './pages/Features/Lecturer/Students';

function App() {
  return (
    <Router>
      <Navbar />
      <Container 
      className='mt-[100px] mb-[100px] flex items-center justify-center'
      >
        <Routes>
          <Route path="/" element={<Home />} />
      
          <Route path="/admin/dashboard" element={<ProtectedRoute element={<Dashboard />} allowedRole="admin" />} />

          //Kasuns Part
          <Route path="/admin/users" element={<ProtectedRoute element={<Users />} allowedRole="admin" />}  />
          <Route path="/admin/courses" element={<ProtectedRoute element={<Courses />} allowedRole="admin" />}  />
          <Route path="/admin/events" element={<ProtectedRoute element={<Events />} allowedRole="admin" />}  />
          <Route path="/admin/resources" element={<ProtectedRoute element={<Resources />} allowedRole="admin" />}  />
          //close Kasuns Part


          <Route path="/lecturer/dashboard" element={<ProtectedRoute element={<Dashboard />} allowedRole="lecturer" />} />

          //Dilhans Part
          <Route path="/lecturer/courses" element={<ProtectedRoute element={<CoursesLecture />} allowedRole="lecturer" />} />
          <Route path="/lecturer/students" element={<ProtectedRoute element={<Students />} allowedRole="lecturer" />} />
          //close Dilhans Part

          <Route path="/student/dashboard" element={<ProtectedRoute element={<Dashboard />} allowedRole="student" />} />
          <Route path="/account"  element={<ProtectedRoute element={<ManageMe />} allowedRole="" />}/>
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<Error404 />} />
        </Routes>
      </Container>
      
      <Footer />
    </Router>
  );
}

//Managed by Admin
export default App;