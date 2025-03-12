import React from 'react';
import { List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import { Link } from 'react-router-dom';
import navigationConfig from '../../config/navigationConfig';

const AdminSidebar: React.FC = () => {
  const adminNavItems = navigationConfig.admin;

  return (
    <List>
      {adminNavItems.map((item) => (
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

export default AdminSidebar;
