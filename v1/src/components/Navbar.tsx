import React, { useState, useEffect, MouseEvent } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Drawer, List, ListItem, ListItemText, Avatar, Menu, MenuItem, ListItemIcon } from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import { Box } from '@mui/system';
import Cookies from 'js-cookie';

const Navbar: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Function to check user auth status
  const checkUserAuth = () => {
    const userCookie = Cookies.get('user');
    const token = Cookies.get('token');
    
    if (userCookie && token) {
      try {
        const userData = JSON.parse(userCookie);
        setIsLoggedIn(true);
        setUserRole(userData.role || 'user');
        setUserName(userData.name || 'User');
      } catch (error) {
        console.error('Error parsing user cookie', error);
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
      setUserRole('');
      setUserName('');
    }
  };

  // Check auth status on mount and when location changes
  useEffect(() => {
    checkUserAuth();
  }, [location]);

  // Also poll for auth changes every second
  useEffect(() => {
    const interval = setInterval(() => {
      checkUserAuth();
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (event.type === 'keydown' && ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleAvatarClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // Clear cookies using js-cookie for consistency
    Cookies.remove('user');
    Cookies.remove('token');
    
    // Update state
    setIsLoggedIn(false);
    setUserRole('');
    setUserName('');
    
    // Close menu
    handleMenuClose();
    
    // Redirect to home page
    navigate('/');
  };

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer(true)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center' }}>
            <Link to="/" className="text-blue-500">
              <span className='text-white font-semibold'>SCMC <small>v1.0</small></span>
            </Link>
          </Typography>
          
          {isLoggedIn ? (
            <>
              <div className="flex items-center">
                <Avatar 
                  alt={userName} 
                  src="/static/images/avatar/1.jpg" 
                  onClick={handleAvatarClick}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                />
              </div>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  elevation: 3,
                  className: "mt-2"
                }}
              >
                <MenuItem component={Link} to="/account" onClick={handleMenuClose}>
                  <ListItemIcon>
                    <AccountCircleIcon fontSize="small" className="text-gray-700" />
                  </ListItemIcon>
                  <span className="text-gray-800">My Account</span>
                </MenuItem>
                <MenuItem component={Link} to={`/${userRole}/dashboard`} onClick={handleMenuClose}>
                  <ListItemIcon>
                    <DashboardIcon fontSize="small" className="text-gray-700" />
                  </ListItemIcon>
                  <span className="text-gray-800">Dashboard</span>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" className="text-gray-700" />
                  </ListItemIcon>
                  <span className="text-gray-800">Logout</span>
                </MenuItem>
              </Menu>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Button 
                color="inherit" 
                component={Link} 
                to="/login"
                className="hover:bg-blue-700 transition-colors"
              >
                Login
              </Button>
              <Button 
                color="inherit" 
                component={Link} 
                to="/register"
                className="hover:bg-blue-700 transition-colors"
              >
                Register
              </Button>
            </div>
          )}
        </Toolbar>
      </AppBar>
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <List>
            <ListItem  component={Link} to="#">
              <ListItemText primary="Link 1" />
            </ListItem>
            <ListItem  component={Link} to="#">
              <ListItemText primary="Link 2" />
            </ListItem>
            <ListItem  component={Link} to="#">
              <ListItemText primary="Link 3" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
