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
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Stack,
  Grid,
  Alert,
  Snackbar,
  Fab,
  RadioGroup,
  FormControlLabel,
  Radio,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import {
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  QuestionAnswer as ExamIcon,
  Category as OtherIcon,
  Add as AddIcon,
} from '@mui/icons-material';

// Define Schedule interface
interface ScheduleEvent {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  type: 'class' | 'exam' | 'assignment' | 'other';
  createdAt: string;
}

interface Schedule {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
  };
  events: ScheduleEvent[];
  createdAt: string;
}

// Define sorting order type
type Order = 'asc' | 'desc';

// Define sortable fields
type SortField = 'studentId.name' | 'events.length' | 'createdAt' | null;

// Interface for create event form data
interface CreateEventFormData {
  studentId: string;
  title: string;
  description: string;
  date: Date | null;
  location: string;
  type: 'class' | 'exam' | 'assignment' | 'other';
}

// Interface for student selection
interface Student {
  _id: string;
  name: string;
  email: string;
}

const Schedules = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // State for sorting
  const [sortOrder, setSortOrder] = useState<Order>('asc');
  const [sortField, setSortField] = useState<SortField>('createdAt');

  // State for viewing schedule details
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState<boolean>(false);
  const [viewEventModalOpen, setViewEventModalOpen] = useState<boolean>(false);

  // State for tracking last refresh time
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // State for search functionality
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState<boolean>(false);

  // State for create event modal
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<CreateEventFormData>({
    studentId: '',
    title: '',
    description: '',
    date: null,
    location: '',
    type: 'class',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState<boolean>(false);

  // Add state for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [deleteSuccess, setDeleteSuccess] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [eventToDelete, setEventToDelete] = useState<ScheduleEvent | null>(null);

  // Fetch schedules function
  const fetchSchedules = async (showRefreshAnimation = false) => {
    if (showRefreshAnimation) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const response = await axios.get(`${config.apiUrl}/api/schedules/event`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      });
      
      console.log('API Response:', response.data);
      
      // Handle different response formats
      let schedulesArray: Schedule[] = [];
      
      if (Array.isArray(response.data)) {
        schedulesArray = response.data;
      } else if (typeof response.data === 'object' && response.data !== null) {
        // If it's an object, check if it has common container properties
        if (response.data.data && Array.isArray(response.data.data)) {
          schedulesArray = response.data.data;
        } else if (response.data.schedules && Array.isArray(response.data.schedules)) {
          schedulesArray = response.data.schedules;
        } else if (response.data.items && Array.isArray(response.data.items)) {
          schedulesArray = response.data.items;
        } else if (response.data.results && Array.isArray(response.data.results)) {
          schedulesArray = response.data.results;
        } else {
          // If it's just an object with schedule data, wrap it in an array
          if (response.data._id && response.data.studentId && response.data.events) {
            schedulesArray = [response.data];
          } else {
            // As a last resort, try to get all values from the object if they appear to be schedules
            const possibleSchedules = Object.values(response.data);
            if (possibleSchedules.length > 0 && 
                possibleSchedules.every((item: any) => 
                  item && typeof item === 'object' && item._id && item.studentId && item.events)) {
              schedulesArray = possibleSchedules as Schedule[];
            } else {
              console.error('Unable to extract schedules array from response:', response.data);
              setError('Received data in an unexpected format. Please contact support.');
            }
          }
        }
      } else {
        console.error('Expected array or object of schedules but got:', typeof response.data);
        setError('Received invalid data format from server.');
      }
      
      setSchedules(schedulesArray);
      
      // Update last refresh time
      setLastRefreshTime(new Date());
      
      // Reset search state if this is a manual refresh
      if (showRefreshAnimation && searchPerformed) {
        setSearchPerformed(false);
        setSearchQuery('');
        setSearchError(null);
      }
    } catch (err: any) {
      console.error('Error fetching schedules:', err);
      setError(err.response?.data?.message || 'Failed to fetch schedules.');
      setSchedules([]); // Set to empty array to avoid further errors
    } finally {
      if (showRefreshAnimation) {
        setTimeout(() => setRefreshing(false), 500); // Show refresh animation for at least 500ms
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchSchedules();
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
    if (orderBy === 'studentId.name') {
      valueA = a.studentId.name;
      valueB = b.studentId.name;
    } else if (orderBy === 'events.length') {
      valueA = a.events.length;
      valueB = b.events.length;
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

  // Sort the schedules based on current sort field and direction
  const sortedSchedules = React.useMemo(() => {
    if (!sortField) return schedules;
    
    // Check if schedules is actually an array before spreading it
    if (!Array.isArray(schedules)) {
      console.error('Expected schedules to be an array but got:', typeof schedules);
      return [];
    }

    return [...schedules].sort((a, b) => {
      return -compareValues(a, b, sortField);
    });
  }, [schedules, sortField, sortOrder]);

  // Function to handle viewing a schedule
  const handleViewSchedule = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setViewModalOpen(true);
  };

  // Function to handle viewing an event
  const handleViewEvent = (event: ScheduleEvent) => {
    setSelectedEvent(event);
    setViewEventModalOpen(true);
  };

  // Handle refresh button click
  const handleRefresh = () => {
    fetchSchedules(true);
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

    // If search is cleared, reset to show all schedules
    if (e.target.value === '') {
      handleClearSearch();
    }
  };

  // Clear search and show all schedules again
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchError(null);
    setSearchPerformed(false);
    fetchSchedules();
  };

  // Filter schedules based on search query
  const filteredSchedules = React.useMemo(() => {
    if (!searchQuery) return sortedSchedules;
    
    // Ensure sortedSchedules is an array
    if (!Array.isArray(sortedSchedules)) {
      console.error('Expected sortedSchedules to be an array but got:', typeof sortedSchedules);
      return [];
    }

    const query = searchQuery.toLowerCase();
    return sortedSchedules.filter(schedule => 
      schedule.studentId.name.toLowerCase().includes(query) ||
      schedule.studentId.email.toLowerCase().includes(query) ||
      schedule.events.some(event => 
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query) ||
        event.type.toLowerCase().includes(query)
      )
    );
  }, [sortedSchedules, searchQuery]);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchPerformed(true);
    
    if (filteredSchedules.length === 0) {
      setSearchError('No schedules match your search criteria.');
    } else {
      setSearchError(null);
    }
  };

  // Function to get event type icon
  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'class':
        return <SchoolIcon />;
      case 'exam':
        return <ExamIcon />;
      case 'assignment':
        return <AssignmentIcon />;
      case 'other':
      default:
        return <OtherIcon />;
    }
  };

  // Function to get event type color
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'class':
        return 'primary';
      case 'exam':
        return 'error';
      case 'assignment':
        return 'warning';
      case 'other':
      default:
        return 'info';
    }
  };

  // Function to display status messages for update/delete
  const showNotImplementedMessage = (action: string) => {
    alert(`${action} functionality is not implemented yet.`);
  };

  // Function to fetch students for dropdown
  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const response = await axios.get(`${config.apiUrl}/api/users/student`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      });
      
      // Extract students from the response
      let studentsData: Student[] = [];
      if (Array.isArray(response.data)) {
        studentsData = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        studentsData = response.data.data;
      } else if (response.data && response.data.users && Array.isArray(response.data.users)) {
        studentsData = response.data.users;
      }
      
      setStudents(studentsData);
    } catch (err: any) {
      console.error('Error fetching students:', err);
      // Show error in form
      setFormErrors({ ...formErrors, studentId: 'Failed to load students' });
    } finally {
      setLoadingStudents(false);
    }
  };

  // Handle opening create modal
  const handleOpenCreateModal = () => {
    setCreateModalOpen(true);
    // Reset form state
    setFormData({
      studentId: '',
      title: '',
      description: '',
      date: null,
      location: '',
      type: 'class',
    });
    setFormErrors({});
    setSubmitSuccess(false);
    setSubmitError(null);
    // Fetch students for dropdown
    fetchStudents();
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: '',
      });
    }
  };

  // Handle select input changes
  const handleSelectChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const name = e.target.name as string;
    const value = e.target.value;
    
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: '',
      });
    }
  };

  // Handle date change from date picker
  const handleDateChange = (newDate: Date | null) => {
    setFormData({
      ...formData,
      date: newDate,
    });
    
    // Clear error for this field if it exists
    if (formErrors['date']) {
      setFormErrors({
        ...formErrors,
        date: '',
      });
    }
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.studentId) {
      errors.studentId = 'Student is required';
    }
    
    if (!formData.title) {
      errors.title = 'Title is required';
    }
    
    if (!formData.date) {
      errors.date = 'Date and time are required';
    }
    
    if (!formData.location) {
      errors.location = 'Location is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    setSubmitError(null);
    
    try {
      // Create schedule event - only pass date without time
      await axios.post(
        `${config.apiUrl}/api/schedules/event`,
        {
          studentId: formData.studentId,
          events: {
            title: formData.title,
            description: formData.description,
            date: formData.date ? new Date(formData.date).toISOString().split('T')[0] : null, // Extract only the date part
            location: formData.location,
            type: formData.type,
          }
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      // Show success message
      setSubmitSuccess(true);
      
      // Refresh schedules after a short delay
      setTimeout(() => {
        fetchSchedules();
        setCreateModalOpen(false);
      }, 1500);
      
    } catch (err: any) {
      console.error('Error creating event:', err);
      setSubmitError(err.response?.data?.message || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  // Function to handle deleting an event
  const handleDeleteEvent = async () => {

   let studentId = selectedSchedule.studentId._id;
  
    if (!eventToDelete) return;
    
    setDeleteLoading(true);
    setDeleteError(null);
    
    try {
      await axios.delete(`${config.apiUrl}/api/schedules/events/event/${studentId}/${eventToDelete._id}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      });
      
      // Show success state
      setDeleteSuccess(true);
      
      // Close the delete dialog after a delay
      setTimeout(() => {
        setDeleteDialogOpen(false);
        // Also close the event details modal
        setViewEventModalOpen(false);
        // Refresh the schedules
        fetchSchedules(true);
        // Reset states
        setEventToDelete(null);
        setDeleteSuccess(false);
      }, 1500);
      
    } catch (err: any) {
      console.error('Error deleting event:', err);
      setDeleteError(err.response?.data?.message || 'Failed to delete event');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Function to open delete confirmation dialog
  const openDeleteDialog = (event: ScheduleEvent) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
    setDeleteError(null);
    setDeleteSuccess(false);
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
        Schedule Management
      </Typography>

      {error && !searchError && <Typography color="error" className="mb-4">{error}</Typography>}

      {/* Add Search Bar */}
      <Paper className="shadow-lg mb-4">
        <Box p={2}>
          <form onSubmit={handleSearch}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search schedules by student name, email, or event details..."
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
            {searchPerformed && !searchError && filteredSchedules.length > 0 && (
              <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                {filteredSchedules.length} schedule{filteredSchedules.length !== 1 ? 's' : ''} found
              </Typography>
            )}
          </form>
        </Box>
      </Paper>

      <Paper className="shadow-lg">
        <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" component="div" className="font-semibold">
              {searchPerformed ? 'Search Results' : 'All Schedules'}
            </Typography>
            {!searchPerformed && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                <span className='dark:text-gray-400 text-gray-700'>Last updated: {formatRefreshTime(lastRefreshTime)}</span>
              </Typography>
            )}
          </Box>
          <Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateModal}
              sx={{ mr: 2 }}
            >
              New Schedule
            </Button>
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
                      active={sortField === 'studentId.name'}
                      direction={sortField === 'studentId.name' ? sortOrder : 'asc'}
                      onClick={() => handleRequestSort('studentId.name')}
                    >
                      Student
                    </TableSortLabel>
                  </TableCell>
                  <TableCell className="font-medium">
                    <TableSortLabel
                      active={sortField === 'events.length'}
                      direction={sortField === 'events.length' ? sortOrder : 'asc'}
                      onClick={() => handleRequestSort('events.length')}
                    >
                      Events Count
                    </TableSortLabel>
                  </TableCell>
                  <TableCell className="font-medium">Next Upcoming Event</TableCell>
                  <TableCell className="font-medium">
                    <TableSortLabel
                      active={sortField === 'createdAt'}
                      direction={sortField === 'createdAt' ? sortOrder : 'asc'}
                      onClick={() => handleRequestSort('createdAt')}
                    >
                      Created At
                    </TableSortLabel>
                  </TableCell>
                  <TableCell className="font-medium">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSchedules
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((schedule) => {
                    // Find the next upcoming event
                    const upcomingEvents = schedule.events
                      .filter(event => isUpcomingEvent(event.date))
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                    
                    const nextEvent = upcomingEvents.length > 0 ? upcomingEvents[0] : null;

                    return (
                      <TableRow 
                        key={schedule._id} 
                        hover
                      >
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}>
                              {schedule.studentId.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" className="font-medium">
                                {schedule.studentId.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {schedule.studentId.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={schedule.events.length}
                            size="small"
                            color="primary"
                          />
                        </TableCell>
                        <TableCell>
                          {nextEvent ? (
                            <Box display="flex" alignItems="center">
                              <Avatar 
                                sx={{ 
                                  width: 24, 
                                  height: 24, 
                                  mr: 1, 
                                  bgcolor: `${getEventTypeColor(nextEvent.type)}.main` 
                                }}
                              >
                                {getEventTypeIcon(nextEvent.type)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" className="font-medium truncate" sx={{ maxWidth: 200 }}>
                                  {nextEvent.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {formatDate(nextEvent.date)}
                                </Typography>
                              </Box>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary" className="italic">
                              No upcoming events
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(schedule.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Box display="flex">
                            <Tooltip title="View Schedule">
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => handleViewSchedule(schedule)}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit Schedule (Not Implemented)">
                              <IconButton 
                                size="small" 
                                color="secondary"
                                onClick={() => showNotImplementedMessage("Edit")}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Schedule (Not Implemented)">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => showNotImplementedMessage("Delete")}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                {filteredSchedules.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" className="py-8">
                      <Typography variant="body1" color="textSecondary">
                        No schedules found
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
          count={filteredSchedules.length}
          rowsPerPage={rowsPerPage}
          page={filteredSchedules.length <= page * rowsPerPage && filteredSchedules.length > 0 ? 0 : page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Schedule Details Modal */}
      <Modal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        aria-labelledby="schedule-details-modal"
      >
        <div className="bg-white dark:bg-gray-800 w-full max-w-2xl p-6 m-auto rounded-md shadow-lg absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-h-[90vh] overflow-y-auto">
          {selectedSchedule && (
            <Card className="shadow-none">
              <CardContent className="p-6">
                <Box display="flex" alignItems="center" mb={3}>
                  <Avatar 
                    sx={{ width: 56, height: 56, mr: 2, bgcolor: 'primary.main' }}
                  >
                    {selectedSchedule.studentId.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" className="font-bold">
                      {selectedSchedule.studentId.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedSchedule.studentId.email}
                    </Typography>
                  </Box>
                </Box>

                <Divider className="my-3" />

                <Box mb={3}>
                  <Typography variant="h6" className="font-semibold mb-2">
                    Schedule Events ({selectedSchedule.events.length})
                  </Typography>
                  
                  {selectedSchedule.events.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" className="italic mt-2">
                      No events found in this schedule.
                    </Typography>
                  ) : (
                    <List sx={{ bgcolor: 'background.paper' }} className="border rounded">
                      {selectedSchedule.events
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .map((event) => (
                          <ListItem 
                            key={event._id}
                            secondaryAction={
                              <IconButton edge="end" aria-label="view" onClick={() => handleViewEvent(event)}>
                                <VisibilityIcon />
                              </IconButton>
                            }
                            divider
                            sx={{
                              bgcolor: isUpcomingEvent(event.date) ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: `${getEventTypeColor(event.type)}.main` }}>
                                {getEventTypeIcon(event.type)}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Typography variant="body1" className="font-medium">
                                    {event.title}
                                  </Typography>
                                  <Chip 
                                    label={event.type} 
                                    size="small" 
                                    color={getEventTypeColor(event.type) as any} 
                                    sx={{ height: 20 }}
                                  />
                                </Box>
                              }
                              secondary={
                                <React.Fragment>
                                  <Typography variant="body2" component="span" color="text.primary">
                                    {formatDate(event.date)}
                                  </Typography>
                                  {" — "}
                                  <Typography variant="body2" component="span" color="text.secondary">
                                    {event.location}
                                  </Typography>
                                </React.Fragment>
                              }
                            />
                          </ListItem>
                        ))}
                    </List>
                  )}
                </Box>

                <Divider className="my-3" />

                <Box display="flex" alignItems="center" mb={2}>
                  <CalendarIcon className="text-blue-600 mr-2" />
                  <Typography variant="body2" color="text.secondary">
                    Schedule created on {formatDate(selectedSchedule.createdAt)}
                  </Typography>
                </Box>

                <Box mt={4} display="flex" justifyContent="flex-end">
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

      {/* Event Details Modal */}
      <Modal
        open={viewEventModalOpen}
        onClose={() => setViewEventModalOpen(false)}
        aria-labelledby="event-details-modal"
      >
        <div className="bg-white dark:bg-gray-800 w-full max-w-md p-6 m-auto rounded-md shadow-lg absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-h-[90vh] overflow-y-auto">
          {selectedEvent && (
            <Card className="shadow-none">
              <CardContent className="p-6">
                <Box display="flex" alignItems="center" mb={3}>
                  <Avatar 
                    sx={{ 
                      width: 48, 
                      height: 48, 
                      mr: 2, 
                      bgcolor: `${getEventTypeColor(selectedEvent.type)}.main` 
                    }}
                  >
                    {getEventTypeIcon(selectedEvent.type)}
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
                    <Chip 
                      label={selectedEvent.type.toUpperCase()}
                      color={getEventTypeColor(selectedEvent.type) as any}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                </Box>

                <Divider className="my-3" />

                <div className="space-y-4">
                  <div className="flex items-center">
                    <CalendarIcon className="text-blue-600 mr-3" />
                    <div>
                      <Typography variant="body2" color="primary">
                        Date & Time
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
                      onClick={() => showNotImplementedMessage("Edit")}
                      variant="outlined"
                      color="secondary"
                      startIcon={<EditIcon />}
                    >
                      Edit Event
                    </Button>
                    <Button 
                      onClick={() => openDeleteDialog(selectedEvent)}
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                    >
                      Delete
                    </Button>
                  </Box>
                  <Button 
                    onClick={() => setViewEventModalOpen(false)} 
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleteLoading && setDeleteDialogOpen(false)}
      >
        <DialogTitle>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          {deleteSuccess ? (
            <Alert severity="success" sx={{ mt: 2 }}>
              Event deleted successfully!
            </Alert>
          ) : (
            <>
              {deleteError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {deleteError}
                </Alert>
              )}
              <Typography>
                Are you sure you want to delete the event <strong>{eventToDelete?.title}</strong>?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                This action cannot be undone.
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            disabled={deleteLoading || deleteSuccess}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteEvent}
            color="error"
            variant="contained"
            disabled={deleteLoading || deleteSuccess}
            startIcon={deleteLoading ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {deleteLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create New Schedule Modal */}
      <Dialog
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Create New Schedule Event
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            {submitSuccess && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Event created successfully!
              </Alert>
            )}
            
            {submitError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {submitError}
              </Alert>
            )}
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth error={!!formErrors.studentId}>
                  <InputLabel id="student-select-label">Student</InputLabel>
                  <Select
                    labelId="student-select-label"
                    id="studentId"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleSelectChange as any}
                    disabled={loadingStudents || submitting}
                    label="Student"
                  >
                    {loadingStudents ? (
                      <MenuItem value="">
                        <Box display="flex" alignItems="center">
                          <CircularProgress size={20} sx={{ mr: 1 }} /> Loading...
                        </Box>
                      </MenuItem>
                    ) : (
                      students.length > 0 ? (
                        students.map((student) => (
                          <MenuItem key={student._id} value={student._id}>
                            {student.name} ({student.email})
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem value="" disabled>
                          No students available
                        </MenuItem>
                      )
                    )}
                  </Select>
                  {formErrors.studentId && (
                    <FormHelperText>{formErrors.studentId}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Event Title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  error={!!formErrors.title}
                  helperText={formErrors.title}
                  disabled={submitting}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="event-type-label">Event Type</InputLabel>
                  <Select
                    labelId="event-type-label"
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleSelectChange as any}
                    disabled={submitting}
                    label="Event Type"
                  >
                    <MenuItem value="class">
                      <Box display="flex" alignItems="center">
                        <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} /> Class
                      </Box>
                    </MenuItem>
                    <MenuItem value="exam">
                      <Box display="flex" alignItems="center">
                        <ExamIcon sx={{ mr: 1, color: 'error.main' }} /> Exam
                      </Box>
                    </MenuItem>
                    <MenuItem value="assignment">
                      <Box display="flex" alignItems="center">
                        <AssignmentIcon sx={{ mr: 1, color: 'warning.main' }} /> Assignment
                      </Box>
                    </MenuItem>
                    <MenuItem value="other">
                      <Box display="flex" alignItems="center">
                        <OtherIcon sx={{ mr: 1, color: 'info.main' }} /> Other
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    label="Date & Time"
                    value={formData.date}
                    onChange={handleDateChange}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!formErrors.date,
                        helperText: formErrors.date || "Only the date will be used, time will be ignored",
                        disabled: submitting,
                      },
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  error={!!formErrors.location}
                  helperText={formErrors.location}
                  disabled={submitting}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={submitting}
                  multiline
                  rows={4}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setCreateModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} /> : null}
            >
              {submitting ? 'Creating...' : 'Create Event'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </motion.div>
  );
};

export default Schedules;