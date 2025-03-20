import React, { useEffect, useState, useRef } from 'react';
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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Link,
  Badge,
  Grid,
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
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Upload as UploadIcon,
  AttachFile as AttachFileIcon,
  PictureAsPdf as PdfIcon,
  InsertDriveFile as DocIcon,
  Slideshow as PptIcon,
  Article as TxtIcon,
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
  lectureMaterials: string[]; // Array of material paths
  createdAt: string;
}

// New interface for creating a course
interface NewCourse {
  name: string;
  code: string;
  description: string;
  schedule: {
    day: string;
    startTime: string;
    endTime: string;
  };
  lectureMaterials?: string[]; // Optional since it will be handled by FormData
}

// New interface for editing a course
interface EditCourse {
  name: string;
  code: string;
  description: string;
  schedule: {
    day: string;
    startTime: string;
    endTime: string;
  };
  lectureMaterials?: string[]; // Optional since existing materials will be handled separately
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
    startTime?: string;
    endTime?: string;
  }>({});
  const [createLoading, setCreateLoading] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<boolean>(false);
  
  // State for delete confirmation
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<boolean>(false);

  // New state for editing courses
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);
  const [editCourse, setEditCourse] = useState<EditCourse>({
    name: '',
    code: '',
    description: '',
    schedule: {
      day: 'Monday',
      startTime: '',
      endTime: '',
    },
  });
  const [editValidationErrors, setEditValidationErrors] = useState<{
    name?: string;
    code?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
  }>({});
  const [editLoading, setEditLoading] = useState<boolean>(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<boolean>(false);

  // New state for search functionality
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState<boolean>(false);
  const [searchType, setSearchType] = useState<'code' | 'name'>('code');
  
  // New state for tracking last refresh time
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // New state for file uploads
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for edit form file uploads
  const [editUploadedFiles, setEditUploadedFiles] = useState<File[]>([]);
  const [editUploadError, setEditUploadError] = useState<string | null>(null);
  const [removedMaterials, setRemovedMaterials] = useState<string[]>([]);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const fetchCourses = async (showRefreshAnimation = false) => {
    if (showRefreshAnimation) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const response = await axios.get(`${config.apiUrl}/api/courses/lecturer`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      });
      setCourses(response.data);
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
      console.error('Error fetching courses:', err);
      setError(err.response?.data?.message || 'Failed to fetch courses.');
    } finally {
      if (showRefreshAnimation) {
        setTimeout(() => setRefreshing(false), 500); // Show refresh animation for at least 500ms
      } else {
        setLoading(false);
      }
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

  // Handle opening the create course modal
  const handleOpenCreateModal = () => {
    setCreateModalOpen(true);
    setNewCourse({
      name: '',
      code: '',
      description: '',
      schedule: {
        day: 'Monday',
        startTime: '',
        endTime: '',
      },
    });
    setValidationErrors({});
    setCreateError(null);
    setUploadedFiles([]);
    setUploadError(null);
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
      // If files are uploaded, use FormData
      if (uploadedFiles.length > 0) {
        const formData = new FormData();
        
        // Append course data
        formData.append('name', newCourse.name);
        formData.append('code', newCourse.code);
        formData.append('description', newCourse.description);
        formData.append('schedule[day]', newCourse.schedule.day);
        formData.append('schedule[startTime]', newCourse.schedule.startTime);
        formData.append('schedule[endTime]', newCourse.schedule.endTime);
        
        // Append files
        uploadedFiles.forEach(file => {
          formData.append('lectureMaterials', file);
        });
        
        await axios.post(
          `${config.apiUrl}/api/courses`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get('token')}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      } else {
        // No files, use regular JSON payload
        await axios.post(
          `${config.apiUrl}/api/courses`,
          newCourse,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get('token')}`
            }
          }
        );
      }
      
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

  // Function to handle delete confirmation
  const handleDeleteConfirmation = (course: Course) => {
    setCourseToDelete(course);
    setDeleteModalOpen(true);
    setDeleteError(null);
    setDeleteSuccess(false);
  };

  // Function to delete course
  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;
    
    setDeleteLoading(true);
    setDeleteError(null);
    
    try {
      await axios.delete(`${config.apiUrl}/api/courses/${courseToDelete._id}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`
        }
      });
      
      setDeleteSuccess(true);
      
      // Refresh courses list
      fetchCourses();
      
      // Close modal after delay
      setTimeout(() => {
        setDeleteModalOpen(false);
        setCourseToDelete(null);
        setDeleteSuccess(false);
      }, 1500);
      
    } catch (err: any) {
      console.error('Error deleting course:', err);
      setDeleteError(err.response?.data?.message || 'Failed to delete course. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle opening the edit course modal
  const handleOpenEditModal = (course: Course) => {
    setCourseToEdit(course);
    setEditModalOpen(true);
    setEditCourse({
      name: course.name,
      code: course.code,
      description: course.description,
      schedule: {
        day: course.schedule.day,
        startTime: course.schedule.startTime,
        endTime: course.schedule.endTime,
      },
      lectureMaterials: course.lectureMaterials
    });
    setEditValidationErrors({});
    setEditError(null);
    setEditSuccess(false);
    setEditUploadedFiles([]);
    setEditUploadError(null);
    setRemovedMaterials([]);
  };

  // Handle edit course form changes
  const handleEditCourseChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | null, field?: string) => {
    // If this is a time change from the TimePicker
    if (field === 'startTime' || field === 'endTime') {
      const timeValue = e as dayjs.Dayjs | null;
      
      if (timeValue) {
        // Format time as HH:MM AM/PM
        const formattedTime = timeValue.format('h:mm A');
        
        setEditCourse(prev => ({
          ...prev,
          schedule: {
            ...prev.schedule,
            [field]: formattedTime
          }
        }));
        
        // Clear validation error
        if (editValidationErrors[field as 'startTime' | 'endTime']) {
          setEditValidationErrors(prev => ({
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
        setEditCourse(prev => ({
          ...prev,
          schedule: {
            ...prev.schedule,
            [name]: value
          }
        }));
      } else {
        setEditCourse(prev => ({
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
    }
  };

  // Validate the edit form
  const validateEditForm = (): boolean => {
    const errors: {
      name?: string;
      code?: string;
      description?: string;
      startTime?: string;
      endTime?: string;
    } = {};
    
    if (!editCourse.name.trim()) {
      errors.name = 'Course name is required';
    }
    
    if (!editCourse.code.trim()) {
      errors.code = 'Course code is required';
    }
    
    if (!editCourse.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!editCourse.schedule.startTime.trim()) {
      errors.startTime = 'Start time is required';
    }
    
    if (!editCourse.schedule.endTime.trim()) {
      errors.endTime = 'End time is required';
    }
    
    setEditValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit the edited course
  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEditForm() || !courseToEdit) return;
    
    setEditLoading(true);
    setEditError(null);
    
    try {
      const updatePayload = {
        name: editCourse.name,
        code: editCourse.code,
        description: editCourse.description,
        schedule: {
          day: editCourse.schedule.day,
          startTime: editCourse.schedule.startTime,
          endTime: editCourse.schedule.endTime,
        },
        lectureMaterials: editCourse.lectureMaterials, // Pass updated materials
      };

      // If there are new files, use FormData
      if (editUploadedFiles.length > 0) {
        const formData = new FormData();

        // Append course data
        Object.entries(updatePayload).forEach(([key, value]) => {
          if (key === 'schedule') {
            Object.entries(value as Record<string, string>).forEach(([subKey, subValue]) => {
              formData.append(`schedule[${subKey}]`, subValue);
            });
          } else if (key === 'lectureMaterials') {
            (value as string[]).forEach(material => formData.append('lectureMaterials', material));
          } else {
            formData.append(key, value as string);
          }
        });

        // Append new files
        editUploadedFiles.forEach(file => {
          formData.append('lectureMaterials', file);
        });

        await axios.put(
          `${config.apiUrl}/api/courses/${courseToEdit._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get('token')}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      } else {
        // No new files, use JSON payload
        await axios.put(
          `${config.apiUrl}/api/courses/${courseToEdit._id}`,
          updatePayload,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get('token')}`,
            },
          }
        );
      }

      setEditSuccess(true);

      // Refresh courses list
      fetchCourses();

      // Close modal after delay
      setTimeout(() => {
        setEditModalOpen(false);
        setCourseToEdit(null);
        setEditSuccess(false);
      }, 2000);
    } catch (err: any) {
      console.error('Error updating course:', err);
      setEditError(err.response?.data?.message || 'Failed to update course. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

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
                <Box display="flex">
                  <IconButton 
                    size="small" 
                    color="primary"
                    onClick={() => handleViewCourse(course)}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="secondary"
                    onClick={() => handleOpenEditModal(course)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => handleDeleteConfirmation(course)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
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


{/* Course Details Modal */}
<Modal
  open={viewModalOpen}
  onClose={() => setViewModalOpen(false)}
  aria-labelledby="course-details-modal"
>
  <div className="bg-white w-full max-w-lg p-6 m-auto rounded-md shadow-lg">
    {selectedCourse && (
      <Card>
        <CardContent>
          <Typography variant="h6">{selectedCourse.name}</Typography>
          <Typography variant="body2">Code: {selectedCourse.code}</Typography>
          <Typography variant="body2">Instructor: {selectedCourse.instructor.name}</Typography>
          <Typography variant="body2">Schedule: {selectedCourse.schedule.day}, {selectedCourse.schedule.startTime} - {selectedCourse.schedule.endTime}</Typography>
          <Button onClick={() => setViewModalOpen(false)}>Close</Button>
        </CardContent>
      </Card>
    )}
  </div>
</Modal>

{/* Create Course Modal */}
<Modal open={createModalOpen} onClose={() => !createLoading && setCreateModalOpen(false)}>
  <div className="bg-white w-full max-w-lg p-6 m-auto rounded-md shadow-lg">
    <Card>
      <CardContent>
        <Typography variant="h6">Create New Course</Typography>
        {createError && <Alert severity="error">{createError}</Alert>}
        <TextField fullWidth required label="Course Name" name="name" value={newCourse.name} onChange={handleNewCourseChange} />
        <TextField fullWidth required label="Course Code" name="code" value={newCourse.code} onChange={handleNewCourseChange} />
        <Button type="submit" variant="contained" onClick={handleCreateCourse}>Create Course</Button>
      </CardContent>
    </Card>
  </div>
</Modal>

};


  export default Courses;