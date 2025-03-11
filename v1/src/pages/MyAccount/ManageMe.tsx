import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie';
import axios from 'axios';
import config from '../../config';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  Typography, 
  Avatar, 
  Divider, 
  Chip,
  Grid,
  Box,
} from '@mui/material';
import { 
  Person as PersonIcon,
  Email as EmailIcon, 
  Phone as PhoneIcon,
  School as SchoolIcon,
  Badge as BadgeIcon,
  Verified as VerifiedIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';

// Course type definition based on the API response
interface Instructor {
  _id: string;
  name: string;
  email: string;
}

interface Student {
  _id: string;
  name: string;
  email: string;
}

interface Schedule {
  day: string;
  startTime: string;
  endTime: string;
}

interface Course {
  _id: string;
  name: string;
  code: string;
  description: string;
  instructor: Instructor;
  students: Student[];
  schedule: Schedule;
  lectureMaterials: any[];
  createdAt: string;
  __v: number;
}

const ManageMe = () => {
  const [userData, setUserData] = useState<any>(null);


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
    </motion.div>
  );
}

export default ManageMe