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

function App() {
  

  return (
<<<<<<< HEAD
    <>
      <Router>
=======
    <Router>
      <Navbar />
      <Container 
   
      className='mt-[100px]'
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/test" element={<Test />} />
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