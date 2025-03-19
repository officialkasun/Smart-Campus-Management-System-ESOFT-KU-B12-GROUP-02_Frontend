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
} from '@mui/material';
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
  };
  schedule: {
    day: string;
    startTime: string;
    endTime: string;
  };
  students: string[];
  createdAt: string;
}

// Define sorting order type
type Order = 'asc' | 'desc';

// Define sortable fields
type SortField = 'name' | 'code' | 'instructor' | 'createdAt' | null;

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // New state for sorting
  const [sortOrder, setSortOrder] = useState<Order>('asc');
  const [sortField, setSortField] = useState<SortField>(null);

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

export default Courses;