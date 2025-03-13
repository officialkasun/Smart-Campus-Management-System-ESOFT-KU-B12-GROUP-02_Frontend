import React from 'react';
// Admin Icons
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import SettingsIcon from '@mui/icons-material/Settings';
import DashboardIcon from '@mui/icons-material/Dashboard';

// Student Icons
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventNoteIcon from '@mui/icons-material/EventNote';
import NotificationsIcon from '@mui/icons-material/Notifications';

// Lecturer Icons
import GradeIcon from '@mui/icons-material/Grade';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';

// Guest Icons
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import ContactMailIcon from '@mui/icons-material/ContactMail';

export interface NavItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  action: string;
}

export interface RoleNavConfig {
  [role: string]: NavItem[];
}

const navigationConfig: RoleNavConfig = {
  admin: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'View system overview',
      icon: <DashboardIcon fontSize="large" className="text-amber-600 dark:text-amber-400" />,
      path: '/admin/dashboard',
      action: 'View'
    },
    {
      id: 'users',
      title: 'User Management',
      description: 'Manage all users in the system',
      icon: <PeopleIcon fontSize="large" className="text-blue-600 dark:text-blue-400" />,
      path: '/admin/users',
      action: 'Manage Users'
    },
    {
      id: 'courses',
      title: 'Course Management',
      description: 'Create and manage courses',
      icon: <SchoolIcon fontSize="large" className="text-green-600 dark:text-green-400" />,
      path: '/admin/courses',
      action: 'Manage Courses'
    },
    {
      id: 'settings',
      title: 'System Settings',
      description: 'Configure system parameters',
      icon: <SettingsIcon fontSize="large" className="text-purple-600 dark:text-purple-400" />,
      path: '/admin/settings',
      action: 'Settings'
    }
  ],
  
  student: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'Your student overview',
      icon: <DashboardIcon fontSize="large" className="text-amber-600 dark:text-amber-400" />,
      path: '/student/dashboard',
      action: 'View'
    },
    {
      id: 'courses',
      title: 'My Courses',
      description: 'Access your enrolled courses',
      icon: <MenuBookIcon fontSize="large" className="text-blue-600 dark:text-blue-400" />,
      path: '/student/courses',
      action: 'View Courses'
    },
    {
      id: 'assignments',
      title: 'Assignments',
      description: 'View and submit your assignments',
      icon: <AssignmentIcon fontSize="large" className="text-orange-600 dark:text-orange-400" />,
      path: '/student/assignments',
      action: 'View Assignments'
    },
    {
      id: 'schedule',
      title: 'Schedule',
      description: 'Check your class schedule',
      icon: <EventNoteIcon fontSize="large" className="text-green-600 dark:text-green-400" />,
      path: '/student/schedule',
      action: 'View Schedule'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'View important announcements',
      icon: <NotificationsIcon fontSize="large" className="text-red-600 dark:text-red-400" />,
      path: '/student/notifications',
      action: 'View Notifications'
    }
  ],
  
  lecturer: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'Your lecturer overview',
      icon: <DashboardIcon fontSize="large" className="text-amber-600 dark:text-amber-400" />,
      path: '/lecturer/dashboard',
      action: 'View'
    },
    {
      id: 'courses',
      title: 'My Courses',
      description: 'Manage your teaching courses',
      icon: <LocalLibraryIcon fontSize="large" className="text-blue-600 dark:text-blue-400" />,
      path: '/lecturer/courses',
      action: 'Manage Courses'
    },
    {
      id: 'assignments',
      title: 'Assignments',
      description: 'Create and manage assignments',
      icon: <AssignmentIcon fontSize="large" className="text-orange-600 dark:text-orange-400" />,
      path: '/lecturer/assignments',
      action: 'Manage Assignments'
    },
    {
      id: 'grading',
      title: 'Grading',
      description: 'Grade student submissions',
      icon: <GradeIcon fontSize="large" className="text-green-600 dark:text-green-400" />,
      path: '/lecturer/grading',
      action: 'Grade'
    },
    {
      id: 'students',
      title: 'Students',
      description: 'View and manage your students',
      icon: <PeopleAltIcon fontSize="large" className="text-purple-600 dark:text-purple-400" />,
      path: '/lecturer/students',
      action: 'View Students'
    },
    {
      id: 'esoft',
      title: 'Esoft',
      description: 'View and manage your Esoft students',
      icon: <PeopleAltIcon fontSize="large" className="text-purple-600 dark:text-purple-400" />,
      path: '/lecturer/students/esoft',
      action: 'View Esoft Students'
    }
  ],
  
  guest: [
    {
      id: 'home',
      title: 'Home',
      description: 'Return to homepage',
      icon: <HomeIcon fontSize="large" className="text-blue-600 dark:text-blue-400" />,
      path: '/',
      action: 'Visit'
    },
    {
      id: 'about',
      title: 'About',
      description: 'Learn more about us',
      icon: <InfoIcon fontSize="large" className="text-green-600 dark:text-green-400" />,
      path: '/about',
      action: 'Read More'
    },
    {
      id: 'contact',
      title: 'Contact',
      description: 'Get in touch with us',
      icon: <ContactMailIcon fontSize="large" className="text-purple-600 dark:text-purple-400" />,
      path: '/contact',
      action: 'Contact'
    }
  ]
};

export default navigationConfig;
