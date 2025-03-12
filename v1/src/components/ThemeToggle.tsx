import { IconButton, Tooltip } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4'; // Dark mode icon
import Brightness7Icon from '@mui/icons-material/Brightness7'; // Light mode icon

// Define the props interface
export interface ThemeToggleProps {
  currentTheme: string;
  toggleTheme: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ currentTheme, toggleTheme }) => {
  return (
    <Tooltip title={currentTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
      <IconButton 
        onClick={toggleTheme} 
        color="inherit"
        className="theme-toggle-button text-primary-content"
      >
        {currentTheme === 'light' ? 
          <Brightness4Icon className="text-primary-content" /> : 
          <Brightness7Icon className="text-yellow-300" />
        }
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
