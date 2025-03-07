import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Public/Home';
import About from './pages/Public/About';
import Contact from './pages/Public/Contact';
import Error404 from './pages/Public/Error404';
import { Container } from '@mui/material';
import Navbar from './components/Navbar';
import Login from './pages/Auth/Login';
import Test from './pages/Test';

function App() {
  return (
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
      </Container>
    </Router>
  );
}

export default App;