import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';  // Corrected import
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Error404 from './pages/Error404';
import { Container } from '@mui/material';
import Navbar from './components/Navbar';


function App() {
  

  return (
<<<<<<< HEAD
    <>
      <Router>
=======
    <Router>
      <Navbar />
      <Container sx={{ marginTop: '64px' }}> {/* Adjust marginTop to match the height of the AppBar */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<Error404 />} />
        </Routes>
<<<<<<< HEAD
      </Router>
    </>
=======
      </Container>
    </Router>
  )
}

export default App;