import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie';
import axios from 'axios';
import config from '../../config';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  Typography, 
  Avatar, 
  Divider, 
  Chip,
  Grid,
  Box,
  Button,
  Modal,
  TextField,
  InputAdornment,
  IconButton,
  Alert,
  LinearProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { 
  Person as PersonIcon,
  Email as EmailIcon, 
  Phone as PhoneIcon,
  School as SchoolIcon,
  Badge as BadgeIcon,
  Verified as VerifiedIcon,
  AccessTime as AccessTimeIcon,
  Visibility,
  VisibilityOff,
  Lock as LockIcon,
} from '@mui/icons-material';


// Password strength checker
const checkPasswordStrength = (password: string) => {
  let strength = 0;
  
  // Length check
  if (password.length >= 8) strength += 25;
  
  // Contains lowercase letters
  if (password.match(/[a-z]+/)) strength += 25;
  
  // Contains uppercase letters
  if (password.match(/[A-Z]+/)) strength += 25;
  
  // Contains numbers
  if (password.match(/[0-9]+/)) strength += 15;
  
  // Contains special characters
  if (password.match(/[$@#&!]+/)) strength += 10;

  return strength;
};

// Get password strength label
const getPasswordStrengthLabel = (strength: number) => {
  if (strength < 25) return "Very Weak";
  if (strength < 50) return "Weak";
  if (strength < 75) return "Moderate";
  if (strength < 90) return "Strong";
  return "Very Strong";
};

// Get color based on strength
const getPasswordStrengthColor = (strength: number) => {
  if (strength < 25) return "error.main";
  if (strength < 50) return "error.light";
  if (strength < 75) return "warning.main";
  if (strength < 90) return "info.main";
  return "success.main";
};

const ManageMe = () => {
  const [userData, setUserData] = useState<any>(null);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  // New state variables for email update
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Try to get the user cookie using js-cookie library
    const userCookie = Cookies.get('user');
    
    if (userCookie) {
      try {
        const parsedUserData = JSON.parse(userCookie);
        setUserData(parsedUserData);
        
        
        
      } catch (error) {
        console.error('Error parsing user cookie:', error);
      }
    }
  }, []);

  const handleOpenPasswordModal = () => {
    setPasswordModalOpen(true);
    // Reset fields when opening modal
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordSuccess('');
    setPasswordStrength(0);
  };

  const handleClosePasswordModal = () => {
    setPasswordModalOpen(false);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setNewPassword(password);
    setPasswordStrength(checkPasswordStrength(password));
  };

  const handleSubmitPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    // Validate password length
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    // Validate password complexity
    if (passwordStrength < 50) {
      setPasswordError('Password is too weak. Include uppercase, lowercase, numbers and symbols.');
      return;
    }

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match");
      return;
    }

    // Check for spaces
    if (newPassword.includes(' ')) {
      setPasswordError('Password cannot contain spaces');
      return;
    }

    // Check if new password is the same as current password
    if (newPassword === currentPassword) {
      setPasswordError('New password cannot be the same as your current password');
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const response = await axios.put(
        `${config.apiUrl}/api/users/change-password`, 
        {
          currentPassword,
          newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get('token')}`
          }
        }
      );

      console.log(response.data);
      

      setPasswordSuccess('Password changed successfully!');
      
      // Clear form fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Open logout dialog
      setTimeout(() => {
        setLogoutDialogOpen(true);
      }, 1500);
      
    } catch (error: any) {
      setPasswordError(
        error.response?.data?.message || 
        'Failed to change password. Please try again.'
      );
    }
  };

  const handleLogout = () => {
    // Clear cookies
    Cookies.remove('token');
    Cookies.remove('user');
    
    // Close both dialogs
    setLogoutDialogOpen(false);
    setPasswordModalOpen(false);
    
    // Redirect to login
    navigate('/login');
  };

  const handleStayLoggedIn = () => {
    setLogoutDialogOpen(false);
    setPasswordModalOpen(false);
  };

  const handleOpenEmailModal = () => {
    setEmailModalOpen(true);
    // Reset fields when opening modal
    setNewEmail('');
    setEmailError('');
    setEmailSuccess('');
  };

  const handleCloseEmailModal = () => {
    setEmailModalOpen(false);
  };

  const handleSubmitEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setEmailSuccess('');

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    // Check if new email is the same as current email
    if (newEmail === userData.email) {
      setEmailError('New email cannot be the same as your current email');
      return;
    }

    try {
      const response = await axios.put(
        `${config.apiUrl}/api/users/change-email`, 
        {
          newEmail
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get('token')}`
          }
        }
      );

      console.log(response.data);
      
      setEmailSuccess('Email changed successfully!');
      
      // Update user data in state and cookie
      const updatedUserData = {...userData, email: newEmail};
      setUserData(updatedUserData);
      Cookies.set('user', JSON.stringify(updatedUserData));
      
      // Clear form field
      setNewEmail('');
      
      // Close modal after success
      setTimeout(() => {
        setEmailModalOpen(false);
      }, 2000);
      
    } catch (error: any) {
      setEmailError(
        error.response?.data?.message || 
        'Failed to change email. Please try again.'
      );
    }
  };

  return (
    <motion.div 
      className="p-4 md:p-8 min-h-screen w-full bg-secondary"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Typography 
        variant="h4" 
        component="h1" 
        className="text-center md:text-left font-bold text-primary mb-6 p-4"
      >
        My Account
      </Typography>

      {userData ? (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="shadow-lg">
                <CardContent className="flex flex-col items-center p-6">
                  <Avatar 
                    src={userData.profilePic || undefined} 
                    className="w-24 h-24 mb-4 bg-blue-600"
                  >
                    {!userData.profilePic && (
                      <PersonIcon className="text-4xl" />
                    )}
                  </Avatar>
                  <Typography variant="h5" className="font-bold text-center">
                    {userData.name}
                  </Typography>
                  <Chip 
                    icon={<VerifiedIcon />} 
                    label={userData.role || 'User'} 
                    color="primary" 
                    className="mt-2" 
                  />
                  
                  {/* Account Management Buttons */}
                  <div className='w-full mt-10 justify-center flex flex-col gap-3'>
                    <button 
                      onClick={handleOpenEmailModal}
                      className="btn flex flex-row justify-center items-center bg-blue-500 p-3 rounded-3xl shadow-2xl hover:bg-blue-600 hover:scale-105 text-white gap-2 cursor-pointer"
                    >
                      <EmailIcon /> Update Email
                    </button>
                    <button 
                      onClick={handleOpenPasswordModal}
                      className="btn flex flex-row justify-center items-center bg-orange-500 p-3 rounded-3xl shadow-2xl hover:bg-orange-600 hover:scale-105 text-white gap-2 cursor-pointer"
                    >
                      <LockIcon /> Change Password
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={8}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <Typography variant="h6" className="font-bold mb-4">
                    Account Details
                  </Typography>

                  <div className="space-y-4">
                    {userData.email && (
                      <div className="flex items-center">
                        <EmailIcon className="text-blue-600 mr-3" />
                        <div>
                          <Typography variant="body2" color="textSecondary">
                            Email
                          </Typography>
                          <Typography variant="body1">
                            {userData.email}
                          </Typography>
                        </div>
                      </div>
                    )}
                    
                    {userData.phone && (
                      <div className="flex items-center">
                        <PhoneIcon className="text-blue-600 mr-3" />
                        <div>
                          <Typography variant="body2" color="textSecondary">
                            Phone
                          </Typography>
                          <Typography variant="body1">
                            {userData.phone}
                          </Typography>
                        </div>
                      </div>
                    )}
                    
                    {userData.studentId && (
                      <div className="flex items-center">
                        <BadgeIcon className="text-blue-600 mr-3" />
                        <div>
                          <Typography variant="body2" color="textSecondary">
                            Student ID
                          </Typography>
                          <Typography variant="body1">
                            {userData.studentId}
                          </Typography>
                        </div>
                      </div>
                    )}
                    
                    {userData.department && (
                      <div className="flex items-center">
                        <SchoolIcon className="text-blue-600 mr-3" />
                        <div>
                          <Typography variant="body2" color="textSecondary">
                            Department
                          </Typography>
                          <Typography variant="body1">
                            {userData.department}
                          </Typography>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Divider className="my-4" />
                  
                  <div className="mt-4">
                    <Typography variant="h6" className="font-bold mb-3">
                      Profile Information
                    </Typography>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <div className="flex items-center">
                          <PersonIcon className="text-blue-600 mr-3" />
                          <div>
                            <Typography variant="body2" color="textSecondary">
                              <span className="font-semibold">Full Name</span>
                            </Typography>
                            <Typography variant="body1" color="textSecondary">
                              <span>{userData.name}</span>
                            </Typography>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <BadgeIcon className="text-blue-600 mr-3" />
                          <div>
                          <Typography variant="body2" color="textSecondary">
                              <span className="font-semibold">User ID</span>
                            </Typography>
                            <Typography variant="body1" color="textSecondary">
                              <span>{userData.id}</span>
                            </Typography>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <AccessTimeIcon className="text-blue-600 mr-3" />
                          <div>
                          <Typography variant="body2" color="textSecondary">
                              <span className="font-semibold">Account Created</span>
                            </Typography>
                            <Typography variant="body1" color="textSecondary">
                              <span>{new Date(userData.createdAt).toLocaleString()}</span>
                            </Typography>
                      
                          </div>
                        </div>
                      </Box>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center p-8"
        >
          <Card className="w-full max-w-md shadow-lg">
            <CardContent className="p-6 text-center">
              <PersonIcon className="text-6xl text-gray-300 mb-4" />
              <Typography variant="h6" color="textSecondary">
                No user data found in cookies
              </Typography>
              <Typography variant="body2" className="mt-2">
                Please sign in to view your account information
              </Typography>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Password Change Modal */}
      <Modal
        open={passwordModalOpen}
        onClose={handleClosePasswordModal}
        aria-labelledby="password-change-modal"
       

      >
        <div className="bg-white dark:bg-gray-800 w-full max-w-md p-6 m-auto rounded-md shadow-lg absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            <span className=' font-semibold text-orange-600'>Change Password</span>
          </Typography>
          
          {passwordError && (
            <Alert severity="error" sx={{ mb: 2 }}>{passwordError}</Alert>
          )}
          
          {passwordSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>{passwordSuccess}</Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmitPasswordChange} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="currentPassword"
              label="Current Password"
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      edge="end"
                    >
                      {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="newPassword"
              label="New Password"
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={handlePasswordChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                    >
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            {newPassword && (
              <Box sx={{ mt: 1, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption">
                    Password Strength: {getPasswordStrengthLabel(passwordStrength)}
                  </Typography>
                  <Typography variant="caption">{passwordStrength}%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={passwordStrength} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    bgcolor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: getPasswordStrengthColor(passwordStrength)
                    }
                  }}
                />
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Password must have at least 8 characters with a mix of uppercase, lowercase, numbers, and symbols.
                  </Typography>
                </Box>
              </Box>
            )}
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              error={confirmPassword !== '' && newPassword !== confirmPassword}
              helperText={confirmPassword !== '' && newPassword !== confirmPassword ? "Passwords don't match" : ""}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button 
                onClick={handleClosePasswordModal} 
                variant="outlined"
              >
                Cancel
              </Button>
                <button 
                type="submit" 
                className="btn bg-orange-500 p-3 rounded-3xl shadow-lg hover:bg-orange-600 hover:scale-105 cursor-pointer text-white"
                disabled={!currentPassword || !newPassword || !confirmPassword || passwordSuccess !== ''}
                >
                Change Password
                </button>
            </Box>
          </Box>
        </div>
      </Modal>

      {/* Email Change Modal */}
      <Modal
        open={emailModalOpen}
        onClose={handleCloseEmailModal}
        aria-labelledby="email-change-modal"
      >
        <div className="bg-white dark:bg-gray-800 w-full max-w-md p-6 m-auto rounded-md shadow-lg absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            <span className='font-semibold text-blue-600'>Update Email Address</span>
          </Typography>
          
          {emailError && (
            <Alert severity="error" sx={{ mb: 2 }}>{emailError}</Alert>
          )}
          
          {emailSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>{emailSuccess}</Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmitEmailChange} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              fullWidth
              disabled
              label="Current Email"
              value={userData?.email || ''}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon className='dark:text-white' />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="newEmail"
              label="New Email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon className='dark:text-white' />
                  </InputAdornment>
                ),
              }}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button 
                onClick={handleCloseEmailModal} 
                variant="outlined"
              >
                Cancel
              </Button>
              <button 
                type="submit" 
                className="btn bg-blue-500 p-3 rounded-3xl shadow-lg hover:bg-blue-600 hover:scale-105 cursor-pointer text-white"
                disabled={!newEmail || emailSuccess !== ''}
              >
                Update Email
              </button>
            </Box>
          </Box>
        </div>
      </Modal>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={handleStayLoggedIn}
        aria-labelledby="logout-dialog-title"
      >
        <DialogTitle id="logout-dialog-title">
          <span className='font-semibold text-green-600'>Logout Confirmation</span>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <span className='text-black dark:text-white'>Would you like to stay logged in or log out now?</span>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleStayLoggedIn} color="primary">
            Stay Logged In
          </Button>
            <button 
            onClick={handleLogout} 
            className="btn bg-red-500 p-3 rounded-3xl shadow-lg hover:bg-red-600 hover:scale-105 cursor-pointer text-white"
            >
            Log Out
            </button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
}

export default ManageMe