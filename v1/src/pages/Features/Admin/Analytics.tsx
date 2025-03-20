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
} from 'recharts';
import {
  Refresh as RefreshIcon,
  Inventory as InventoryIcon,
  EventBusy as EventBusyIcon,
  EventAvailable as EventAvailableIcon,
  Category as CategoryIcon,
  Analytics as AnalyticsIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

// Define the interface for the analytics data
interface ResourceAnalytics {
  totalResources: number;
  totalReservedResources: number;
  mostReservedResources: {
    _id: string;
    count: number;
  }[];
  resourceUtilization: string;
}

// Define color palettes for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
const PIE_COLORS = ['#4caf50', '#ff9800'];

const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<ResourceAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  
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

  // Fetch analytics data from API
  const fetchAnalytics = async (showRefreshAnimation = false) => {
    if (showRefreshAnimation) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const response = await axios.get(`${config.apiUrl}/api/resources/analytics`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      });
      
      setAnalytics(response.data);
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
  if (error && !analytics) {
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography
          variant="h4"
          component="h1"
          className="font-bold text-primary p-2"
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <AnalyticsIcon fontSize="large" />
          Resource Analytics Dashboard
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

      {analytics && (
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
                  {analytics.totalResources}
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
                  {analytics.totalReservedResources}
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
                  {analytics.totalResources - analytics.totalReservedResources}
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
                  {analytics.mostReservedResources.length}
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
                      value={calculatePercentage(analytics.resourceUtilization)}
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
                        {analytics.resourceUtilization}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Utilization Rate
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Box mt={2}>
                  <Typography variant="body2" color="text.secondary" align="center">
                    {analytics.totalReservedResources} of {analytics.totalResources} resources are currently in use
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
                        data={prepareAvailabilityData(analytics)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {prepareAvailabilityData(analytics).map((entry, index) => (
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
                      data={prepareResourceTypeData(analytics)}
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
    </motion.div>
  );
};

export default Analytics;