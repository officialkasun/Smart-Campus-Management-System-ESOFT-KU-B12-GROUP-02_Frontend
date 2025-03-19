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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  Alert,
  LinearProgress,
  SelectChangeEvent,
  InputAdornment,
} from '@mui/material';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import {
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  School as SchoolIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  Code as CodeIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  Add as AddIcon,
} from '@mui/icons-material';

// Define course interface
interface Course {
  _id: string;
  name: string;
  code: string;
  description: string;
  instructor: {
    _id: string;
    name: string;
    email: string;
  };
  schedule: {
    day: string;
    startTime: string;
    endTime: string;
  };
  students: string[];
  createdAt: string;
}

// New interface for creating a course
interface NewCourse {
  name: string;
  code: string;
  description: string;
  instructor: string;
  schedule: {
    day: string;
    startTime: string;
    endTime: string;
  };
}

// Define sorting order type
type Order = 'asc' | 'desc';

// Define sortable fields
type SortField = 'name' | 'code' | 'instructor' | 'createdAt' | null;

// Define days of week for dropdown
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // New state for sorting
  const [sortOrder, setSortOrder] = useState<Order>('asc');
  const [sortField, setSortField] = useState<SortField>(null);

  // New state for viewing course details
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState<boolean>(false);

  // New state for creating courses
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [newCourse, setNewCourse] = useState<NewCourse>({
    name: '',
    code: '',
    description: '',
    instructor: '',
    schedule: {
      day: 'Monday',
      startTime: '',
      endTime: '',
    },
  });
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    code?: string;
    description?: string;
    instructor?: string;
    startTime?: string;
    endTime?: string;
  }>({});
  const [createLoading, setCreateLoading] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<boolean>(false);
  
  // State for instructors (lecturers)
  const [instructors, setInstructors] = useState<{_id: string, name: string, email: string}[]>([]);
  const [loadingInstructors, setLoadingInstructors] = useState<boolean>(false);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${config.apiUrl}/api/courses`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      });
      setCourses(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching courses:', err);
      setError(err.response?.data?.message || 'Failed to fetch courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
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

    if (b[orderBy] < a[orderBy]) {
      return sortOrder === 'asc' ? 1 : -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return sortOrder === 'asc' ? -1 : 1;
    }
    return 0;
  };

  // Sort the courses based on current sort field and direction
  const sortedCourses = React.useMemo(() => {
    if (!sortField) return courses;

    return [...courses].sort((a, b) => {
      return -compareValues(a, b, sortField);
    });
  }, [courses, sortField, sortOrder]);

  // Function to handle viewing a course
  const handleViewCourse = (course: Course) => {
    setSelectedCourse(course);
    setViewModalOpen(true);
  };

  // Helper function to check if a course is currently in session
  const isCurrentlyInSession = (course: Course): boolean => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = daysOfWeek[new Date().getDay()];
    
    // Check if the course is scheduled for today
    if (course.schedule.day !== today) {
      return false;
    }
    
    // Get current time in 24-hour format (HH:MM)
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeStr = `${currentHours.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`;
    
    // Parse start and end times to 24-hour format for comparison
    const parseTimeToMinutes = (timeStr: string): number => {
      // Handle different time formats (10:00 AM, 10:00, etc.)
      let hours = 0;
      let minutes = 0;
      
      if (timeStr.includes(':')) {
        const timeParts = timeStr.split(':');
        hours = parseInt(timeParts[0], 10);
        
        // Extract minutes, removing any AM/PM
        const minutesPart = timeParts[1].replace(/\s*[AP]M\s*$/, '');
        minutes = parseInt(minutesPart, 10);
        
        // Convert 12-hour format to 24-hour if needed
        if (timeStr.toUpperCase().includes('PM') && hours < 12) {
          hours += 12;
        }
        if (timeStr.toUpperCase().includes('AM') && hours === 12) {
          hours = 0;
        }
      } else {
        // If there's no colon, assume it's just hours
        hours = parseInt(timeStr, 10);
      }
      
      return hours * 60 + minutes;
    };
    
    const currentTime = currentHours * 60 + currentMinutes;
    const startTime = parseTimeToMinutes(course.schedule.startTime);
    const endTime = parseTimeToMinutes(course.schedule.endTime);
    
    return currentTime >= startTime && currentTime <= endTime;
  };

  // Fetch instructors (lecturers)
  const fetchInstructors = async () => {
    setLoadingInstructors(true);
    try {
      const response = await axios.get(`${config.apiUrl}/api/users/lecturers`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      });
      setInstructors(response.data);
    } catch (err: any) {
      console.error('Error fetching instructors:', err);
    } finally {
      setLoadingInstructors(false);
    }
  };

  // Handle opening the create course modal
  const handleOpenCreateModal = () => {
    setCreateModalOpen(true);
    setNewCourse({
      name: '',
      code: '',
      description: '',
      instructor: '',
      schedule: {
        day: 'Monday',
        startTime: '',
        endTime: '',
      },
    });
    setValidationErrors({});
    setCreateError(null);
    
    // Fetch instructors when opening the modal
    fetchInstructors();
  };

  // Modify handleNewCourseChange to handle MUI TimePicker changes
  const handleNewCourseChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | null, field?: string) => {
    // If this is a time change from the TimePicker
    if (field === 'startTime' || field === 'endTime') {
      const timeValue = e as dayjs.Dayjs | null;
      
      if (timeValue) {
        // Format time as HH:MM AM/PM
        const formattedTime = timeValue.format('h:mm A');
        
        setNewCourse(prev => ({
          ...prev,
          schedule: {
            ...prev.schedule,
            [field]: formattedTime
          }
        }));
        
        // Clear validation error
        if (validationErrors[field as 'startTime' | 'endTime']) {
          setValidationErrors(prev => ({
            ...prev,
            [field]: undefined
          }));
        }
      }
    } 
    // Otherwise this is a standard input change
    else if (e && 'target' in e) {
      const { name, value } = e.target;
      if (!name) return;
      
      if (name === 'day') {
        setNewCourse(prev => ({
          ...prev,
          schedule: {
            ...prev.schedule,
            [name]: value
          }
        }));
      } else {
        setNewCourse(prev => ({
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
    }
  };

  // Convert time string to dayjs object
  const parseTimeToDayjs = (timeStr: string): dayjs.Dayjs | null => {
    if (!timeStr) return null;
    return dayjs(timeStr, 'h:mm A');
  };

  // Helper function to convert 24-hour format to 12-hour format with AM/PM
  const convertTo12HourFormat = (time24: string): string => {
    if (!time24 || !time24.includes(':')) return time24;
    
    const [hourStr, minuteStr] = time24.split(':');
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    
    const period = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12; // Convert to 12-hour format
    
    return `${hour}:${minute.toString().padStart(2, '0')} ${period}`;
  };
  
  // Helper function to convert 12-hour format to 24-hour format for the time picker
  const convertTo24HourFormat = (time12: string): string => {
    if (!time12) return '';
    
    const isPM = time12.toLowerCase().includes('pm');
    const timeOnly = time12.replace(/\s*[APap][Mm]\s*$/, '');
    
    const [hourStr, minuteStr] = timeOnly.split(':');
    let hour = parseInt(hourStr, 10);
    
    if (isPM && hour < 12) hour += 12;
    if (!isPM && hour === 12) hour = 0;
    
    return `${hour.toString().padStart(2, '0')}:${minuteStr}`;
  };

  // Helper to convert time string to Date object
  const parseTimeString = (timeStr: string): Date | null => {
    if (!timeStr) return null;
    
    const today = new Date();
    const [time, period] = timeStr.split(' ');
    
    if (!time) return null;
    
    let [hours, minutes] = time.split(':').map(num => parseInt(num, 10));
    
    // Convert to 24-hour format if needed
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    const result = new Date(today);
    result.setHours(hours);
    result.setMinutes(minutes || 0);
    return result;
  };

  // Validate the form
  const validateForm = (): boolean => {
    const errors: {
      name?: string;
      code?: string;
      description?: string;
      instructor?: string;
      startTime?: string;
      endTime?: string;
    } = {};
    
    if (!newCourse.name.trim()) {
      errors.name = 'Course name is required';
    }
    
    if (!newCourse.code.trim()) {
      errors.code = 'Course code is required';
    }
    
    if (!newCourse.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!newCourse.instructor) {
      errors.instructor = 'Instructor is required';
    }
    
    if (!newCourse.schedule.startTime.trim()) {
      errors.startTime = 'Start time is required';
    }
    
    if (!newCourse.schedule.endTime.trim()) {
      errors.endTime = 'End time is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit the new course
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setCreateLoading(true);
    setCreateError(null);
    
    try {
      await axios.post(
        `${config.apiUrl}/api/courses`,
        newCourse,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get('token')}`
          }
        }
      );
      
      setCreateSuccess(true);
      
      // Refresh courses list
      fetchCourses();
      
      // Close modal after delay
      setTimeout(() => {
        setCreateModalOpen(false);
        setCreateSuccess(false);
      }, 2000);
      
    } catch (err: any) {
      console.error('Error creating course:', err);
      setCreateError(err.response?.data?.message || 'Failed to create course. Please try again.');
    } finally {
      setCreateLoading(false);
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
        Course Management
      </Typography>

      {error && <Typography color="error" className="mb-4">{error}</Typography>}

      <Paper className="shadow-lg">
        <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="div" className="font-semibold">
            All Courses
          </Typography>
          <Box display="flex" gap={2}>
            <Tooltip title="Refresh data">
              <span>
                <IconButton
                  color="primary"
                  onClick={fetchCourses}
                  disabled={loading}
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
              Create Course
            </Button>
          </Box>
        </Box>

        {loading ? (
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
                      Course Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell className="font-medium">
                    <TableSortLabel
                      active={sortField === 'code'}
                      direction={sortField === 'code' ? sortOrder : 'asc'}
                      onClick={() => handleRequestSort('code')}
                    >
                      Code
                    </TableSortLabel>
                  </TableCell>
                  <TableCell className="font-medium">
                    <TableSortLabel
                      active={sortField === 'instructor'}
                      direction={sortField === 'instructor' ? sortOrder : 'asc'}
                      onClick={() => handleRequestSort('instructor')}
                    >
                      Instructor
                    </TableSortLabel>
                  </TableCell>
                  <TableCell className="font-medium">Schedule</TableCell>
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
                {sortedCourses
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((course) => {
                    const inSession = isCurrentlyInSession(course);
                    return (
                      <TableRow 
                        key={course._id} 
                        hover
                        sx={{
                          backgroundColor: inSession ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 152, 0, 0.1)',
                          '&:hover': {
                            backgroundColor: inSession ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 152, 0, 0.2)',
                          }
                        }}
                      >
                        <TableCell><span className='dark:text-white text-black'>{course.name}</span></TableCell>
                        <TableCell><span className='dark:text-white text-black'>{course.code}</span></TableCell>
                        <TableCell><span className='dark:text-white text-black'>{course.instructor.name}</span></TableCell>
                        <TableCell>
                          <Chip
                            label={`${course.schedule.day}, ${course.schedule.startTime} - ${course.schedule.endTime}`}
                            size="small"
                            color={inSession ? "success" : "warning"}
                          />
                        </TableCell>
                        <TableCell><span className='dark:text-white text-black'>{new Date(course.createdAt).toLocaleDateString()}</span></TableCell>
                        <TableCell>
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleViewCourse(course)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                {courses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" className="py-8">
                      <Typography variant="body1" color="textSecondary">
                        No courses found
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
          count={courses.length}
          rowsPerPage={rowsPerPage}
          page={courses.length <= page * rowsPerPage ? 0 : page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Course Details Modal */}
      <Modal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        aria-labelledby="course-details-modal"
      >
        <div className="bg-white dark:bg-gray-800 w-full max-w-lg p-6 m-auto rounded-md shadow-lg absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-h-[90vh] overflow-y-auto">
          {selectedCourse && (
            <Card className="shadow-none">
              <CardContent className="p-6">
                <Box display="flex" alignItems="center" mb={3}>
                  <Avatar 
                    sx={{ width: 56, height: 56, mr: 2, bgcolor: 'primary.main' }}
                  >
                    <SchoolIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" className="font-bold">
                      {selectedCourse.name}
                    </Typography>
                    <Chip 
                      label={selectedCourse.code}
                      color="primary"
                      size="small"
                    />
                  </Box>
                </Box>

                <Divider className="my-3" />

                <div className="space-y-4">
                  <div className="flex items-center">
                    <CodeIcon className="text-blue-600 mr-3" />
                    <div>
                      <Typography variant="body2" color="primary">
                        Course Code
                      </Typography>
                      <Typography variant="body1">
                        {selectedCourse.code}
                      </Typography>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <DescriptionIcon className="text-blue-600 mr-3" />
                    <div>
                      <Typography variant="body2" color="primary">
                        Description
                      </Typography>
                      <Typography variant="body1">
                        {selectedCourse.description}
                      </Typography>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <PersonIcon className="text-blue-600 mr-3" />
                    <div>
                      <Typography variant="body2" color="primary">
                        Instructor
                      </Typography>
                      <Typography variant="body1">
                        {selectedCourse.instructor.name} ({selectedCourse.instructor.email})
                      </Typography>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <ScheduleIcon className="text-blue-600 mr-3" />
                    <div>
                      <Typography variant="body2" color="primary">
                        Schedule
                      </Typography>
                      <Typography variant="body1">
                        {`${selectedCourse.schedule.day}, ${selectedCourse.schedule.startTime} - ${selectedCourse.schedule.endTime}`}
                      </Typography>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <GroupIcon className="text-blue-600 mr-3" />
                    <div>
                      <Typography variant="body2" color="primary">
                        Students Enrolled
                      </Typography>
                      <Typography variant="body1">
                        {selectedCourse.students.length}
                      </Typography>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <AccessTimeIcon className="text-blue-600 mr-3" />
                    <div>
                      <Typography variant="body2" color="primary">
                        Created On
                      </Typography>
                      <Typography variant="body1">
                        {new Date(selectedCourse.createdAt).toLocaleString()}
                      </Typography>
                    </div>
                  </div>
                </div>

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

      {/* Create Course Modal */}
      <Modal
        open={createModalOpen}
        onClose={() => !createLoading && setCreateModalOpen(false)}
        aria-labelledby="create-course-modal"
      >
        <div className="bg-white dark:bg-gray-800 w-full max-w-lg p-6 m-auto rounded-md shadow-lg absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-h-[90vh] overflow-y-auto">
          <Card className="shadow-none">
            <CardContent className="p-6">
              <Typography variant="h6" component="h2" sx={{ mb: 3 }}>
                <span className='font-semibold text-blue-600'>Create New Course</span>
              </Typography>

              {createError && (
                <Alert severity="error" sx={{ mb: 2 }}>{createError}</Alert>
              )}
              
              {createSuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>Course created successfully!</Alert>
              )}
                
              <Box component="form" onSubmit={handleCreateCourse} sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  fullWidth
                  required
                  label="Course Name"
                  name="name"
                  value={newCourse.name}
                  onChange={handleNewCourseChange}
                  error={!!validationErrors.name}
                  helperText={validationErrors.name}
                  disabled={createLoading}
                />
                
                <TextField
                  margin="normal"
                  fullWidth
                  required
                  label="Course Code"
                  name="code"
                  value={newCourse.code}
                  onChange={handleNewCourseChange}
                  error={!!validationErrors.code}
                  helperText={validationErrors.code}
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
                  value={newCourse.description}
                  onChange={handleNewCourseChange}
                  error={!!validationErrors.description}
                  helperText={validationErrors.description}
                  disabled={createLoading}
                />

                <FormControl 
                  fullWidth 
                  margin="normal"
                  error={!!validationErrors.instructor}
                  disabled={createLoading || loadingInstructors}
                >
                  <InputLabel id="instructor-select-label">Instructor</InputLabel>
                  <Select
                    labelId="instructor-select-label"
                    name="instructor"
                    value={newCourse.instructor}
                    label="Instructor"
                    onChange={handleNewCourseChange as (event: SelectChangeEvent) => void}
                    startAdornment={
                      loadingInstructors ? (
                        <InputAdornment position="start">
                          <CircularProgress size={20} />
                        </InputAdornment>
                      ) : null
                    }
                  >
                    {instructors.map(instructor => (
                      <MenuItem key={instructor._id} value={instructor._id}>
                        {instructor.name} ({instructor.email})
                      </MenuItem>
                    ))}
                  </Select>
                  {validationErrors.instructor && (
                    <FormHelperText>{validationErrors.instructor}</FormHelperText>
                  )}
                </FormControl>

                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                  Schedule
                </Typography>

                <FormControl fullWidth margin="normal">
                  <InputLabel id="day-select-label">Day</InputLabel>
                  <Select
                    labelId="day-select-label"
                    name="day"
                    value={newCourse.schedule.day}
                    label="Day"
                    onChange={handleNewCourseChange as (event: SelectChangeEvent) => void}
                    disabled={createLoading}
                  >
                    {daysOfWeek.map(day => (
                      <MenuItem key={day} value={day}>{day}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box display="flex" gap={2} mt={2}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DemoContainer components={['TimePicker']}>
                      <TimePicker
                        label="Start Time"
                        value={parseTimeToDayjs(newCourse.schedule.startTime)}
                        onChange={(newValue) => handleNewCourseChange(newValue, 'startTime')}
                        slotProps={{ 
                          textField: { 
                            fullWidth: true,
                            required: true,
                            error: !!validationErrors.startTime,
                            helperText: validationErrors.startTime,
                            disabled: createLoading
                          } 
                        }}
                      />
                    </DemoContainer>
                  </LocalizationProvider>
                  
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DemoContainer components={['TimePicker']}>
                      <TimePicker
                        label="End Time"
                        value={parseTimeToDayjs(newCourse.schedule.endTime)}
                        onChange={(newValue) => handleNewCourseChange(newValue, 'endTime')}
                        slotProps={{ 
                          textField: { 
                            fullWidth: true,
                            required: true,
                            error: !!validationErrors.endTime,
                            helperText: validationErrors.endTime,
                            disabled: createLoading
                          } 
                        }}
                      />
                    </DemoContainer>
                  </LocalizationProvider>
                </Box>

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
                    {createLoading ? 'Creating...' : 'Create Course'}
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

export default Courses;