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
} from '@mui/material';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import {
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
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
  } | null; // Make instructor nullable
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
  instructor: string;
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
  instructor: string;
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
    instructor: '',
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
    instructor?: string;
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
      const response = await axios.get(`${config.apiUrl}/api/courses`, {
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

      {error && !searchError && <Typography color="error" className="mb-4">{error}</Typography>}

      {/* Add Search Bar */}
      <Paper className="shadow-lg mb-4">
        <Box p={2}>
          <form onSubmit={handleSearchSubmit}>
            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} mb={2}>
              {/* Search type radio buttons */}
              <FormControl component="fieldset">
                <Box display="flex" flexDirection="row">
                  <FormControl component="fieldset">
                    <Box display="flex" alignItems="center">
                      <Typography variant="body2" mr={1}>Search by:</Typography>
                      <Box display="flex" flexDirection="row">
                        <Box display="flex" alignItems="center" mr={2}>
                          <input
                            type="radio"
                            id="search-code"
                            name="search-type"
                            value="code"
                            checked={searchType === 'code'}
                            onChange={handleSearchTypeChange}
                            className="mr-1"
                          />
                          <label htmlFor="search-code">Code</label>
                        </Box>
                        <Box display="flex" alignItems="center">
                          <input
                            type="radio"
                            id="search-name"
                            name="search-type"
                            value="name"
                            checked={searchType === 'name'}
                            onChange={handleSearchTypeChange}
                            className="mr-1"
                          />
                          <label htmlFor="search-name">Name</label>
                        </Box>
                      </Box>
                    </Box>
                  </FormControl>
                </Box>
              </FormControl>
            </Box>
            
            <TextField
              fullWidth
              variant="outlined"
              placeholder={searchType === 'code' ? "Search course by code..." : "Search course by name..."}
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
            <Box mt={1} display="flex" justifyContent="space-between" alignItems="center">
              {searchError && (
                <Typography color="error" variant="body2">
                  {searchError}
                </Typography>
              )}
              {searchPerformed && !searchError && courses.length > 0 && (
                <Typography variant="body2" color="primary">
                  {courses.length} course{courses.length !== 1 ? 's' : ''} found
                </Typography>
              )}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={searchLoading || !searchQuery.trim()}
                className="ml-auto"
                startIcon={searchLoading ? <CircularProgress size={20} /> : <SearchIcon />}
              >
                {searchLoading ? 'Searching...' : 'Search'}
              </Button>
            </Box>
          </form>
        </Box>
      </Paper>

      <Paper className="shadow-lg">
        <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" component="div" className="font-semibold">
              {searchPerformed ? 'Search Results' : 'All Courses'}
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
              Create Course
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
                  .map((course) => (
                    <TableRow key={course._id} hover>
                      <TableCell><span className='dark:text-white text-black'>{course.name}</span></TableCell>
                      <TableCell><span className='dark:text-white text-black'>{course.code}</span></TableCell>
                      <TableCell><span className='dark:text-white text-black'>{course.instructor.name}</span></TableCell>
                      <TableCell>
                        <Chip
                          label={`${course.schedule.day}, ${course.schedule.startTime} - ${course.schedule.endTime}`}
                          size="small"
                        />
                      </TableCell>
                      <TableCell><span className='dark:text-white text-black'>{new Date(course.createdAt).toLocaleDateString()}</span></TableCell>
                      <TableCell>
                        <IconButton size="small" color="primary">
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
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
    </motion.div>
  );
};

//Done
export default Courses;