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
<<<<<<< HEAD


=======
import Users from './pages/Features/Admin/Users';
import Courses from './pages/Features/Admin/Courses';
import { default as CoursesLecture } from './pages/Features/Lecturer/Courses';
import { default as EventsLecturer } from './pages/Features/Lecturer/Events';
import { default as ResourcesLecturer } from './pages/Features/Lecturer/Resources';


import { default as ResourcesStudent } from './pages/Features/Student/Resources';
import Events from './pages/Features/Admin/Events';
import Resources from './pages/Features/Admin/Resources';
import Students from './pages/Features/Lecturer/Students';
import Schedules from './pages/Features/Admin/Schedules';
import Analytics from './pages/Features/Admin/Analytics';
import Notifications from './pages/MyAccount/Notifications';

>>>>>>> 736b41d16c7c91198e2c045685e27519df7621bd
function App() {
  return (
    <Router>
      <Navbar />
      <Container 
      className='mt-[100px] mb-[100px] flex items-center justify-center'
      >
        <Routes>
          <Route path="/" element={<Home />} />
      
<<<<<<< HEAD
          <Route path="/admin/dashboard" element={<ProtectedRoute element={<Dashboard />} allowedRole="admin" />} />

          //Kasuns Part
=======
        

          //Kasun's Part
          <Route path="/admin/dashboard" element={<ProtectedRoute element={<Dashboard />} allowedRole="admin" />} />
>>>>>>> 736b41d16c7c91198e2c045685e27519df7621bd
          <Route path="/admin/users" element={<ProtectedRoute element={<Users />} allowedRole="admin" />}  />
          <Route path="/admin/courses" element={<ProtectedRoute element={<Courses />} allowedRole="admin" />}  />
          <Route path="/admin/events" element={<ProtectedRoute element={<Events />} allowedRole="admin" />}  />
          <Route path="/admin/resources" element={<ProtectedRoute element={<Resources />} allowedRole="admin" />}  />
          <Route path="/admin/schedules" element={<ProtectedRoute element={<Schedules />} allowedRole="admin" />}  />
<<<<<<< HEAD
          //close Kasuns Part


          <Route path="/lecturer/dashboard" element={<ProtectedRoute element={<Dashboard />} allowedRole="lecturer" />} />

          //Dilhans Part
          <Route path="/lecturer/courses" element={<ProtectedRoute element={<CoursesLecture />} allowedRole="lecturer" />} />
          <Route path="/lecturer/students" element={<ProtectedRoute element={<Students />} allowedRole="lecturer" />} />
          <Route path="/lecturer/events" element={<ProtectedRoute element={<EventsLecturer />} allowedRole="lecturer" />} />
=======
          <Route path="/admin/analytics" element={<ProtectedRoute element={<Analytics />} allowedRole="admin" />}  />



          <Route path="/student/resources" element={<ProtectedRoute element={<ResourcesStudent />} allowedRole="student" />}  />



          //close Kasun's Part


  

          //Dilhans Part
          <Route path="/lecturer/dashboard" element={<ProtectedRoute element={<Dashboard />} allowedRole="lecturer" />} />
          <Route path="/lecturer/courses" element={<ProtectedRoute element={<CoursesLecture />} allowedRole="lecturer" />} />
          <Route path="/lecturer/students" element={<ProtectedRoute element={<Students />} allowedRole="lecturer" />} />
          <Route path="/lecturer/events" element={<ProtectedRoute element={<EventsLecturer />} allowedRole="lecturer" />} />
          <Route path="/lecturer/resources" element={<ProtectedRoute element={<ResourcesLecturer />} allowedRole="lecturer" />} />
>>>>>>> 736b41d16c7c91198e2c045685e27519df7621bd
          //close Dilhans Part

          <Route path="/student/dashboard" element={<ProtectedRoute element={<Dashboard />} allowedRole="student" />} />
          <Route path="/account"  element={<ProtectedRoute element={<ManageMe />} allowedRole="" />}/>
<<<<<<< HEAD
=======
          <Route path="/notifications"  element={<ProtectedRoute element={<Notifications />} allowedRole="" />}/>
>>>>>>> 736b41d16c7c91198e2c045685e27519df7621bd
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