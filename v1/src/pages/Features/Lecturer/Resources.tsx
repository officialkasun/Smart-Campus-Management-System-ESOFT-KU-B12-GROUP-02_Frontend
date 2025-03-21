import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import config from '../../../config';
import { motion } from 'framer-motion';
// Add date picker imports
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Box,
  CircularProgress,
  Tooltip,
  TableSortLabel,
  Modal,
  Card,
  CardContent,
  Divider,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Tabs,
  Tab,
  Badge,
  Alert,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  Check as CheckIcon,
  Room as RoomIcon,
  EventAvailable as EventAvailableIcon,
  Event as EventIcon,
  EventBusy as EventBusyIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

// Update the Resource interface to reflect reservedBy can be an object or string
interface Resource {
  _id: string;
  name: string;
  type: string;
  availability: boolean;
  reservationDate: string | null;
  reservationExpiry: string | null;
  reservedBy: { _id: string; name: string; email: string } | string | null;
  createdAt: string;
  __v: number;
}

// Define sorting order type
type Order = 'asc' | 'desc';

// Define sortable fields
type SortField = 'name' | 'type' | 'createdAt' | null;

const Resources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [resourceLimit, setResourceLimit] = useState<number>(10);

  // State for sorting
  const [sortOrder, setSortOrder] = useState<Order>('asc');
  const [sortField, setSortField] = useState<SortField>('name');

  // State for viewing resource details
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState<boolean>(false);

  // State for tracking last refresh time
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // State for search functionality
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState<boolean>(false);
  
  // Always show only available resources
  const [showOnlyAvailable] = useState<boolean>(true);

  // State for reservation modal
  const [reserveModalOpen, setReserveModalOpen] = useState<boolean>(false);
  const [resourceToReserve, setResourceToReserve] = useState<Resource | null>(null);
  const [reservationDate, setReservationDate] = useState<dayjs.Dayjs | null>(dayjs());
  const [reservationTime, setReservationTime] = useState<dayjs.Dayjs | null>(dayjs().add(1, 'hour'));
  const [reservationLoading, setReservationLoading] = useState<boolean>(false);
  const [reservationError, setReservationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // State for user's reserved resources
  const [reservedResources, setReservedResources] = useState<Resource[]>([]);
  const [loadingReserved, setLoadingReserved] = useState<boolean>(true);
  const [reservedError, setReservedError] = useState<string | null>(null);
  
  // State for current active tab
  const [activeTab, setActiveTab] = useState<number>(0);
  
  // State for cancel reservation modal
  const [cancelReservationModalOpen, setCancelReservationModalOpen] = useState<boolean>(false);
  const [resourceToUnreserve, setResourceToUnreserve] = useState<Resource | null>(null);
  const [cancelReservationLoading, setCancelReservationLoading] = useState<boolean>(false);
  const [cancelReservationError, setCancelReservationError] = useState<string | null>(null);

  // Fetch resources function - modified to always fetch available resources
  const fetchResources = async (showRefreshAnimation = false) => {
    if (showRefreshAnimation) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const response = await axios.get(`${config.apiUrl}/api/resources/${resourceLimit}/available`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      });
      
      setResources(response.data);
      setError(null);
      
      // Update last refresh time
      setLastRefreshTime(new Date());
      
      // Reset search state if this is a manual refresh
      if (showRefreshAnimation && searchPerformed) {
        setSearchPerformed(false);
        setSearchQuery('');
        setSearchError(null);
      }
    } catch (err: any) {
      console.error('Error fetching resources:', err);
      setError(err.response?.data?.message || 'Failed to fetch resources.');
    } finally {
      if (showRefreshAnimation) {
        setTimeout(() => setRefreshing(false), 500); // Show refresh animation for at least 500ms
      } else {
        setLoading(false);
      }
    }
  };

  // Fetch reserved resources
  const fetchReservedResources = async (showRefreshAnimation = false) => {
    setLoadingReserved(true);
    
    try {
      const response = await axios.get(`${config.apiUrl}/api/resources/reserved`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      });
      
      setReservedResources(response.data);
      setReservedError(null);
    } catch (err: any) {
      console.error('Error fetching reserved resources:', err);
      setReservedError(err.response?.data?.message || 'Failed to fetch your reserved resources.');
    } finally {
      setLoadingReserved(false);
    }
  };

  useEffect(() => {
    fetchResources();
    fetchReservedResources();
  }, [resourceLimit]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Sort handlers
  const handleRequestSort = (field: SortField) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  // Function to compare values for sorting
  const compareValues = (a: any, b: any, orderBy: SortField) => {
    if (!orderBy) return 0;

    let valueA = a[orderBy];
    let valueB = b[orderBy];

    if (valueB < valueA) {
      return sortOrder === 'asc' ? 1 : -1;
    }
    if (valueB > valueA) {
      return sortOrder === 'asc' ? -1 : 1;
    }
    return 0;
  };

  // Sort the resources based on current sort field and direction
  const sortedResources = React.useMemo(() => {
    if (!sortField) return resources;

    return [...resources].sort((a, b) => {
      return -compareValues(a, b, sortField);
    });
  }, [resources, sortField, sortOrder]);

  // Function to handle viewing a resource
  const handleViewResource = (resource: Resource) => {
    setSelectedResource(resource);
    setViewModalOpen(true);
  };

  // Handle refresh button click - updated to refresh both available and reserved resources
  const handleRefresh = () => {
    fetchResources(true);
    fetchReservedResources();
  };

  // Format the refresh time in a readable format
  const formatRefreshTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    });
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Clear search error when input changes
    if (searchError) {
      setSearchError(null);
    }

    // If search is cleared, reset to show all resources
    if (e.target.value === '') {
      handleClearSearch();
    }
  };

  // Clear search and show all resources again
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchError(null);
    setSearchPerformed(false);
    fetchResources();
  };

  // Filter resources based on search query (client-side filtering for visual feedback before API call)
  const filteredResources = React.useMemo(() => {
    if (!searchQuery) return sortedResources;

    const query = searchQuery.toLowerCase();
    return sortedResources.filter(resource => 
      resource.name.toLowerCase().includes(query) ||
      resource.type.toLowerCase().includes(query)
    );
  }, [sortedResources, searchQuery]);

  // Handle search submission - use the API for search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchPerformed(true);
    setSearchLoading(true);
    
    if (!searchQuery.trim()) {
      setSearchError("Please enter a search term");
      setSearchLoading(false);
      return;
    }
    
    try {
      // Use the correct API endpoint for searching resources
      const response = await axios.get(`${config.apiUrl}/api/resources/name/${searchQuery}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      });
      
      // Filter response to only include available resources since the endpoint might return all resources
      const availableResources = response.data.filter((resource: Resource) => resource.availability === true);
      
      setResources(availableResources);
      setSearchError(null);
      
      if (availableResources.length === 0) {
        setSearchError('No available resources match your search criteria.');
      }
    } catch (err: any) {
      console.error('Error searching resources:', err);
      setSearchError(err.response?.data?.message || 'Failed to search resources.');
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle change of the resource limit
  const handleResourceLimitChange = (event: SelectChangeEvent<number>) => {
    setResourceLimit(event.target.value as number);
  };

  // Get appropriate icon for resource type
  const getResourceTypeIcon = (type: string | null | undefined) => {
    if (!type) return <CategoryIcon />; // Return default icon if type is null or undefined
    
    switch (type.toLowerCase()) {
      case 'classroom':
        return <RoomIcon />;
      case 'lab':
        return <InventoryIcon />;
      case 'equipment':
        return <CategoryIcon />;
      default:
        return <CategoryIcon />;
    }
  };

  // Capitalize first letter of string
  const capitalizeFirstLetter = (string: string | null | undefined) => {
    if (!string) return ''; // Return empty string if input is null or undefined
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  // Function to handle reserve button click
  const handleReserveClick = (resource: Resource) => {
    if (!resource.availability) {
      setReservationError("This resource is already reserved.");
      return;
    }
    
    setResourceToReserve(resource);
    setReservationDate(dayjs()); // Default to today
    setReservationTime(dayjs().add(1, 'hour')); // Default to 1 hour from now
    setReserveModalOpen(true);
    setReservationError(null);
  };
  
  // Function to handle reservation submission
  const handleReserveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resourceToReserve || !reservationDate || !reservationTime) {
      setReservationError("Please select a valid date and time for reservation.");
      return;
    }
    
    // Create a combined datetime for validation purposes
    const combinedDateTime = reservationDate.hour(reservationTime.hour()).minute(reservationTime.minute());
    
    // Ensure the reservation time is in the future
    if (combinedDateTime.isBefore(dayjs())) {
      setReservationError("Reservation time must be in the future.");
      return;
    }
    
    setReservationLoading(true);
    setReservationError(null);
    
    try {
      const response = await axios.post(
        `${config.apiUrl}/api/resources/${resourceToReserve._id}/reserve`, 
        {
          reservationDate: reservationDate.format('YYYY-MM-DD'),
          reservationTime: reservationTime.format('HH:mm')
        }, 
        {
          headers: {
            Authorization: `Bearer ${Cookies.get('token')}`,
          },
        }
      );
      
      // Update the resource in the local state
      setResources(resources.map(resource => 
        resource._id === resourceToReserve._id ? response.data : resource
      ));
      
      // If the selected resource in view modal is the one being reserved, update it
      if (selectedResource && selectedResource._id === resourceToReserve._id) {
        setSelectedResource(response.data);
      }
      
      // Show success message
      setSuccessMessage('Resource reserved successfully!');
      
      // Close reservation modal after a short delay
      setTimeout(() => {
        setReserveModalOpen(false);
        setResourceToReserve(null);
        setSuccessMessage(null);
        
        // Refresh the resources to remove the newly reserved one from the list
        fetchResources(true);
      }, 1500);
    } catch (err: any) {
      console.error('Error reserving resource:', err);
      setReservationError(err.response?.data?.message || 'Failed to reserve resource.');
    } finally {
      setReservationLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Function to handle cancel reservation button click
  const handleCancelReservationClick = (resource: Resource) => {
    setResourceToUnreserve(resource);
    setCancelReservationModalOpen(true);
    setCancelReservationError(null);
  };
  
  // Function to execute reservation cancellation
  const handleCancelReservation = async () => {
    if (!resourceToUnreserve) return;
    
    setCancelReservationLoading(true);
    setCancelReservationError(null);
    
    try {
      const response = await axios.delete(
        `${config.apiUrl}/api/resources/${resourceToUnreserve._id}/del`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get('token')}`,
          },
        }
      );
      
      // Remove the cancelled reservation from the reserved resources list
      setReservedResources(prevResources => 
        prevResources.filter(r => r._id !== resourceToUnreserve._id)
      );
      
      // Show success message
      setSuccessMessage('Reservation cancelled successfully!');
      
      // Close modals after a short delay
      setTimeout(() => {
        setCancelReservationModalOpen(false);
        setResourceToUnreserve(null);
        setSuccessMessage(null);
        
        // Refresh data
        fetchResources(true);
        fetchReservedResources();
      }, 1500);
    } catch (err: any) {
      console.error('Error cancelling reservation:', err);
      setCancelReservationError(err.response?.data?.message || 'Failed to cancel reservation.');
    } finally {
      setCancelReservationLoading(false);
    }
  };

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
        Resource Management
      </Typography>

      {error && !searchError && <Typography color="error" className="mb-4">{error}</Typography>}

      {/* Tabs for Available and Reserved Resources */}
      <Paper className="shadow-lg mb-4">
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab 
            label="Available Resources" 
            icon={<EventAvailableIcon />} 
            iconPosition="start"
          />
          <Tab 
            label={
              <Badge 
                badgeContent={reservedResources.length} 
                color="primary"
                max={99}
                showZero
              >
                My Reservations
              </Badge>
            } 
            icon={<EventBusyIcon />} 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Available Resources Tab Panel */}
      {activeTab === 0 && (
        <>
          {/* Search Bar */}
          <Paper className="shadow-lg mb-4">
            <Box p={2}>
              <form onSubmit={handleSearch}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search resources by name or type..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: searchQuery && (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="clear search"
                          onClick={handleClearSearch}
                          edge="end"
                        >
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                {searchError && (
                  <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                    {searchError}
                  </Typography>
                )}
                {searchPerformed && !searchError && filteredResources.length > 0 && (
                  <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                    {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''} found
                  </Typography>
                )}
                <Box mt={1} display="flex" justifyContent="flex-end">
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary"
                    disabled={searchLoading}
                    startIcon={searchLoading ? <CircularProgress size={20} /> : <SearchIcon />}
                  >
                    Search
                  </Button>
                </Box>
              </form>
            </Box>
          </Paper>

          <Paper className="shadow-lg">
            <Box p={2} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <Box>
                <Typography variant="h6" component="div" className="font-semibold">
                  {searchPerformed ? 'Search Results' : 'Available Resources'}
                </Typography>
                {!searchPerformed && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    <span className='dark:text-gray-400 text-gray-700'>Last updated: {formatRefreshTime(lastRefreshTime)}</span>
                  </Typography>
                )}
              </Box>
              
              <Box display="flex" alignItems="center" gap={2}>
                <FormControl sx={{ minWidth: 120 }} size="small">
                  <InputLabel id="resource-limit-label">Limit</InputLabel>
                  <Select
                    labelId="resource-limit-label"
                    id="resource-limit"
                    value={resourceLimit}
                    label="Limit"
                    onChange={handleResourceLimitChange}
                  >
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                    <MenuItem value={100}>100</MenuItem>
                  </Select>
                </FormControl>
                
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

            {(loading || searchLoading || refreshing) ? (
              <Box p={4} display="flex" justifyContent="center">
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead className="bg-gray-100">
                    <TableRow>
                      <TableCell className="font-medium">
                        <TableSortLabel
                          active={sortField === 'name'}
                          direction={sortField === 'name' ? sortOrder : 'asc'}
                          onClick={() => handleRequestSort('name')}
                        >
                          Resource Name
                        </TableSortLabel>
                      </TableCell>
                      <TableCell className="font-medium">
                        <TableSortLabel
                          active={sortField === 'type'}
                          direction={sortField === 'type' ? sortOrder : 'asc'}
                          onClick={() => handleRequestSort('type')}
                        >
                          Type
                        </TableSortLabel>
                      </TableCell>
                      <TableCell className="font-medium">
                        <TableSortLabel
                          active={sortField === 'createdAt'}
                          direction={sortField === 'createdAt' ? sortOrder : 'asc'}
                          onClick={() => handleRequestSort('createdAt')}
                        >
                          Added Date
                        </TableSortLabel>
                      </TableCell>
                      <TableCell className="font-medium">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredResources
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((resource) => (
                        <TableRow 
                          key={resource._id} 
                          hover
                          sx={{
                            backgroundColor: 'rgba(76, 175, 80, 0.1)',
                            '&:hover': {
                              backgroundColor: 'rgba(76, 175, 80, 0.2)',
                            }
                          }}
                        >
                          <TableCell><span className='dark:text-white text-black font-medium'>{resource.name}</span></TableCell>
                          <TableCell>
                            <Chip
                              label={capitalizeFirstLetter(resource.type)}
                              size="small"
                              color="primary"
                              icon={getResourceTypeIcon(resource.type)}
                            />
                          </TableCell>
                          <TableCell>
                            <span className='dark:text-white text-black'>
                              {formatDate(resource.createdAt).split(',')[0]}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Box display="flex">
                              <Tooltip key={`view-${resource._id}`} title="View Details">
                                <IconButton 
                                  size="small" 
                                  color="primary"
                                  onClick={() => handleViewResource(resource)}
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip key={`reserve-${resource._id}`} title="Reserve Resource">
                                <IconButton 
                                  size="small" 
                                  color="success"
                                  onClick={() => handleReserveClick(resource)}
                                >
                                  <EventIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    {filteredResources.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center" className="py-8">
                          <Typography variant="body1" color="textSecondary">
                            No available resources found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredResources.length}
              rowsPerPage={rowsPerPage}
              page={filteredResources.length <= page * rowsPerPage && filteredResources.length > 0 ? 0 : page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </>
      )}

      {/* My Reservations Tab Panel */}
      {activeTab === 1 && (
        <Paper className="shadow-lg">
          <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" component="div" className="font-semibold">
              My Reserved Resources
            </Typography>
            <Tooltip title="Refresh reserved resources">
              <span>
                <IconButton
                  color="primary"
                  onClick={() => fetchReservedResources(true)}
                  disabled={loadingReserved}
                >
                  <RefreshIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Box>

          {reservedError && (
            <Box p={2}>
              <Alert severity="error">{reservedError}</Alert>
            </Box>
          )}

          {loadingReserved ? (
            <Box p={4} display="flex" justifyContent="center">
              <CircularProgress />
            </Box>
          ) : (
            <>
              {reservedResources.length === 0 ? (
                <Box p={4} textAlign="center">
                  <Typography variant="body1" color="textSecondary">
                    You don't have any reserved resources
                  </Typography>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    startIcon={<EventAvailableIcon />}
                    onClick={() => setActiveTab(0)}
                    sx={{ mt: 2 }}
                  >
                    Browse Available Resources
                  </Button>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead className="bg-gray-100">
                      <TableRow>
                        <TableCell className="font-medium">Resource Name</TableCell>
                        <TableCell className="font-medium">Type</TableCell>
                        <TableCell className="font-medium">Reserved Since</TableCell>
                        <TableCell className="font-medium">Expires</TableCell>
                        <TableCell className="font-medium">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reservedResources.map((resource) => (
                        <TableRow 
                          key={resource._id} 
                          hover
                          sx={{
                            backgroundColor: 'rgba(255, 152, 0, 0.1)',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 152, 0, 0.2)',
                            }
                          }}
                        >
                          <TableCell><span className='dark:text-white text-black font-medium'>{resource.name}</span></TableCell>
                          <TableCell>
                            <Chip
                              label={capitalizeFirstLetter(resource.type)}
                              size="small"
                              color="primary"
                              icon={getResourceTypeIcon(resource.type)}
                            />
                          </TableCell>
                          <TableCell>
                            {formatDate(resource.reservationDate)}
                          </TableCell>
                          <TableCell>
                            {resource.reservationExpiry ? 
                              formatDate(resource.reservationExpiry) : 
                              <span className="text-gray-500">Not specified</span>
                            }
                          </TableCell>
                          <TableCell>
                            <Box display="flex">
                              <Tooltip title="Cancel Reservation">
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={() => handleCancelReservationClick(resource)}
                                >
                                  <CloseIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </Paper>
      )}

      {/* Resource Details Modal */}
      <Modal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        aria-labelledby="resource-details-modal"
      >
        <div className="bg-white dark:bg-gray-800 w-full max-w-lg p-6 m-auto rounded-md shadow-lg absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-h-[90vh] overflow-y-auto">
          {selectedResource && (
            <Card className="shadow-none">
              <CardContent className="p-6">
                <Box display="flex" alignItems="center" mb={3}>
                  <Box sx={{ 
                    width: 56, 
                    height: 56, 
                    mr: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    borderRadius: '50%',
                    bgcolor: 'success.main'
                  }}>
                    {selectedResource.type === 'classroom' ? (
                      <RoomIcon sx={{ color: 'white', fontSize: 30 }} />
                    ) : (
                      <InventoryIcon sx={{ color: 'white', fontSize: 30 }} />
                    )}
                  </Box>
                  <Box>
                    <Typography variant="h6" className="font-bold">
                      {selectedResource.name}
                    </Typography>
                    <Chip 
                      label='Available'
                      color='success'
                      size="small"
                    />
                  </Box>
                </Box>

                <Divider className="my-3" />

                <div className="space-y-4">
                  <div className="flex items-center">
                    <CategoryIcon className="text-blue-600 mr-3" />
                    <div>
                      <Typography variant="body2" color="primary">
                        Resource Type
                      </Typography>
                      <Typography variant="body1">
                        {capitalizeFirstLetter(selectedResource.type)}
                      </Typography>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div>
                      <Typography variant="body2" color="primary">
                        Added On
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(selectedResource.createdAt)}
                      </Typography>
                    </div>
                  </div>
                </div>

                <Box mt={4} display="flex" justifyContent="space-between">
                  <Button 
                    key="reserve-button"
                    onClick={() => {
                      setViewModalOpen(false);
                      handleReserveClick(selectedResource);
                    }}
                    variant="contained" 
                    color="success"
                    startIcon={<EventIcon />}
                  >
                    Reserve
                  </Button>
                  <Button 
                    key="close-button"
                    onClick={() => setViewModalOpen(false)} 
                    variant="outlined"
                  >
                    Close
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </div>
      </Modal>

      {/* Reservation Modal */}
      <Modal
        open={reserveModalOpen}
        onClose={() => {
          if (!reservationLoading) {
            setReserveModalOpen(false);
            setReservationError(null);
            setSuccessMessage(null);
          }
        }}
        aria-labelledby="reserve-resource-modal"
      >
        <div className="bg-white dark:bg-gray-800 w-full max-w-md p-6 m-auto rounded-md shadow-lg absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Typography variant="h6" className="font-bold mb-4">
            Reserve Resource
          </Typography>
          
          {successMessage && (
            <Box sx={{ mb: 2, p: 1, bgcolor: 'success.light', borderRadius: 1 }}>
              <Typography color="success.contrastText">{successMessage}</Typography>
            </Box>
          )}
          
          {reservationError && (
            <Box sx={{ mb: 2, p: 1, bgcolor: 'error.light', borderRadius: 1 }}>
              <Typography color="error.contrastText">{reservationError}</Typography>
            </Box>
          )}
          
          {!successMessage && resourceToReserve && (
            <>
              <Typography variant="body1" className="mb-4">
                You are about to reserve <strong>{resourceToReserve.name}</strong>.
                Please select when you would like to reserve this resource.
              </Typography>
              
              <form onSubmit={handleReserveResource}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Box mb={3}>
                    <DatePicker
                      label="Reservation Date"
                      value={reservationDate}
                      onChange={(newValue) => setReservationDate(newValue)}
                      disablePast
                      sx={{ width: '100%', mb: 2 }}
                    />
                    <TimePicker
                      label="Reservation Time"
                      value={reservationTime}
                      onChange={(newValue) => setReservationTime(newValue)}
                      sx={{ width: '100%' }}
                    />
                  </Box>
                </LocalizationProvider>
                
                <Box display="flex" gap={2} justifyContent="flex-end">
                  <Button 
                    key="reserve-cancel-button"
                    variant="outlined" 
                    color="primary"
                    onClick={() => setReserveModalOpen(false)}
                    disabled={reservationLoading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    key="reserve-confirm-button"
                    type="submit"
                    variant="contained" 
                    color="success"
                    disabled={reservationLoading || !reservationDate || !reservationTime}
                    startIcon={reservationLoading ? <CircularProgress size={20} color="inherit" /> : <EventIcon />}
                  >
                    {reservationLoading ? "Reserving..." : "Confirm Reservation"}
                  </Button>
                </Box>
              </form>
            </>
          )}
        </div>
      </Modal>

      {/* Cancel Reservation Modal */}
      <Modal
        open={cancelReservationModalOpen}
        onClose={() => {
          if (!cancelReservationLoading) {
            setCancelReservationModalOpen(false);
            setCancelReservationError(null);
            setSuccessMessage(null);
          }
        }}
        aria-labelledby="cancel-reservation-modal"
      >
        <div className="bg-white dark:bg-gray-800 w-full max-w-md p-6 m-auto rounded-md shadow-lg absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Typography variant="h6" className="font-bold mb-4">
            Cancel Reservation
          </Typography>
          
          {successMessage && (
            <Box sx={{ mb: 2, p: 1, bgcolor: 'success.light', borderRadius: 1 }}>
              <Typography color="success.contrastText">{successMessage}</Typography>
            </Box>
          )}
          
          {cancelReservationError && (
            <Box sx={{ mb: 2, p: 1, bgcolor: 'error.light', borderRadius: 1 }}>
              <Typography color="error.contrastText">{cancelReservationError}</Typography>
            </Box>
          )}
          
          {!successMessage && resourceToUnreserve && (
            <>
              <Typography variant="body1" className="mb-4">
                Are you sure you want to cancel your reservation for <strong>{resourceToUnreserve.name}</strong>?
                This will make the resource available to others.
              </Typography>
              
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button 
                  key="cancel-reservation-no-button"
                  variant="outlined" 
                  color="primary"
                  onClick={() => setCancelReservationModalOpen(false)}
                  disabled={cancelReservationLoading}
                >
                  No, Keep Reservation
                </Button>
                <Button 
                  key="cancel-reservation-yes-button"
                  variant="contained" 
                  color="error"
                  onClick={handleCancelReservation}
                  disabled={cancelReservationLoading}
                  startIcon={cancelReservationLoading ? <CircularProgress size={20} color="inherit" /> : <CloseIcon />}
                >
                  {cancelReservationLoading ? "Cancelling..." : "Yes, Cancel Reservation"}
                </Button>
              </Box>
            </>
          )}
        </div>
      </Modal>
    </motion.div>
  );
};

export default Resources;git