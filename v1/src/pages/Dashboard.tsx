import React, { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography, CardActions, Box, Paper } from '@mui/material';
import Cookies from 'js-cookie';
import navigationConfig, { NavItem } from '../config/navigationConfig';
import { Link } from "react-router";

interface DashboardProps {
  role?: string;
}

const Dashboard: React.FC<DashboardProps> = () => {
  const [userRole, setUserRole] = useState<string>('');
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const userCookie = Cookies.get('user');
    if (userCookie) {
      try {
        const userData = JSON.parse(userCookie);
        setUserRole(userData.role || 'user');
        setUserName(userData.name || 'User');
      } catch (error) {
        console.error('Error parsing user cookie', error);
      }
    }
  }, []);

  const navItems: NavItem[] = userRole ? navigationConfig[userRole] || [] : [];

  if (!userRole) {
    return (
      <Box className="w-full p-4 text-center">
        <Typography variant="h5">Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box className="w-full p-4">
      <Paper elevation={0} className="p-4 mb-6 bg-base-200 dark:bg-gray-800">
        <Typography variant="h4" className="text-gray-500 dark:text-gray-200 mb-2">
          Welcome, {userName}!
        </Typography>
        <Typography variant="body1" className="text-gray-800 dark:text-gray-300">
          This is your {userRole} dashboard. Here you can access all the features available to you.
        </Typography>
      </Paper>
      
      <Grid container spacing={4}>
        {navItems.map((item) => (
          <Grid item xs={12} sm={6} md={6} lg={3} key={item.id}>
            <Card 
              className="h-full transition-all duration-200 hover:shadow-lg bg-gray-200 dark:bg-gray-700 border border-base-300 dark:border-gray-600 hover:scale-105 ease-in-out transform"
             
              sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                bgcolor: 'background.paper',
                color: 'text.primary',
                
              }}
            >
              <Box className="flex justify-center pt-6">
                {item.icon}
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="div" className="text-center text-gray-800 dark:text-gray-100">
                {item.title}
                </Typography>
                <Typography variant="body2"  className="text-center text-gray-700 dark:text-gray-300">
                  {item.description}
                </Typography>
              </CardContent>
              <CardActions className="justify-center pb-4">
                <Link to={item.path} className="btn bg-blue-500 rounded-2xl w-[250px] flex justify-center hover:bg-blue-800 dark:hover:bg-blue-600 p-2"> <span className='text-white'>{item.action}</span></Link>
              
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;