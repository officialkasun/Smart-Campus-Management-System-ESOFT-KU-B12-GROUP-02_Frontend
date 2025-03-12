import React, { useState, useEffect, MouseEvent } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Drawer, Avatar, Menu, MenuItem, ListItemIcon } from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import { Box } from '@mui/system';
import Cookies from 'js-cookie';
import ThemeToggle from './ThemeToggle';
import { AdminSidebar, StudentSidebar, LecturerSidebar, GuestSidebar } from './Sidebars';

const Navbar: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [theme, setTheme] = useState<string>(() => {
    // Get initial theme from HTML data-theme attribute or localStorage
    return document.documentElement.getAttribute('data-theme') || 
           localStorage.getItem('theme') || 
           'light';
  });
  const navigate = useNavigate();
  const location = useLocation();

  // Function to toggle theme (was missing)
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Apply theme on component mount and when theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

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
      <AppBar position="fixed" className="bg-primary">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer(true)}>
            <MenuIcon className="text-primary-content" />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center' }}>
            <Link to="/" className=" font-semibold">
              <span className='text-white dark:text-amber-300'>SCMC <small>v1.0</small></span>
            </Link>
          </Typography>
          
          <ThemeToggle currentTheme={theme} toggleTheme={toggleTheme} />
          
          {isLoggedIn ? (
            <>
              <div className="flex items-center">
                <Avatar 
                  alt={userName} 
                  src="/static/images/avatar/1.jpg" 
                  onClick={handleAvatarClick}
                  className="cursor-pointer hover:opacity-80 transition-opacity ml-2"
                />
              </div>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  elevation: 3,
                  className: "mt-2 bg-base-100"
                }}
              >
                <MenuItem component={Link} to="/account" onClick={handleMenuClose} className="hover:bg-base-200">
                  <ListItemIcon className='text-red-500'>
                    <span className='text-blue-600'><AccountCircleIcon fontSize="small" className="text-c" /></span>
                  </ListItemIcon>
                  <span className="text-blue-600">My Account</span>
                </MenuItem>
                <MenuItem component={Link} to={`/${userRole}/dashboard`} onClick={handleMenuClose} className="hover:bg-base-200">
                  <ListItemIcon>
                  <span className='text-orange-600'><DashboardIcon fontSize="small" className="text-base-content" /> </span>
                  </ListItemIcon>
                  <span className=" text-orange-600">Dashboard</span>
                </MenuItem>
                <MenuItem onClick={handleLogout} className="hover:bg-base-200">
                  <ListItemIcon>
                  <span className='text-red-600'><LogoutIcon fontSize="small" className="text-base-content" /></span>
                  </ListItemIcon>
                  <span className="text-red-600 font-semibold">Logout</span>
                </MenuItem>
              </Menu>
            </>
          ) : (
            <div className="flex items-center space-x-2 ml-2">
              <Button 
                color="inherit" 
                component={Link} 
                to="/login"
                className="text-white hover:bg-primary-focus transition-colors"
              >
                <span className='text-white'>Login</span>
              </Button>
              
            </div>
          )}
        </Toolbar>
      </AppBar>
      <Drawer 
        anchor="left" 
        open={drawerOpen} 
        onClose={toggleDrawer(false)} 
        PaperProps={{ className: "bg-base-100" }}
      >
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
          className="text-base-content"
        >
          {!isLoggedIn ? (
            <GuestSidebar />
          ) : userRole === 'admin' ? (
            <AdminSidebar />
          ) : userRole === 'student' ? (
            <StudentSidebar />
          ) : userRole === 'lecturer' ? (
            <LecturerSidebar />
          ) : (
            <GuestSidebar />
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
