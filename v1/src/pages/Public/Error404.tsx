import { Container, Typography, Button } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Error404 = () => {
  return (
    <Container className='flex items-center justify-center  top-16 left-0 right-0 bottom-0'>
      <div className='w-full flex text-center items-center justify-center'> 
        <Container 
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center justify-center min-h-screen text-center"
        >
          <Typography variant="h1" component="h1" className="text-6xl font-bold mb-4">
            404
          </Typography>
          <Typography variant="h6" component="p" className="mb-4">
            Oops! The page you're looking for doesn't exist.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<HomeIcon />} 
            component={Link} 
            to="/"
          >
            Go to Home
          </Button>
        </Container>
      </div>
    </Container>
  );
};

export default Error404;
