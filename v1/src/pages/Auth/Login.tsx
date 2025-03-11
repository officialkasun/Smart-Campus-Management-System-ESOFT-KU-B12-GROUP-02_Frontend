import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import config from '../../config';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  Container,
  Box,
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const token = Cookies.get('token');
    const userCookie = Cookies.get('user');
    
    if (token && userCookie) {
      try {
        const user = JSON.parse(userCookie);
        const role = user.role?.toLowerCase() || 'user';
        
        // Navigate to role-specific dashboard
        navigate(`/${role}/dashboard`);
        console.log(`Redirecting to /${role}/dashboard`);
      } catch (error) {
        console.error('Error parsing user data:', error);
        // If there's an error parsing user data, clear cookies and stay on login page
        Cookies.remove('token');
        Cookies.remove('user');
      }
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${config.apiUrl}/api/auth/login`, {
        email,
        password,
      });
      
      // Store user data and token in cookies for session management
      Cookies.set('user', JSON.stringify(response.data.user));
      Cookies.set('token', response.data.token);
      
      setSuccess('Login successful! Redirecting...');
      
      // Get user role and create the appropriate dashboard URL
      const role = response.data.user.role?.toLowerCase() || 'user';
      const dashboardUrl = `/${role}/dashboard`;
      
      // Wait a short moment before redirecting for better UX
      setTimeout(() => {
        navigate(dashboardUrl);
      }, 1000);
      
    } catch (err) {
      setError('Login failed. Please check your credentials and try again.');
      console.error(err);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 w-full">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Paper elevation={3} className="p-8 rounded-lg">
          <Container maxWidth="sm" className="p-4">
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Typography 
                  component="h1" 
                  variant="h4" 
                  className="text-center font-bold text-blue-600 mb-6"
                >
                  Campus Login
                </Typography>
              </motion.div>

              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>
                </motion.div>
              )}
              
              {success && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{success}</Alert>
                </motion.div>
              )}

              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FaEnvelope className="text-gray-400" />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                  className="mb-4"
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FaLock className="text-gray-400" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={togglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                  className="mb-4"
                />
                
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ 
                      mt: 3, 
                      mb: 2, 
                      py: 1.5, 
                      bgcolor: 'primary.main',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      }
                    }}
                  >
                    Sign In
                  </Button>
                </motion.div>
                
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                  <Typography variant="body2" className="text-gray-600">
                    Forgot password? <a href="#" className="text-blue-600 hover:underline">Reset here</a>
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Container>
        </Paper>
      </motion.div>
    </div>
  );
};

export default Login;