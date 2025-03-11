import { IconButton, Tooltip } from '@mui/material';
import { useTheme } from '../context/ThemeContext';
import Brightness4Icon from '@mui/icons-material/Brightness4'; // Dark mode icon
import Brightness7Icon from '@mui/icons-material/Brightness7'; // Light mode icon

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <Tooltip title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
      <IconButton 
        onClick={toggleTheme} 
        color="inherit"
        className="theme-toggle-button text-primary-content"
      >
        {theme === 'light' ? 
          <Brightness4Icon className="text-primary-content" /> : 
          <Brightness7Icon className="text-yellow-300" />
        }
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
