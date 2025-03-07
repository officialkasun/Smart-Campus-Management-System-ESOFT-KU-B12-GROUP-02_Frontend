import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
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
      <Container>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
<<<<<<< HEAD
      </Router>
    </>
=======
      </Container>
    </Router>
>>>>>>> 334eeaf (bug fixed - Router Issue (react-router-dom) into (react-router))
  )
}

export default App
