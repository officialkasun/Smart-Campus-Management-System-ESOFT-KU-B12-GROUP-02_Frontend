import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Drawer, List, ListItem, ListItemText, Avatar } from '@mui/material';
import { Link } from 'react-router-dom';  // Corrected import
import MenuIcon from '@mui/icons-material/Menu';
import { Box } from '@mui/system';

const Navbar: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (event.type === 'keydown' && ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
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
          <Button color="inherit" component={Link} to="/login">Login</Button>
          <Button color="inherit" component={Link} to="/register">Register</Button>
          <Avatar alt="User Avatar" src="/static/images/avatar/1.jpg" />
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
