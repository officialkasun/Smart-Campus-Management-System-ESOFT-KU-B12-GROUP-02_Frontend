import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Error404 from './pages/Error404';
import { Container } from '@mui/material';
import Navbar from './components/Navbar';
import Login from './pages/Auth/Login';
import Test from './pages/Test';
import Footer from './components/Footer';
import Dashboard from './pages/Admin/Dashboard/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  

  return (
<<<<<<< HEAD
    <>
      <Router>
=======
    <Router>
      <Navbar />
      <Container 
   
      className='mt-[100px] mb-[100px] flex items-center justify-center'
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/test" element={<Test />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute element={<Dashboard />} allowedRole="admin" />} />
          <Route path="/lecturer/dashboard" element={<ProtectedRoute element={<Dashboard />} allowedRole="lecturer" />} />
          <Route path="/student/dashboard" element={<ProtectedRoute element={<Dashboard />} allowedRole="student" />} />
          <Route path="/account"  element={<ProtectedRoute element={<ManageMe />} allowedRole="" />}/>
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<Error404 />} />
        </Routes>
<<<<<<< HEAD
      </Router>
    </>
=======
      </Container>
      
      <Footer />
    </Router>
  )
}

export default App;