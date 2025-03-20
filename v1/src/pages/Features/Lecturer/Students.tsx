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
  Modal,
  Card,
  CardContent,
  TextField,
  Divider,
  Avatar,
  CircularProgress,
  Alert,
  InputAdornment,
  Tooltip,
  TableSortLabel
} from '@mui/material';
import { 
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  School as SchoolIcon,
  AccessTime as AccessTimeIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: string;
  courses: any[];
  createdAt: string;
  activityCount: number;
}

// Define sorting order type
type Order = 'asc' | 'desc';

// Define sortable fields
type SortField = 'id' | 'name' | 'email' | 'createdAt' | null;

const Students = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState<boolean>(false);
  
  // New state for sorting
  const [sortOrder, setSortOrder] = useState<Order>('asc');
  const [sortField, setSortField] = useState<SortField>(null);
  
  // New state variables for search functionality
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState<boolean>(false);

  // New state for tracking last refresh time
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // New state for search type (ID or name)
  const [searchType, setSearchType] = useState<'id' | 'name'>('id');

  const fetchUsers = async (showRefreshAnimation = false) => {
    if (showRefreshAnimation) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      // Changed API endpoint to only fetch students
      const response = await axios.get(`${config.apiUrl}/api/users/student`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`
        }
      });
      setUsers(response.data);
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
      console.error('Error fetching students:', err);
      setError(err.response?.data?.message || 'Failed to collect student details.');
    } finally {
      if (showRefreshAnimation) {
        setTimeout(() => setRefreshing(false), 500); // Show refresh animation for at least 500ms
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchUsers();
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

  // Sort the users based on current sort field and direction
  const sortedUsers = React.useMemo(() => {
    if (!sortField) return users;

    return [...users].sort((a, b) => {
      return -compareValues(a, b, sortField);
    });
  }, [users, sortField, sortOrder]);

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setViewModalOpen(true);
  };

  // Search student by ID
  const searchUserById = async () => {
    if (!searchQuery.trim()) {
      // If search is cleared, reset to show all students
      setSearchPerformed(false);
      fetchUsers();
      return;
    }

    setSearchLoading(true);
    setSearchError(null);
    setSearchPerformed(true);

    // Make API request to search student by ID
    try { 
      const response = await axios.get(
        `${config.apiUrl}/api/users/student/${searchQuery.trim()}`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get('token')}`
          }
        }
      );

      // If successful, update users state with the single user
      if (response.data) {
        setUsers([response.data]);
      } else {
        setUsers([]);
      }
      setError(null);
    } catch (err: any) {
      console.error('Error searching student:', err);
      setSearchError('Student not found with the provided ID');
      setUsers([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Search student by name
  const searchUserByName = async () => {
    if (!searchQuery.trim()) {
      // If search is cleared, reset to show all students
      setSearchPerformed(false);
      fetchUsers();
      return;
    }

    setSearchLoading(true);
    setSearchError(null);
    setSearchPerformed(true);

    try {
      const response = await axios.get(
        `${config.apiUrl}/api/users/student/name/${searchQuery.trim()}`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get('token')}`
          }
        }
      );

      if (response.data && response.data.length > 0) {
        setUsers(response.data);
      } else {
        setUsers([]);
        setSearchError('No students found with the provided name');
      }
    } catch (err: any) {
      console.error('Error searching student by name:', err);
      setSearchError('Failed to search for students by name');
      setUsers([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle search form submit - now handles both ID and name search
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchType === 'id') {
      searchUserById();
    } else {
      searchUserByName();
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Clear search error when input changes
    if (searchError) {
      setSearchError(null);
    }
  };

  // Handle search type change
  const handleSearchTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchType(e.target.value as 'id' | 'name');
    // Clear search query and errors when changing search type
    setSearchQuery('');
    setSearchError(null);
  };

  // Clear search and show all students again
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchError(null);
    setSearchPerformed(false);
    fetchUsers();
  };

  // Handle refresh button click
  const handleRefresh = () => {
    fetchUsers(true);
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
        Students Management
      </Typography>

      {error && !searchError && <Alert severity="error" className="mb-4">{error}</Alert>}

      <Paper className="shadow-lg mb-4">
        <Box p={2}>
          <form onSubmit={handleSearchSubmit}>
            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} mb={2}>
              {/* Search type radio buttons */}
              <Box display="flex" alignItems="center">
                <Typography variant="body2" mr={1}>Search by:</Typography>
                <Box display="flex" flexDirection="row">
                  <Box display="flex" alignItems="center" mr={2}>
                    <input
                      type="radio"
                      id="search-id"
                      name="search-type"
                      value="id"
                      checked={searchType === 'id'}
                      onChange={handleSearchTypeChange}
                      className="mr-1"
                    />
                    <label htmlFor="search-id">ID</label>
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
            </Box>
            
            <TextField
              fullWidth
              variant="outlined"
              placeholder={searchType === 'id' ? "Search student by ID..." : "Search student by name..."}
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
              {searchPerformed && !searchError && users.length > 0 && (
                <Typography variant="body2" color="primary">
                  {users.length} student{users.length !== 1 ? 's' : ''} found
                </Typography>
              )}
              <button
                type="submit"
                className="btn bg-blue-500 p-2 rounded-md shadow-md hover:bg-blue-600 ml-auto text-white"
                disabled={searchLoading || !searchQuery.trim()}
              >
                {searchLoading ? (
                  <>
                    <CircularProgress size={20} className="mr-2 text-white" />
                    Searching...
                  </>
                ) : (
                  <>
                    <SearchIcon className="mr-1" />
                    Search
                  </>
                )}
              </button>
            </Box>
          </form>
        </Box>
      </Paper>

      <Paper className="shadow-lg">
        <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" component="div" className="font-semibold">
              {searchPerformed ? 'Search Results' : 'All Students'}
            </Typography>
            {!searchPerformed && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
               <span className='dark:text-gray-400 text-gray-700'> Last updated: {formatRefreshTime(lastRefreshTime)}</span>
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
                      active={sortField === 'id'}
                      direction={sortField === 'id' ? sortOrder : 'asc'}
                      onClick={() => handleRequestSort('id')}
                    >
                      Student ID
                    </TableSortLabel>
                  </TableCell>
                  <TableCell className="font-medium">
                    <TableSortLabel
                      active={sortField === 'name'}
                      direction={sortField === 'name' ? sortOrder : 'asc'}
                      onClick={() => handleRequestSort('name')}
                    >
                      Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell className="font-medium">
                    <TableSortLabel
                      active={sortField === 'email'}
                      direction={sortField === 'email' ? sortOrder : 'asc'}
                      onClick={() => handleRequestSort('email')}
                    >
                      Email
                    </TableSortLabel>
                  </TableCell>
                  <TableCell className="font-medium">Courses</TableCell>
                  <TableCell className="font-medium">
                    <TableSortLabel
                      active={sortField === 'createdAt'}
                      direction={sortField === 'createdAt' ? sortOrder : 'asc'}
                      onClick={() => handleRequestSort('createdAt')}
                    >
                      Registered Date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell className="font-medium">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedUsers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user) => (
                    <TableRow key={user._id} hover>
                      <TableCell><span className='dark:text-white text-black'>{user.id}</span></TableCell>
                      <TableCell><span className='dark:text-white text-black'>{user.name}</span></TableCell>
                      <TableCell><span className='dark:text-white text-black'>{user.email}</span></TableCell>
                      <TableCell>
                        <span className='dark:text-white text-black'>
                          {user.courses && user.courses.length > 0 ? user.courses.length : 'No courses'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className='dark:text-white text-black'>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleViewUser(user)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" className="py-8">
                      <Typography variant="body1" color="textSecondary">
                        {searchPerformed 
                          ? "No students found matching your search" 
                          : "No students found"}
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
          count={users.length}
          rowsPerPage={rowsPerPage}
          page={users.length <= page * rowsPerPage ? 0 : page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* View User Modal */}
      <Modal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        aria-labelledby="view-user-modal"
      >
        <div className="bg-white dark:bg-gray-800 w-full max-w-lg p-6 m-auto rounded-md shadow-lg absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-h-[90vh] overflow-y-auto">
          {selectedUser && (
            <Card className="shadow-none">
              <CardContent className="p-6">
                <Box display="flex" alignItems="center" mb={3}>
                  <Avatar 
                    sx={{ width: 56, height: 56, mr: 2, bgcolor: 'primary.main' }}
                  >
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" className="font-bold">
                      {selectedUser.name}
                    </Typography>
                    <Chip 
                      label="Student"
                      color="success"
                      size="small"
                    />
                  </Box>
                </Box>

                <Divider className="my-3" />

                <div className="space-y-4">
                  <div className="flex items-center">
                    <BadgeIcon className="text-blue-600 mr-3" />
                    <div>
                      <Typography variant="body2" color="primary">
                        Student ID
                      </Typography>
                      <Typography variant="body1">
                        {selectedUser.id}
                      </Typography>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <EmailIcon className="text-blue-600 mr-3" />
                    <div>
                      <Typography variant="body2" color="primary">
                        Email
                      </Typography>
                      <Typography variant="body1">
                        {selectedUser.email}
                      </Typography>
                    </div>
                  </div>
                  
                  {selectedUser.courses && (
                    <div className="flex items-center">
                      <SchoolIcon className="text-blue-600 mr-3" />
                      <div>
                        <Typography variant="body2" color="primary">
                          Enrolled Courses
                        </Typography>
                        <Typography variant="body1">
                          {selectedUser.courses.length > 0 ? selectedUser.courses.length : 'No courses'}
                        </Typography>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <AccessTimeIcon className="text-blue-600 mr-3" />
                    <div>
                      <Typography variant="body2" color="primary">
                        Account Created
                      </Typography>
                      <Typography variant="body1">
                        {new Date(selectedUser.createdAt).toLocaleString()}
                      </Typography>
                    </div>
                  </div>
                </div>

                <Box mt={4} display="flex" justifyContent="flex-end">
                  <button 
                    onClick={() => setViewModalOpen(false)} 
                    className="btn bg-blue-500 p-3 rounded-3xl shadow-lg hover:bg-blue-600 hover:scale-105 cursor-pointer text-white"
                  >
                    Close
                  </button>
                </Box>
              </CardContent>
            </Card>
          )}
        </div>
      </Modal>
    </motion.div>
  );
}

export default Students;