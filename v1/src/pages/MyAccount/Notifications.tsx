import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import config from '../../config';
import { motion } from 'framer-motion';
import {
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Chip,
  Button,
  IconButton,
  CircularProgress,
  Badge,
  Alert,
  Tooltip,
  Snackbar,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  MarkEmailRead as MarkEmailReadIcon,
  NotificationsActive as NotificationsActiveIcon,
  Refresh as RefreshIcon,
  Circle as CircleIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// Initialize dayjs plugins
dayjs.extend(relativeTime);

// Define Notification interface
interface Notification {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  message: string;
  read: boolean;
  createdAt: string;
  __v: number;
}

// Define the unread count response
interface UnreadCountResponse {
  unreadCount: number;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  
  // State for marking notifications as read
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null);
  const [markAllAsReadLoading, setMarkAllAsReadLoading] = useState<boolean>(false);
  
  // Feedback states
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');

  // Fetch notifications
  const fetchNotifications = async (showRefreshAnimation = false) => {
    if (showRefreshAnimation) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    
    try {
      const response = await axios.get(`${config.apiUrl}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      });
      
      setNotifications(response.data);
      
      // Update last refresh time
      setLastRefreshTime(new Date());
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err.response?.data?.message || 'Failed to fetch notifications.');
    } finally {
      if (showRefreshAnimation) {
        setTimeout(() => setRefreshing(false), 500); // Show refresh animation for at least 500ms
      } else {
        setLoading(false);
      }
    }
  };
  
  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get<UnreadCountResponse>(`${config.apiUrl}/api/notifications/unread-count`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      });
      
      setUnreadCount(response.data.unreadCount);
    } catch (err: any) {
      console.error('Error fetching unread count:', err);
    }
  };
  
  // Mark a notification as read
  const markAsRead = async (notificationId: string) => {
    setMarkingAsRead(notificationId);
    
    try {
      await axios.put(`${config.apiUrl}/api/notifications/${notificationId}/read`, {}, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      });
      
      // Update notifications list by marking this one as read
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
      
      // Decrement unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Show success message
      setSnackbarMessage('Notification marked as read');
      setSnackbarOpen(true);
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
      // Show error message
      setSnackbarMessage('Failed to mark notification as read');
      setSnackbarOpen(true);
    } finally {
      setMarkingAsRead(null);
    }
  };
  
  // Mark all notifications as read
  const markAllAsRead = async () => {
    setMarkAllAsReadLoading(true);
    
    try {
      await axios.put(`${config.apiUrl}/api/notifications/read-all`, {}, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      });
      
      // Update all notifications as read
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      // Set unread count to 0
      setUnreadCount(0);
      
      // Show success message
      setSnackbarMessage('All notifications marked as read');
      setSnackbarOpen(true);
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err);
      // Show error message
      setSnackbarMessage('Failed to mark all notifications as read');
      setSnackbarOpen(true);
    } finally {
      setMarkAllAsReadLoading(false);
    }
  };
  
  // Handle refresh button click
  const handleRefresh = () => {
    fetchNotifications(true);
    fetchUnreadCount();
  };
  
  // Format refresh time using dayjs instead of date-fns
  const formatRefreshTime = (date: Date) => {
    return dayjs(date).format('hh:mm:ss A');
  };
  
  // Format relative time for notifications using dayjs
  const formatNotificationTime = (dateString: string) => {
    return dayjs(dateString).fromNow();
  };
  
  // Handle closing the snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Initial data fetch
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
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
        Notifications
      </Typography>
      
      {error && <Alert severity="error" className="mb-4">{error}</Alert>}
      
      <Paper className="shadow-lg">
        <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <Badge badgeContent={unreadCount} color="error" max={99}>
              <NotificationsIcon fontSize="large" color="primary" />
            </Badge>
            <Box>
              <Typography variant="h6" component="div" className="font-semibold">
                Your Notifications
                {unreadCount > 0 && (
                  <Chip 
                    label={`${unreadCount} unread`} 
                    color="error" 
                    size="small" 
                    sx={{ ml: 1 }}
                  />
                )}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                <span className="dark:text-gray-400 text-gray-700">Last updated: {formatRefreshTime(lastRefreshTime)}</span>
              </Typography>
            </Box>
          </Box>
          <Box display="flex" gap={2}>
            <Tooltip title="Refresh notifications">
              <span>
                <IconButton
                  color="primary"
                  onClick={handleRefresh}
                  disabled={refreshing || loading}
                  className={refreshing ? 'animate-spin' : ''}
                >
                  <RefreshIcon />
                </IconButton>
              </span>
            </Tooltip>
            {unreadCount > 0 && (
              <Button
                variant="outlined"
                color="primary"
                startIcon={markAllAsReadLoading ? <CircularProgress size={24} /> : <MarkEmailReadIcon />}
                onClick={markAllAsRead}
                disabled={markAllAsReadLoading || loading || refreshing}
              >
                Mark All as Read
              </Button>
            )}
          </Box>
        </Box>
        
        {(loading || refreshing) ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={8}>
            <CircularProgress />
          </Box>
        ) : notifications.length > 0 ? (
          <List>
            {notifications.map((notification, index) => {
              const isBeingRead = markingAsRead === notification._id;
              
              return (
                <React.Fragment key={notification._id}>
                  <ListItem 
                    alignItems="flex-start"
                    sx={{ 
                      bgcolor: notification.read ? 'transparent' : 'rgba(25, 118, 210, 0.08)',
                      transition: 'background-color 0.3s'
                    }}
                    secondaryAction={
                      !notification.read && (
                        <Tooltip title="Mark as read">
                          <IconButton 
                            edge="end" 
                            disabled={isBeingRead}
                            onClick={() => markAsRead(notification._id)}
                          >
                            {isBeingRead ? (
                              <CircularProgress size={20} />
                            ) : (
                              <MarkEmailReadIcon color="primary" />
                            )}
                          </IconButton>
                        </Tooltip>
                      )
                    }
                  >
                    <ListItemAvatar>
                      <Avatar 
                        sx={{ 
                          bgcolor: notification.read ? 'grey.400' : 'primary.main',
                        }}
                      >
                        {notification.read ? (
                          <NotificationsIcon />
                        ) : (
                          <NotificationsActiveIcon />
                        )}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                          <Typography 
                            component="span" 
                            variant="body1"
                            sx={{ fontWeight: notification.read ? 'normal' : 'bold' }}
                          >
                            {notification.message}
                          </Typography>
                          {!notification.read && (
                            <CircleIcon sx={{ color: 'primary.main', fontSize: 12 }} />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                            sx={{ display: 'block', fontSize: '0.8rem' }}
                          >
                            {formatNotificationTime(notification.createdAt)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < notifications.length - 1 && <Divider component="li" />}
                </React.Fragment>
              );
            })}
          </List>
        ) : (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={8}>
            <NotificationsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              No notifications
            </Typography>
            <Typography variant="body2" color="textSecondary">
              You don't have any notifications at the moment.
            </Typography>
          </Box>
        )}
      </Paper>
      
      {/* Success/Error notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </motion.div>
  );
};

export default Notifications;