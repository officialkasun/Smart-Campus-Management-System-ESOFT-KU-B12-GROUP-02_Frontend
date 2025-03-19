import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import config from '../../../config';
import { motion } from 'framer-motion';
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
  Avatar,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  FormHelperText,
  Alert,
  LinearProgress,
  SelectChangeEvent,
} from '@mui/material';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import {
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  CalendarToday as CalendarIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

// Define Event interface
interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  organizer: {
    _id: string;
    name: string;
    email: string;
  };
  attendees: string[];
  attendeesCount: number;
  createdAt: string;
}

// New interface for creating an event
interface NewEvent {
  title: string;
  description: string;
  date: string;
  location: string;
  organizer: string;
}

// New interface for editing an event
interface EditEvent {
  title: string;
  description: string;
  date: string;
  location: string;
  organizer: string;
}

// Define sorting order type
type Order = 'asc' | 'desc';

// Define sortable fields
type SortField = 'title' | 'date' | 'location' | 'organizer' | 'attendeesCount' | 'createdAt' | null;

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // State for sorting
  const [sortOrder, setSortOrder] = useState<Order>('asc');
  const [sortField, setSortField] = useState<SortField>('date');

  // State for viewing event details
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState<boolean>(false);

  // State for tracking last refresh time
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // State for search functionality
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState<boolean>(false);

  // State for creating events
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [newEvent, setNewEvent] = useState<NewEvent>({
    title: '',
    description: '',
    date: new Date().toISOString(),
    location: '',
    organizer: '',
  });
  const [validationErrors, setValidationErrors] = useState<{
    title?: string;
    description?: string;
    date?: string;
    location?: string;
    organizer?: string;
  }>({});
  const [createLoading, setCreateLoading] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<boolean>(false);

  // State for organizers (users)
  const [organizers, setOrganizers] = useState<{_id: string, name: string, email: string}[]>([]);
  const [loadingOrganizers, setLoadingOrganizers] = useState<boolean>(false);

  // State for delete confirmation
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<boolean>(false);

  // State for editing events
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
  const [editEvent, setEditEvent] = useState<EditEvent>({
    title: '',
    description: '',
    date: '',
    location: '',
    organizer: '',
  });
  const [editValidationErrors, setEditValidationErrors] = useState<{
    title?: string;
    description?: string;
    date?: string;
    location?: string;
    organizer?: string;
  }>({});
  const [editLoading, setEditLoading] = useState<boolean>(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<boolean>(false);

  // Fetch events function
  const fetchEvents = async (showRefreshAnimation = false) => {
    if (showRefreshAnimation) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const response = await axios.get(`${config.apiUrl}/api/events`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      });
      setEvents(response.data);
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
      console.error('Error fetching events:', err);
      setError(err.response?.data?.message || 'Failed to fetch events.');
    } finally {
      if (showRefreshAnimation) {
        setTimeout(() => setRefreshing(false), 500); // Show refresh animation for at least 500ms
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

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

    let valueA: any;
    let valueB: any;

    // Special handling for nested fields
    if (orderBy === 'organizer') {
      valueA = a.organizer.name;
      valueB = b.organizer.name;
    } else {
      valueA = a[orderBy];
      valueB = b[orderBy];
    }

    if (valueB < valueA) {
      return sortOrder === 'asc' ? 1 : -1;
    }
    if (valueB > valueA) {
      return sortOrder === 'asc' ? -1 : 1;
    }
    return 0;
  };

  // Sort the events based on current sort field and direction
  const sortedEvents = React.useMemo(() => {
    if (!sortField) return events;

    return [...events].sort((a, b) => {
      return -compareValues(a, b, sortField);
    });
  }, [events, sortField, sortOrder]);

  // Function to handle viewing an event
  const handleViewEvent = (event: Event) => {
    setSelectedEvent(event);
    setViewModalOpen(true);
  };

  // Handle refresh button click
  const handleRefresh = () => {
    fetchEvents(true);
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
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Check if an event is upcoming or past
  const isUpcomingEvent = (dateString: string) => {
    const eventDate = new Date(dateString);
    const now = new Date();
    return eventDate > now;
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Clear search error when input changes
    if (searchError) {
      setSearchError(null);
    }

    // If search is cleared, reset to show all events
    if (e.target.value === '') {
      handleClearSearch();
    }
  };

  // Clear search and show all events again
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchError(null);
    setSearchPerformed(false);
    fetchEvents();
  };

  // Filter events based on search query
  const filteredEvents = React.useMemo(() => {
    if (!searchQuery) return sortedEvents;

    const query = searchQuery.toLowerCase();
    return sortedEvents.filter(event => 
      event.title.toLowerCase().includes(query) ||
      event.description.toLowerCase().includes(query) ||
      event.location.toLowerCase().includes(query) ||
      event.organizer.name.toLowerCase().includes(query)
    );
  }, [sortedEvents, searchQuery]);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchPerformed(true);
    
    if (filteredEvents.length === 0) {
      setSearchError('No events match your search criteria.');
    } else {
      setSearchError(null);
    }
  };

  // Fetch organizers (users)
  const fetchOrganizers = async () => {
    setLoadingOrganizers(true);
    try {
      const response = await axios.get(`${config.apiUrl}/api/users`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      });
      // Store only relevant organizer data
      const organizerData = response.data.map((user: any) => ({
        _id: user._id,
        name: user.name,
        email: user.email
      }));
      setOrganizers(organizerData);
    } catch (err: any) {
      console.error('Error fetching organizers:', err);
    } finally {
      setLoadingOrganizers(false);
    }
  };

  // Handle opening the create event modal
  const handleOpenCreateModal = () => {
    setCreateModalOpen(true);
    setNewEvent({
      title: '',
      description: '',
      date: new Date().toISOString(),
      location: '',
      organizer: '',
    });
    setValidationErrors({});
    setCreateError(null);
    setCreateSuccess(false);
    
    // Fetch organizers when opening the modal
    fetchOrganizers();
  };

  // Handle new event change
  const handleNewEventChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | null, field?: string) => {
    // If this is a date change from the DateTimePicker
    if (field === 'date') {
      const dateValue = e as dayjs.Dayjs | null;
      
      if (dateValue) {
        // Format date as ISO string
        const formattedDate = dateValue.toISOString();
        
        setNewEvent(prev => ({
          ...prev,
          date: formattedDate
        }));
        
        // Clear validation error
        if (validationErrors.date) {
          setValidationErrors(prev => ({
            ...prev,
            date: undefined
          }));
        }
      }
    } 
    // Otherwise this is a standard input change
    else if (e && 'target' in e) {
      const { name, value } = e.target;
      if (!name) return;
      
      setNewEvent(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Clear validation error
      if (validationErrors[name as keyof typeof validationErrors]) {
        setValidationErrors(prev => ({
          ...prev,
          [name]: undefined
        }));
      }
    }
  };

  // Validate the form
  const validateForm = (): boolean => {
    const errors: {
      title?: string;
      description?: string;
      date?: string;
      location?: string;
      organizer?: string;
    } = {};
    
    if (!newEvent.title.trim()) {
      errors.title = 'Event title is required';
    }
    
    if (!newEvent.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!newEvent.date) {
      errors.date = 'Date is required';
    } else {
      const selectedDate = new Date(newEvent.date);
      if (isNaN(selectedDate.getTime())) {
        errors.date = 'Invalid date format';
      }
    }
    
    if (!newEvent.location.trim()) {
      errors.location = 'Location is required';
    }
    
    if (!newEvent.organizer) {
      errors.organizer = 'Organizer is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit the new event
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setCreateLoading(true);
    setCreateError(null);
    
    try {
      await axios.post(
        `${config.apiUrl}/api/events`,
        newEvent,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get('token')}`
          }
        }
      );
      
      setCreateSuccess(true);
      
      // Refresh events list
      fetchEvents();
      
      // Close modal after delay
      setTimeout(() => {
        setCreateModalOpen(false);
        setCreateSuccess(false);
      }, 2000);
      
    } catch (err: any) {
      console.error('Error creating event:', err);
      setCreateError(err.response?.data?.message || 'Failed to create event. Please try again.');
    } finally {
      setCreateLoading(false);
    }
  };

  // Function to handle delete confirmation
  const handleDeleteConfirmation = (event: Event) => {
    setEventToDelete(event);
    setDeleteModalOpen(true);
    setDeleteError(null);
    setDeleteSuccess(false);
  };

  // Function to delete event
  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;
    
    setDeleteLoading(true);
    setDeleteError(null);
    
    try {
      await axios.delete(`${config.apiUrl}/api/events/${eventToDelete._id}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`
        }
      });
      
      setDeleteSuccess(true);
      
      // Refresh events list
      fetchEvents();
      
      // Close modal after delay
      setTimeout(() => {
        setDeleteModalOpen(false);
        setEventToDelete(null);
        setDeleteSuccess(false);
      }, 1500);
      
    } catch (err: any) {
      console.error('Error deleting event:', err);
      setDeleteError(err.response?.data?.message || 'Failed to delete event. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle opening the edit event modal
  const handleOpenEditModal = (event: Event) => {
    setEventToEdit(event);
    setEditModalOpen(true);
    setEditEvent({
      title: event.title,
      description: event.description,
      date: event.date,
      location: event.location,
      organizer: event.organizer._id,
    });
    setEditValidationErrors({});
    setEditError(null);
    setEditSuccess(false);
    
    // Fetch organizers when opening the modal
    fetchOrganizers();
  };

  // Handle edit event change
  const handleEditEventChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | null, field?: string) => {
    // If this is a date change from the DateTimePicker
    if (field === 'date') {
      const dateValue = e as dayjs.Dayjs | null;
      
      if (dateValue) {
        // Format date as ISO string
        const formattedDate = dateValue.toISOString();
        
        setEditEvent(prev => ({
          ...prev,
          date: formattedDate
        }));
        
        // Clear validation error
        if (editValidationErrors.date) {
          setEditValidationErrors(prev => ({
            ...prev,
            date: undefined
          }));
        }
      }
    } 
    // Otherwise this is a standard input change
    else if (e && 'target' in e) {
      const { name, value } = e.target;
      if (!name) return;
      
      setEditEvent(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Clear validation error
      if (editValidationErrors[name as keyof typeof editValidationErrors]) {
        setEditValidationErrors(prev => ({
          ...prev,
          [name]: undefined
        }));
      }
    }
  };

  // Validate the edit form
  const validateEditForm = (): boolean => {
    const errors: {
      title?: string;
      description?: string;
      date?: string;
      location?: string;
      organizer?: string;
    } = {};
    
    if (!editEvent.title.trim()) {
      errors.title = 'Event title is required';
    }
    
    if (!editEvent.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!editEvent.date) {
      errors.date = 'Date is required';
    } else {
      const selectedDate = new Date(editEvent.date);
      if (isNaN(selectedDate.getTime())) {
        errors.date = 'Invalid date format';
      }
    }
    
    if (!editEvent.location.trim()) {
      errors.location = 'Location is required';
    }
    
    if (!editEvent.organizer) {
      errors.organizer = 'Organizer is required';
    }
    
    setEditValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit the edited event
  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEditForm() || !eventToEdit) return;
    
    setEditLoading(true);
    setEditError(null);
    
    try {
      await axios.put(
        `${config.apiUrl}/api/events/${eventToEdit._id}`,
        editEvent,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get('token')}`
          }
        }
      );
      
      setEditSuccess(true);
      
      // Refresh events list
      fetchEvents();
      
      // Close modal after delay
      setTimeout(() => {
        setEditModalOpen(false);
        setEventToEdit(null);
        setEditSuccess(false);
      }, 2000);
      
    } catch (err: any) {
      console.error('Error updating event:', err);
      setEditError(err.response?.data?.message || 'Failed to update event. Please try again.');
    } finally {
      setEditLoading(false);
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
        Event Management
      </Typography>

      {error && !searchError && <Typography color="error" className="mb-4">{error}</Typography>}

      {/* Add Search Bar */}
      <Paper className="shadow-lg mb-4">
        <Box p={2}>
          <form onSubmit={handleSearch}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search events by title, description, location, or organizer..."
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
            {searchPerformed && !searchError && filteredEvents.length > 0 && (
              <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
              </Typography>
            )}
          </form>
        </Box>
      </Paper>

      <Paper className="shadow-lg">
        <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" component="div" className="font-semibold">
              {searchPerformed ? 'Search Results' : 'All Events'}
            </Typography>
            {!searchPerformed && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                <span className='dark:text-gray-400 text-gray-700'>Last updated: {formatRefreshTime(lastRefreshTime)}</span>
              </Typography>
            )}
          </Box>
          <Box display="flex" gap={2}>
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
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateModal}
            >
              Create Event
            </Button>
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
                      active={sortField === 'title'}
                      direction={sortField === 'title' ? sortOrder : 'asc'}
                      onClick={() => handleRequestSort('title')}
                    >
                      Event Title
                    </TableSortLabel>
                  </TableCell>
                  <TableCell className="font-medium">
                    <TableSortLabel
                      active={sortField === 'date'}
                      direction={sortField === 'date' ? sortOrder : 'asc'}
                      onClick={() => handleRequestSort('date')}
                    >
                      Date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell className="font-medium">
                    <TableSortLabel
                      active={sortField === 'location'}
                      direction={sortField === 'location' ? sortOrder : 'asc'}
                      onClick={() => handleRequestSort('location')}
                    >
                      Location
                    </TableSortLabel>
                  </TableCell>
                  <TableCell className="font-medium">
                    <TableSortLabel
                      active={sortField === 'organizer'}
                      direction={sortField === 'organizer' ? sortOrder : 'asc'}
                      onClick={() => handleRequestSort('organizer')}
                    >
                      Organizer
                    </TableSortLabel>
                  </TableCell>
                  <TableCell className="font-medium">
                    <TableSortLabel
                      active={sortField === 'attendeesCount'}
                      direction={sortField === 'attendeesCount' ? sortOrder : 'asc'}
                      onClick={() => handleRequestSort('attendeesCount')}
                    >
                      Attendees
                    </TableSortLabel>
                  </TableCell>
                  <TableCell className="font-medium">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEvents
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((event) => {
                    const upcoming = isUpcomingEvent(event.date);
                    return (
                      <TableRow 
                        key={event._id} 
                        hover
                        sx={{
                          backgroundColor: upcoming ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                          '&:hover': {
                            backgroundColor: upcoming ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 152, 0, 0.2)',
                          }
                        }}
                      >
                        <TableCell><span className='dark:text-white text-black font-medium'>{event.title}</span></TableCell>
                        <TableCell>
                          <Chip
                            label={formatDate(event.date)}
                            size="small"
                            color={upcoming ? "success" : "warning"}
                            icon={<CalendarIcon />}
                          />
                        </TableCell>
                        <TableCell><span className='dark:text-white text-black'>{event.location}</span></TableCell>
                        <TableCell><span className='dark:text-white text-black'>{event.organizer.name}</span></TableCell>
                        <TableCell>
                          <Chip
                            label={event.attendeesCount}
                            size="small"
                            color="primary"
                            icon={<GroupIcon />}
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex">
                            <Tooltip title="View Details">
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => handleViewEvent(event)}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit Event">
                              <IconButton 
                                size="small" 
                                color="secondary"
                                onClick={() => handleOpenEditModal(event)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Event">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleDeleteConfirmation(event)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                {filteredEvents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" className="py-8">
                      <Typography variant="body1" color="textSecondary">
                        No events found
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
          count={filteredEvents.length}
          rowsPerPage={rowsPerPage}
          page={filteredEvents.length <= page * rowsPerPage && filteredEvents.length > 0 ? 0 : page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Event Details Modal */}
      <Modal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        aria-labelledby="event-details-modal"
      >
        <div className="bg-white dark:bg-gray-800 w-full max-w-lg p-6 m-auto rounded-md shadow-lg absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-h-[90vh] overflow-y-auto">
          {selectedEvent && (
            <Card className="shadow-none">
              <CardContent className="p-6">
                <Box display="flex" alignItems="center" mb={3}>
                  <Avatar 
                    sx={{ width: 56, height: 56, mr: 2, bgcolor: isUpcomingEvent(selectedEvent.date) ? 'success.main' : 'warning.main' }}
                  >
                    <EventIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" className="font-bold">
                      {selectedEvent.title}
                    </Typography>
                    <Chip 
                      label={isUpcomingEvent(selectedEvent.date) ? 'Upcoming' : 'Past Event'}
                      color={isUpcomingEvent(selectedEvent.date) ? 'success' : 'warning'}
                      size="small"
                    />
                  </Box>
                </Box>

                <Divider className="my-3" />

                <div className="space-y-4">
                  <div className="flex items-center">
                    <CalendarIcon className="text-blue-600 mr-3" />
                    <div>
                      <Typography variant="body2" color="primary">
                        Event Date
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(selectedEvent.date)}
                      </Typography>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <LocationIcon className="text-blue-600 mr-3" />
                    <div>
                      <Typography variant="body2" color="primary">
                        Location
                      </Typography>
                      <Typography variant="body1">
                        {selectedEvent.location}
                      </Typography>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <PersonIcon className="text-blue-600 mr-3" />
                    <div>
                      <Typography variant="body2" color="primary">
                        Organizer
                      </Typography>
                      <Typography variant="body1">
                        {selectedEvent.organizer.name} ({selectedEvent.organizer.email})
                      </Typography>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <GroupIcon className="text-blue-600 mr-3 mt-1" />
                    <div>
                      <Typography variant="body2" color="primary">
                        Attendance
                      </Typography>
                      <Typography variant="body1">
                        {selectedEvent.attendeesCount} {selectedEvent.attendeesCount === 1 ? 'person' : 'people'} attending
                      </Typography>
                    </div>
                  </div>

                  <div className="flex items-start mt-4">
                    <div className="w-full">
                      <Typography variant="body2" color="primary" className="mb-2">
                        Description
                      </Typography>
                      <Paper elevation={0} className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                        <Typography variant="body1">
                          {selectedEvent.description}
                        </Typography>
                      </Paper>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <CalendarIcon className="text-blue-600 mr-3 mt-1" />
                    <div>
                      <Typography variant="body2" color="primary">
                        Created On
                      </Typography>
                      <Typography variant="body1">
                        {new Date(selectedEvent.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </Typography>
                    </div>
                  </div>
                </div>

                <Box mt={4} display="flex" justifyContent="space-between">
                  <Box display="flex" gap={2}>
                    <Button 
                      onClick={() => handleDeleteConfirmation(selectedEvent)}
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                    >
                      Delete Event
                    </Button>
                    <Button 
                      onClick={() => {
                        setViewModalOpen(false);
                        handleOpenEditModal(selectedEvent);
                      }}
                      variant="outlined"
                      color="secondary"
                      startIcon={<EditIcon />}
                    >
                      Edit Event
                    </Button>
                  </Box>
                  <Button 
                    onClick={() => setViewModalOpen(false)} 
                    variant="contained"
                  >
                    Close
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </div>
      </Modal>

      {/* Create Event Modal */}
      <Modal
        open={createModalOpen}
        onClose={() => !createLoading && setCreateModalOpen(false)}
        aria-labelledby="create-event-modal"
      >
        <div className="bg-white dark:bg-gray-800 w-full max-w-lg p-6 m-auto rounded-md shadow-lg absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-h-[90vh] overflow-y-auto">
          <Card className="shadow-none">
            <CardContent className="p-6">
              <Typography variant="h6" component="h2" sx={{ mb: 3 }}>
                <span className='font-semibold text-blue-600'>Create New Event</span>
              </Typography>

              {createError && (
                <Alert severity="error" sx={{ mb: 2 }}>{createError}</Alert>
              )}
              
              {createSuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>Event created successfully!</Alert>
              )}
                
              <Box component="form" onSubmit={handleCreateEvent} sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  fullWidth
                  required
                  label="Event Title"
                  name="title"
                  value={newEvent.title}
                  onChange={handleNewEventChange}
                  error={!!validationErrors.title}
                  helperText={validationErrors.title}
                  disabled={createLoading}
                />
                
                <TextField
                  margin="normal"
                  fullWidth
                  required
                  label="Description"
                  name="description"
                  multiline
                  rows={3}
                  value={newEvent.description}
                  onChange={handleNewEventChange}
                  error={!!validationErrors.description}
                  helperText={validationErrors.description}
                  disabled={createLoading}
                />
                
                <TextField
                  margin="normal"
                  fullWidth
                  required
                  label="Location"
                  name="location"
                  value={newEvent.location}
                  onChange={handleNewEventChange}
                  error={!!validationErrors.location}
                  helperText={validationErrors.location}
                  disabled={createLoading}
                />

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DemoContainer components={['DateTimePicker']} sx={{ mt: 2 }}>
                    <DateTimePicker
                      label="Event Date & Time"
                      value={dayjs(newEvent.date)}
                      onChange={(newValue) => handleNewEventChange(newValue, 'date')}
                      slotProps={{ 
                        textField: { 
                          fullWidth: true,
                          required: true,
                          error: !!validationErrors.date,
                          helperText: validationErrors.date,
                          disabled: createLoading
                        } 
                      }}
                    />
                  </DemoContainer>
                </LocalizationProvider>

                <FormControl 
                  fullWidth 
                  margin="normal"
                  error={!!validationErrors.organizer}
                  disabled={createLoading || loadingOrganizers}
                >
                  <InputLabel id="organizer-select-label">Organizer</InputLabel>
                  <Select
                    labelId="organizer-select-label"
                    name="organizer"
                    value={newEvent.organizer}
                    label="Organizer"
                    onChange={handleNewEventChange as (event: SelectChangeEvent) => void}
                    startAdornment={
                      loadingOrganizers ? (
                        <InputAdornment position="start">
                          <CircularProgress size={20} />
                        </InputAdornment>
                      ) : null
                    }
                  >
                    {organizers.map(organizer => (
                      <MenuItem key={organizer._id} value={organizer._id}>
                        {organizer.name} ({organizer.email})
                      </MenuItem>
                    ))}
                  </Select>
                  {validationErrors.organizer && (
                    <FormHelperText>{validationErrors.organizer}</FormHelperText>
                  )}
                </FormControl>

                {createLoading && (
                  <Box sx={{ width: '100%', mt: 2 }}>
                    <LinearProgress />
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  <Button 
                    onClick={() => setCreateModalOpen(false)} 
                    variant="outlined"
                    disabled={createLoading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    variant="contained"
                    color="primary"
                    disabled={createLoading || createSuccess}
                  >
                    {createLoading ? 'Creating...' : 'Create Event'}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModalOpen}
        onClose={() => !deleteLoading && setDeleteModalOpen(false)}
        aria-labelledby="delete-event-modal"
      >
        <div className="bg-white dark:bg-gray-800 w-full max-w-md p-6 m-auto rounded-md shadow-lg absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-h-[90vh] overflow-y-auto">
          <Card className="shadow-none">
            <CardContent className="p-6">
              <Typography variant="h6" component="h2" sx={{ mb: 2 }} color="error">
                Delete Event
              </Typography>
              
              {deleteError && (
                <Alert severity="error" sx={{ mb: 2 }}>{deleteError}</Alert>
              )}
              
              {deleteSuccess ? (
                <Alert severity="success" sx={{ mb: 2 }}>Event deleted successfully!</Alert>
              ) : (
                <>
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    Are you sure you want to delete the event <strong>{eventToDelete?.title}</strong>?
                    This action cannot be undone.
                  </Typography>
                  
                  {eventToDelete && eventToDelete.attendeesCount > 0 && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      Warning: This event has {eventToDelete.attendeesCount} registered attendees who will be affected.
                    </Alert>
                  )}
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                    <Button 
                      onClick={() => setDeleteModalOpen(false)} 
                      variant="outlined"
                      disabled={deleteLoading}
                    >
                      Cancel
                    </Button>
                    <button 
                      onClick={handleDeleteEvent}
                      disabled={deleteLoading}
                      className="bg-red-600 text-white px-4 py-2 rounded flex items-center space-x-2 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deleteLoading ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <DeleteIcon fontSize="small" />
                      )}
                      <span>{deleteLoading ? 'Deleting...' : 'Delete Event'}</span>
                    </button>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </Modal>

      {/* Edit Event Modal */}
      <Modal
        open={editModalOpen}
        onClose={() => !editLoading && setEditModalOpen(false)}
        aria-labelledby="edit-event-modal"
      >
        <div className="bg-white dark:bg-gray-800 w-full max-w-lg p-6 m-auto rounded-md shadow-lg absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-h-[90vh] overflow-y-auto">
          <Card className="shadow-none">
            <CardContent className="p-6">
              <Typography variant="h6" component="h2" sx={{ mb: 3 }}>
                <span className='font-semibold text-blue-600'>Edit Event</span>
              </Typography>

              {editError && (
                <Alert severity="error" sx={{ mb: 2 }}>{editError}</Alert>
              )}
              
              {editSuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>Event updated successfully!</Alert>
              )}
                
              <Box component="form" onSubmit={handleUpdateEvent} sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  fullWidth
                  required
                  label="Event Title"
                  name="title"
                  value={editEvent.title}
                  onChange={handleEditEventChange}
                  error={!!editValidationErrors.title}
                  helperText={editValidationErrors.title}
                  disabled={editLoading}
                />
                
                <TextField
                  margin="normal"
                  fullWidth
                  required
                  label="Description"
                  name="description"
                  multiline
                  rows={3}
                  value={editEvent.description}
                  onChange={handleEditEventChange}
                  error={!!editValidationErrors.description}
                  helperText={editValidationErrors.description}
                  disabled={editLoading}
                />
                
                <TextField
                  margin="normal"
                  fullWidth
                  required
                  label="Location"
                  name="location"
                  value={editEvent.location}
                  onChange={handleEditEventChange}
                  error={!!editValidationErrors.location}
                  helperText={editValidationErrors.location}
                  disabled={editLoading}
                />

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DemoContainer components={['DateTimePicker']} sx={{ mt: 2 }}>
                    <DateTimePicker
                      label="Event Date & Time"
                      value={dayjs(editEvent.date)}
                      onChange={(newValue) => handleEditEventChange(newValue, 'date')}
                      slotProps={{ 
                        textField: { 
                          fullWidth: true,
                          required: true,
                          error: !!editValidationErrors.date,
                          helperText: editValidationErrors.date,
                          disabled: editLoading
                        } 
                      }}
                    />
                  </DemoContainer>
                </LocalizationProvider>

                <FormControl 
                  fullWidth 
                  margin="normal"
                  error={!!editValidationErrors.organizer}
                  disabled={editLoading || loadingOrganizers}
                >
                  <InputLabel id="edit-organizer-select-label">Organizer</InputLabel>
                  <Select
                    labelId="edit-organizer-select-label"
                    name="organizer"
                    value={editEvent.organizer}
                    label="Organizer"
                    onChange={handleEditEventChange as (event: SelectChangeEvent) => void}
                    startAdornment={
                      loadingOrganizers ? (
                        <InputAdornment position="start">
                          <CircularProgress size={20} />
                        </InputAdornment>
                      ) : null
                    }
                  >
                    {organizers.map(organizer => (
                      <MenuItem key={organizer._id} value={organizer._id}>
                        {organizer.name} ({organizer.email})
                      </MenuItem>
                    ))}
                  </Select>
                  {editValidationErrors.organizer && (
                    <FormHelperText>{editValidationErrors.organizer}</FormHelperText>
                  )}
                </FormControl>

                {editLoading && (
                  <Box sx={{ width: '100%', mt: 2 }}>
                    <LinearProgress />
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  <Button 
                    onClick={() => setEditModalOpen(false)} 
                    variant="outlined"
                    disabled={editLoading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    variant="contained"
                    color="primary"
                    disabled={editLoading || editSuccess}
                  >
                    {editLoading ? 'Updating...' : 'Update Event'}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </div>
      </Modal>
    </motion.div>
  );
};

export default Events;