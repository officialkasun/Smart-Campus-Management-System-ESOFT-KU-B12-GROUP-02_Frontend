import React from 'react';
import { List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import { Link } from 'react-router-dom';
import navigationConfig from '../../config/navigationConfig';

const StudentSidebar: React.FC = () => {
  const studentNavItems = navigationConfig.student;
  
  return (
    <List>
      {studentNavItems.map((item) => (
        <ListItem 
          key={item.id} 
          component={Link} 
          to={item.path} 
          className="hover:bg-base-200"
        >
          <ListItemIcon>
            {React.cloneElement(item.icon as React.ReactElement, { 
              
            })}
          </ListItemIcon>
          <ListItemText primary={item.title} />
        </ListItem>
      ))}
    </List>
  );
};

export default StudentSidebar;
