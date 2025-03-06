import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import { Container } from '@mui/material';
import Navbar from './components/Navbar';


function App() {
  return (
    <Router>
      {/* Add Navbar component here */}
      <Navbar />
      <Container>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Container>
    </Router>
  )
}

export default App
