import { useEffect } from 'react';
import { Container, Typography, Box, Grid } from '@mui/material';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { 
  School as SchoolIcon, 
  LocationOn, 
  Phone, 
  Email, 
  Copyright 
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const Footer = () => {
  useEffect(() => {
    // Bubble animation
    const createBubble = () => {
      const footer = document.querySelector('.footer-bubbles');
      if (!footer) return;
      
      const bubble = document.createElement('span');
      const size = Math.random() * 60 + 20;
      const position = Math.random() * 100;
      const duration = Math.random() * 15 + 5;
      
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.left = `${position}%`;
      bubble.style.animationDuration = `${duration}s`;
      
      bubble.className = 'bg-white/10 absolute rounded-full pointer-events-none animate-bubble';
      footer.appendChild(bubble);
      
      setTimeout(() => {
        bubble.remove();
      }, duration * 1000);
    };
    
    const interval = setInterval(createBubble, 1000);
    return () => clearInterval(interval);
  }, []);
  
  return (
  
     <Box className="relative overflow-hidden bg-gradient-to-r from-blue-900 to-indigo-800 text-white mt-auto w-full">
      <div className="footer-bubbles absolute inset-0 z-0 overflow-hidden"></div>
      <Container className="relative z-10 py-12" maxWidth="lg">
        <Grid container spacing={5} className="mb-10">
          <Grid item xs={12} md={4}>
            <Box className="flex items-center mb-4">
              <SchoolIcon className="mr-2 text-3xl text-blue-300" />
              <Typography variant="h5" className="font-bold">
                Smart Campus
              </Typography>
            </Box>
            <Typography variant="body2" className="mb-4 text-gray-200">
              Empowering education through smart technology solutions for a better campus experience.
            </Typography>
            <Box className="flex space-x-3">
              <Link to="#" className="p-2 bg-blue-800 hover:bg-blue-700 rounded-full transition-all duration-300 flex items-center justify-center w-10 h-10">
                <FaFacebookF className="text-blue-300" />
              </Link>
              <Link to="#" className="p-2 bg-blue-800 hover:bg-blue-700 rounded-full transition-all duration-300 flex items-center justify-center w-10 h-10">
                <FaTwitter className="text-blue-300" />
              </Link>
              <Link to="#" className="p-2 bg-blue-800 hover:bg-blue-700 rounded-full transition-all duration-300 flex items-center justify-center w-10 h-10">
                <FaInstagram className="text-blue-300" />
              </Link>
              <Link to="#" className="p-2 bg-blue-800 hover:bg-blue-700 rounded-full transition-all duration-300 flex items-center justify-center w-10 h-10">
                <FaLinkedinIn className="text-blue-300" />
              </Link>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="h6" className="font-bold mb-4 border-b border-blue-700 pb-2">
              Quick Links
            </Typography>
            <Link to="/about" >
              <span className="block mb-2 text-gray-200 hover:text-white hover:translate-x-1 transition-all duration-300">About Us</span>
            </Link>
            <Link to="/privacy-policy">
            <span className="block mb-2 text-gray-200 hover:text-white hover:translate-x-1 transition-all duration-300"> Privacy Policy</span>
             
            </Link>
            <Link to="/terms">
            <span className="block mb-2 text-gray-200 hover:text-white hover:translate-x-1 transition-all duration-300"> Terms & Conditions</span>
            
            </Link>
            <Link to="/contact" >
            <span className="block mb-2 text-gray-200 hover:text-white hover:translate-x-1 transition-all duration-300">Contact Us</span>
            </Link>
           
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="h6" className="font-bold mb-4 border-b border-blue-700 pb-2">
              Contact Information
            </Typography>
            <Box className="flex items-start mb-3">
              <LocationOn className="mr-2 text-blue-300 mt-1" />
              <Typography variant="body2" className="text-gray-200">
                Head Office (Block E)
                ESOFT Metro Campus No.03,
                De Fonseka Place, Colombo 4, Sri Lanka.
              </Typography>
            </Box>
            <Box className="flex items-center mb-3">
              <Phone className="mr-2 text-blue-300" />
              <Typography variant="body2" className="text-gray-200">
              +94 117 572 572
              </Typography>
            </Box>
            <Box className="flex items-center mb-3">
              <Email className="mr-2 text-blue-300" />
              <Typography variant="body2" className="text-gray-200">
                info@esoft.lk
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        <Box className="border-t border-blue-700 pt-4 mt-4 text-center">
          <Typography variant="body2" className="flex justify-center items-center text-gray-300">
            <Copyright className="mr-1 text-sm" /> 
            {new Date().getFullYear()} Smart Campus Management System. All rights reserved. Developed by ESOFT-KU-B12-GROUP-02
          </Typography>
        </Box>
      </Container>
      
      <style>{`
        @keyframes bubble {
          0% {
            bottom: -50px;
            opacity: 0.5;
          }
          100% {
            bottom: 100%;
            opacity: 0;
          }
        }
        .animate-bubble {
          position: absolute;
          animation-name: bubble;
          animation-timing-function: linear;
          animation-iteration-count: 1;
        }
        
        /* Footer always at bottom styles */
        #__next, body, html {
          height: 100%;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        
        main {
          flex: 1 0 auto;
        }
        
        footer {
          flex-shrink: 0;
        }
      `}</style>
    </Box>

  )
}

export default Footer