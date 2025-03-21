import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import config from '../../../config';
import { motion } from 'framer-motion';
import {
  Typography,
  Box,
  Grid,
  Paper,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  IconButton,
  Tooltip,
  useTheme,
  Tabs,
  Tab,
  Avatar,
  Chip,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import {
  Refresh as RefreshIcon,
  Inventory as InventoryIcon,
  EventBusy as EventBusyIcon,
  EventAvailable as EventAvailableIcon,
  Category as CategoryIcon,
  Analytics as AnalyticsIcon,
  Error as ErrorIcon,
  EventNote as EventIcon,
  Group as GroupIcon,
  CalendarToday as CalendarIcon,
  ShowChart as ShowChartIcon,
  Person as PersonIcon,
  PersonOutline as PersonOutlineIcon,
  SupervisedUserCircle as SupervisedUserCircleIcon,
} from '@mui/icons-material';

// Define the interface for the resource analytics data
interface ResourceAnalytics {
  totalResources: number;
  totalReservedResources: number;
  mostReservedResources: {
    _id: string;
    count: number;
  }[];
  resourceUtilization: string;
}

// Define the interface for the event analytics data
interface EventAnalytics {
  totalEvents: number;
  totalAttendees: number;
  mostAttendedEvents: {
    _id: string;
    title: string;
    attendeesCount: number;
  }[];
  upcomingEvents?: number;
  pastEvents?: number;
}

// Define the interface for user analytics data
interface UserAnalytics {
  mostActiveUsers: {
    _id: string;
    name: string;
    email: string;
    attendedEventsCount: number;
  }[];
  totalUsersCount?: number;
  usersByRole?: {
    admin?: number;
    lecturer?: number;
    student?: number;
  };
}

// Define color palettes for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
const PIE_COLORS = ['#4caf50', '#ff9800'];
const EVENT_COLORS = ['#3f51b5', '#f44336', '#ff9800', '#2196f3', '#9c27b0'];
const USER_COLORS = ['#00bcd4', '#673ab7', '#e91e63', '#009688', '#ffc107'];

const Analytics: React.FC = () => {
  const [resourceAnalytics, setResourceAnalytics] = useState<ResourceAnalytics | null>(null);
  const [eventAnalytics, setEventAnalytics] = useState<EventAnalytics | null>(null);
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<number>(0);
  
  const theme = useTheme();

  // Format utilization percentage for display
  const formatUtilization = (utilization: string) => {
    if (!utilization) return '0%';
    return utilization.replace('%', '');
  };

  // Prepare data for the availability pie chart
  const prepareAvailabilityData = (analytics: ResourceAnalytics) => {
    if (!analytics) return [];
    
    const available = analytics.totalResources - analytics.totalReservedResources;
    
    return [
      { name: 'Available', value: available },
      { name: 'Reserved', value: analytics.totalReservedResources },
    ];
  };

  // Prepare data for the resource type bar chart
  const prepareResourceTypeData = (analytics: ResourceAnalytics) => {
    if (!analytics?.mostReservedResources) return [];
    
    return analytics.mostReservedResources.map(item => ({
      name: item._id.charAt(0).toUpperCase() + item._id.slice(1), // Capitalize first letter
      count: item.count
    }));
  };

  // Prepare data for the event attendance chart
  const prepareEventAttendanceData = (analytics: EventAnalytics) => {
    if (!analytics?.mostAttendedEvents) return [];
    
    return analytics.mostAttendedEvents.map(event => ({
      name: event.title,
      attendees: event.attendeesCount
    })).sort((a, b) => b.attendees - a.attendees);
  };

  // Prepare data for the event distribution pie chart
  const prepareEventDistributionData = (analytics: EventAnalytics) => {
    if (!analytics) return [];
    
    // If we have upcoming/past events data, use it
    if (analytics.upcomingEvents !== undefined && analytics.pastEvents !== undefined) {
      return [
        { name: 'Upcoming Events', value: analytics.upcomingEvents },
        { name: 'Past Events', value: analytics.pastEvents },
      ];
    }
    
    // Default placeholder data if we don't have the specific breakdown
    return [
      { name: 'Events', value: analytics.totalEvents },
    ];
  };

  // Prepare data for user activity chart
  const prepareUserActivityData = (analytics: UserAnalytics) => {
    if (!analytics?.mostActiveUsers) return [];
    
    return analytics.mostActiveUsers.map(user => ({
      name: user.name,
      events: user.attendedEventsCount
    }));
  };

  // Prepare data for users by role pie chart
  const prepareUserRoleData = (analytics: UserAnalytics) => {
    if (!analytics?.usersByRole) return [];
    
    const roles = analytics.usersByRole;
    const result = [];
    
    if (roles.admin !== undefined) {
      result.push({ name: 'Admin', value: roles.admin });
    }
    
    if (roles.lecturer !== undefined) {
      result.push({ name: 'Lecturer', value: roles.lecturer });
    }
    
    if (roles.student !== undefined) {
      result.push({ name: 'Student', value: roles.student });
    }
    
    return result.length > 0 ? result : [{ name: 'Users', value: analytics.totalUsersCount || 0 }];
  };

  // Fetch analytics data from API
  const fetchAnalytics = async (showRefreshAnimation = false) => {
    if (showRefreshAnimation) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      // Fetch resource analytics
      const resourceResponse = await axios.get(`${config.apiUrl}/api/resources/analytics`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      });
      
      setResourceAnalytics(resourceResponse.data);
      
      // Fetch event analytics
      const eventResponse = await axios.get(`${config.apiUrl}/api/events/analytics`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      });
      
      setEventAnalytics(eventResponse.data);

      // Fetch user analytics
      const userResponse = await axios.get(`${config.apiUrl}/api/users/analytics`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      });
      
      setUserAnalytics(userResponse.data);
      
      setError(null);
      setLastRefreshTime(new Date());
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err.response?.data?.message || 'Failed to fetch analytics data.');
    } finally {
      if (showRefreshAnimation) {
        setTimeout(() => setRefreshing(false), 500); // Show refresh animation for at least 500ms
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Handle refresh button click
  const handleRefresh = () => {
    fetchAnalytics(true);
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Format the refresh time
  const formatRefreshTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    });
  };

  // Calculate percentage for circular progress
  const calculatePercentage = (utilization: string): number => {
    return parseFloat(utilization.replace('%', ''));
  };

  // Custom label for pie chart
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${name}: ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Render loading state
  if (loading && !refreshing) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="80vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Render error state
  if (error && !resourceAnalytics && !eventAnalytics && !userAnalytics) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="80vh"
        p={3}
      >
        <ErrorIcon color="error" style={{ fontSize: 60, marginBottom: 16 }} />
        <Typography variant="h5" color="error" gutterBottom>
          Error Loading Analytics
        </Typography>
        <Typography variant="body1" color="textSecondary" align="center" paragraph>
          {error}
        </Typography>
        <Tooltip title="Try again">
          <IconButton 
            color="primary" 
            onClick={handleRefresh}
            size="large"
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  return (
    <motion.div
      className="p-4 md:p-8 min-h-screen w-full bg-secondary"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography
          variant="h4"
          component="h1"
          className="font-bold text-primary p-2"
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <AnalyticsIcon fontSize="large" />
          Campus Analytics Dashboard
        </Typography>
        
        <Box display="flex" alignItems="center">
          <Typography variant="caption" color="text.secondary" mr={1}>
            Last updated: {formatRefreshTime(lastRefreshTime)}
          </Typography>
          <Tooltip title="Refresh data">
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
        </Box>
      </Box>

      {/* Tabs for different analytics sections */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          aria-label="analytics tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab 
            icon={<InventoryIcon />} 
            label="Resource Analytics" 
            iconPosition="start"
          />
          <Tab 
            icon={<EventIcon />} 
            label="Event Analytics" 
            iconPosition="start"
          />
          <Tab 
            icon={<GroupIcon />} 
            label="User Analytics" 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Resource Analytics Tab */}
      {activeTab === 0 && resourceAnalytics && (
        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item xs={12} md={6} lg={3}>
            <Card className="shadow-md h-full">
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <InventoryIcon color="primary" sx={{ fontSize: 28, mr: 1 }} />
                  <Typography variant="h6" component="div" fontWeight={600}>
                    Total Resources
                  </Typography>
                </Box>
                <Typography variant="h3" component="div" fontWeight={700} textAlign="center" my={2}>
                  {resourceAnalytics.totalResources}
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Total resources in the system
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <Card className="shadow-md h-full">
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <EventBusyIcon color="error" sx={{ fontSize: 28, mr: 1 }} />
                  <Typography variant="h6" component="div" fontWeight={600}>
                    Reserved Resources
                  </Typography>
                </Box>
                <Typography variant="h3" component="div" fontWeight={700} textAlign="center" my={2}>
                  {resourceAnalytics.totalReservedResources}
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Currently reserved resources
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <Card className="shadow-md h-full">
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <EventAvailableIcon color="success" sx={{ fontSize: 28, mr: 1 }} />
                  <Typography variant="h6" component="div" fontWeight={600}>
                    Available Resources
                  </Typography>
                </Box>
                <Typography variant="h3" component="div" fontWeight={700} textAlign="center" my={2}>
                  {resourceAnalytics.totalResources - resourceAnalytics.totalReservedResources}
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Resources available for reservation
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <Card className="shadow-md h-full">
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <CategoryIcon color="secondary" sx={{ fontSize: 28, mr: 1 }} />
                  <Typography variant="h6" component="div" fontWeight={600}>
                    Resource Types
                  </Typography>
                </Box>
                <Typography variant="h3" component="div" fontWeight={700} textAlign="center" my={2}>
                  {resourceAnalytics.mostReservedResources.length}
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Different types of resources
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Utilization Progress */}
          <Grid item xs={12} md={6}>
            <Card className="shadow-md">
              <CardContent>
                <Typography variant="h6" component="div" fontWeight={600} mb={3}>
                  Resource Utilization
                </Typography>
                
                <Box display="flex" justifyContent="center" alignItems="center" position="relative" height={250}>
                  <Box position="relative" display="flex" justifyContent="center" alignItems="center">
                    <CircularProgress
                      variant="determinate"
                      value={100}
                      size={220}
                      thickness={4}
                      sx={{ color: theme.palette.grey[200] }}
                    />
                    <CircularProgress
                      variant="determinate"
                      value={calculatePercentage(resourceAnalytics.resourceUtilization)}
                      size={220}
                      thickness={4}
                      sx={{ 
                        color: theme.palette.primary.main,
                        position: 'absolute',
                        left: 0,
                      }}
                    />
                    <Box
                      position="absolute"
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Typography variant="h4" component="div" fontWeight={700} color="primary">
                        {resourceAnalytics.resourceUtilization}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Utilization Rate
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Box mt={2}>
                  <Typography variant="body2" color="text.secondary" align="center">
                    {resourceAnalytics.totalReservedResources} of {resourceAnalytics.totalResources} resources are currently in use
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Resource Availability Pie Chart */}
          <Grid item xs={12} md={6}>
            <Card className="shadow-md">
              <CardContent>
                <Typography variant="h6" component="div" fontWeight={600} mb={3}>
                  Resource Availability
                </Typography>
                
                <Box height={250}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={prepareAvailabilityData(resourceAnalytics)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {prepareAvailabilityData(resourceAnalytics).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend 
                        formatter={(value, entry, index) => {
                          return <span style={{ color: theme.palette.text.primary }}>{value}</span>;
                        }}
                      />
                      <RechartsTooltip formatter={(value) => [`${value} resources`, '']} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Resource Types Bar Chart */}
          <Grid item xs={12}>
            <Card className="shadow-md">
              <CardContent>
                <Typography variant="h6" component="div" fontWeight={600} mb={3}>
                  Resources by Type
                </Typography>
                
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={prepareResourceTypeData(resourceAnalytics)}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: theme.palette.text.primary }}
                      />
                      <YAxis 
                        tick={{ fill: theme.palette.text.primary }}
                        allowDecimals={false}
                      />
                      <RechartsTooltip 
                        formatter={(value) => [`${value} resources`, '']}
                        contentStyle={{ 
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`
                        }}
                      />
                      <Legend 
                        formatter={(value, entry, index) => {
                          return <span style={{ color: theme.palette.text.primary }}>Resource Count</span>;
                        }}
                      />
                      <Bar 
                        dataKey="count" 
                        name="Resource Count"
                        fill={theme.palette.primary.main}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
                <Typography variant="body2" color="text.secondary" align="center" mt={2}>
                  Distribution of resources by type
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Event Analytics Tab */}
      {activeTab === 1 && eventAnalytics && (
        <Grid container spacing={3}>
          {/* Event Summary Cards */}
          <Grid item xs={12} md={6} lg={4}>
            <Card className="shadow-md h-full">
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <EventIcon color="primary" sx={{ fontSize: 28, mr: 1 }} />
                  <Typography variant="h6" component="div" fontWeight={600}>
                    Total Events
                  </Typography>
                </Box>
                <Typography variant="h3" component="div" fontWeight={700} textAlign="center" my={2}>
                  {eventAnalytics.totalEvents}
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Total events in the system
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6} lg={4}>
            <Card className="shadow-md h-full">
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <GroupIcon color="secondary" sx={{ fontSize: 28, mr: 1 }} />
                  <Typography variant="h6" component="div" fontWeight={600}>
                    Total Attendees
                  </Typography>
                </Box>
                <Typography variant="h3" component="div" fontWeight={700} textAlign="center" my={2}>
                  {eventAnalytics.totalAttendees}
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Total attendees across all events
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6} lg={4}>
            <Card className="shadow-md h-full">
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <ShowChartIcon color="info" sx={{ fontSize: 28, mr: 1 }} />
                  <Typography variant="h6" component="div" fontWeight={600}>
                    Average Attendance
                  </Typography>
                </Box>
                <Typography variant="h3" component="div" fontWeight={700} textAlign="center" my={2}>
                  {eventAnalytics.totalEvents > 0 
                    ? Math.round((eventAnalytics.totalAttendees / eventAnalytics.totalEvents) * 10) / 10
                    : 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Average attendees per event
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Event Distribution Pie Chart */}
          <Grid item xs={12} md={6}>
            <Card className="shadow-md">
              <CardContent>
                <Typography variant="h6" component="div" fontWeight={600} mb={3}>
                  Event Distribution
                </Typography>
                
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={prepareEventDistributionData(eventAnalytics)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {prepareEventDistributionData(eventAnalytics).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={EVENT_COLORS[index % EVENT_COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend 
                        formatter={(value, entry, index) => {
                          return <span style={{ color: theme.palette.text.primary }}>{value}</span>;
                        }}
                      />
                      <RechartsTooltip formatter={(value) => [`${value} events`, '']} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                <Typography variant="body2" color="text.secondary" align="center" mt={2}>
                  Distribution of events by status
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Area Chart for Event Attendance */}
          <Grid item xs={12} md={6}>
            <Card className="shadow-md">
              <CardContent>
                <Typography variant="h6" component="div" fontWeight={600} mb={3}>
                  Attendees Distribution
                </Typography>
                
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={prepareEventAttendanceData(eventAnalytics)}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: theme.palette.text.primary }}
                      />
                      <YAxis 
                        tick={{ fill: theme.palette.text.primary }}
                        allowDecimals={false}
                      />
                      <RechartsTooltip 
                        formatter={(value) => [`${value} attendees`, '']}
                        contentStyle={{ 
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="attendees" 
                        stroke={theme.palette.secondary.main}
                        fill={theme.palette.secondary.main}
                        fillOpacity={0.3}
                        name="Attendees"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
                <Typography variant="body2" color="text.secondary" align="center" mt={2}>
                  Distribution of attendees across events
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Most Attended Events */}
          <Grid item xs={12}>
            <Card className="shadow-md">
              <CardContent>
                <Typography variant="h6" component="div" fontWeight={600} mb={3}>
                  Most Attended Events
                </Typography>
                
                <Box height={400}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={prepareEventAttendanceData(eventAnalytics)}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        type="number"
                        tick={{ fill: theme.palette.text.primary }}
                        allowDecimals={false}
                      />
                      <YAxis 
                        dataKey="name" 
                        type="category"
                        tick={{ fill: theme.palette.text.primary }}
                        width={150}
                      />
                      <RechartsTooltip 
                        formatter={(value) => [`${value} attendees`, '']}
                        contentStyle={{ 
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`
                        }}
                      />
                      <Legend 
                        formatter={(value, entry, index) => {
                          return <span style={{ color: theme.palette.text.primary }}>Attendee Count</span>;
                        }}
                      />
                      <Bar 
                        dataKey="attendees" 
                        name="Attendee Count"
                        fill={theme.palette.info.main}
                        radius={[0, 4, 4, 0]}
                      >
                        {prepareEventAttendanceData(eventAnalytics).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={EVENT_COLORS[index % EVENT_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
                <Typography variant="body2" color="text.secondary" align="center" mt={2}>
                  Ranking of events by attendee count
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {/* User Analytics Tab */}
      {activeTab === 2 && userAnalytics && (
        <Grid container spacing={3}>
          {/* User Summary Cards */}
          <Grid item xs={12} md={6} lg={4}>
            <Card className="shadow-md h-full">
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <GroupIcon color="primary" sx={{ fontSize: 28, mr: 1 }} />
                  <Typography variant="h6" component="div" fontWeight={600}>
                    Total Users
                  </Typography>
                </Box>
                <Typography variant="h3" component="div" fontWeight={700} textAlign="center" my={2}>
                  {userAnalytics.totalUsersCount || userAnalytics.mostActiveUsers.length}
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Total registered users
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6} lg={4}>
            <Card className="shadow-md h-full">
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <PersonIcon color="secondary" sx={{ fontSize: 28, mr: 1 }} />
                  <Typography variant="h6" component="div" fontWeight={600}>
                    Active Users
                  </Typography>
                </Box>
                <Typography variant="h3" component="div" fontWeight={700} textAlign="center" my={2}>
                  {userAnalytics.mostActiveUsers.filter(user => user.attendedEventsCount > 0).length}
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Users with event participation
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6} lg={4}>
            <Card className="shadow-md h-full">
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <PersonOutlineIcon color="info" sx={{ fontSize: 28, mr: 1 }} />
                  <Typography variant="h6" component="div" fontWeight={600}>
                    Most Active User
                  </Typography>
                </Box>
                <Box display="flex" flexDirection="column" alignItems="center" my={2}>
                  <Avatar sx={{ width: 60, height: 60, mb: 1, bgcolor: theme.palette.primary.main }}>
                    {userAnalytics.mostActiveUsers[0]?.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="h6" component="div" fontWeight={600} textAlign="center">
                    {userAnalytics.mostActiveUsers[0]?.name || 'N/A'}
                  </Typography>
                  <Chip 
                    label={`${userAnalytics.mostActiveUsers[0]?.attendedEventsCount || 0} Events`}
                    color="primary"
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* User Activity Bar Chart */}
          <Grid item xs={12}>
            <Card className="shadow-md">
              <CardContent>
                <Typography variant="h6" component="div" fontWeight={600} mb={3}>
                  User Activity by Event Participation
                </Typography>
                
                <Box height={400}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={prepareUserActivityData(userAnalytics)}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        type="number"
                        tick={{ fill: theme.palette.text.primary }}
                        allowDecimals={false}
                      />
                      <YAxis 
                        dataKey="name" 
                        type="category"
                        tick={{ fill: theme.palette.text.primary }}
                        width={150}
                      />
                      <RechartsTooltip 
                        formatter={(value) => [`${value} events attended`, '']}
                        contentStyle={{ 
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`
                        }}
                      />
                      <Legend 
                        formatter={(value, entry, index) => {
                          return <span style={{ color: theme.palette.text.primary }}>Events Attended</span>;
                        }}
                      />
                      <Bar 
                        dataKey="events" 
                        name="Events Attended"
                        radius={[0, 4, 4, 0]}
                      >
                        {prepareUserActivityData(userAnalytics).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={USER_COLORS[index % USER_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
                <Typography variant="body2" color="text.secondary" align="center" mt={2}>
                  Users ranked by event participation
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* User Roles Distribution (if data available) */}
          {userAnalytics.usersByRole && (
            <Grid item xs={12} md={6}>
              <Card className="shadow-md">
                <CardContent>
                  <Typography variant="h6" component="div" fontWeight={600} mb={3}>
                    User Distribution by Role
                  </Typography>
                  
                  <Box height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={prepareUserRoleData(userAnalytics)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {prepareUserRoleData(userAnalytics).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={USER_COLORS[index % USER_COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend 
                          formatter={(value, entry, index) => {
                            return <span style={{ color: theme.palette.text.primary }}>{value}</span>;
                          }}
                        />
                        <RechartsTooltip formatter={(value) => [`${value} users`, '']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                  <Typography variant="body2" color="text.secondary" align="center" mt={2}>
                    Distribution of users by role
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Top Users Card View */}
          <Grid item xs={12} md={userAnalytics.usersByRole ? 6 : 12}>
            <Card className="shadow-md">
              <CardContent>
                <Typography variant="h6" component="div" fontWeight={600} mb={3}>
                  Most Active Users
                </Typography>
                
                <Box display="flex" flexDirection="column" gap={2}>
                  {userAnalytics.mostActiveUsers.slice(0, 5).map((user, index) => (
                    <Paper 
                      key={user._id} 
                      elevation={1} 
                      sx={{ 
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        borderLeft: `4px solid ${USER_COLORS[index % USER_COLORS.length]}`
                      }}
                    >
                      <Avatar 
                        sx={{ 
                          bgcolor: USER_COLORS[index % USER_COLORS.length],
                          width: 40, 
                          height: 40,
                          mr: 2
                        }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box flexGrow={1}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle1" fontWeight={500}>
                            {user.name}
                          </Typography>
                          <Chip 
                            label={`${user.attendedEventsCount} events`}
                            size="small"
                            color={index === 0 ? "primary" : "default"}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                    </Paper>
                  ))}

                  {userAnalytics.mostActiveUsers.length === 0 && (
                    <Box textAlign="center" py={4}>
                      <Typography color="text.secondary">No user activity data available</Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

        </Grid>
      )}
    </motion.div>
  );
};

export default Analytics;