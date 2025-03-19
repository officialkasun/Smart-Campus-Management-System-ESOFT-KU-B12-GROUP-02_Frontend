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
  Button,
  Box,
  Modal,
  Card,
  CardContent,
  TextField,
  Divider,
  Avatar,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  LinearProgress,
  InputAdornment,
  Tooltip,
  TableSortLabel
} from '@mui/material';
import { 
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  School as SchoolIcon,
  AccessTime as AccessTimeIcon,
  Add as AddIcon,
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

interface NewUser {
  name: string;
  email: string;
  password: string;
  role: string;
}

interface EditUserData {
  name: string;
  email: string;
  role: string;
}

// Define sorting order type
type Order = 'asc' | 'desc';

// Define sortable fields
type SortField = 'id' | 'name' | 'email' | 'role' | 'createdAt' | null;

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState<boolean>(false);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  
  // New state for sorting
  const [sortOrder, setSortOrder] = useState<Order>('asc');
  const [sortField, setSortField] = useState<SortField>(null);
  
  // New state variables for adding users
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [newUser, setNewUser] = useState<NewUser>({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });
  const [addUserLoading, setAddUserLoading] = useState<boolean>(false);
  const [addUserError, setAddUserError] = useState<string | null>(null);
  const [addUserSuccess, setAddUserSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    role?: string;
  }>({});

  // New state variables for delete user
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  // New state variables for search functionality
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState<boolean>(false);

  // New state for tracking last refresh time
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // New state variables for edit user
  const [editUserData, setEditUserData] = useState<EditUserData>({
    name: '',
    email: '',
    role: ''
  });
  const [editUserLoading, setEditUserLoading] = useState<boolean>(false);
  const [editUserError, setEditUserError] = useState<string | null>(null);
  const [editUserSuccess, setEditUserSuccess] = useState<string | null>(null);
  const [editValidationErrors, setEditValidationErrors] = useState<{
    name?: string;
    email?: string;
    role?: string;
  }>({});

  // New state for search type (ID or name)
  const [searchType, setSearchType] = useState<'id' | 'name'>('id');

  const fetchUsers = async (showRefreshAnimation = false) => {
    if (showRefreshAnimation) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const response = await axios.get(`${config.apiUrl}/api/users`, {
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
      console.error('Error fetching users :', err);
      setError(err.response?.data?.message || 'Failed to collect user details.');
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

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
    // Reset edit states and initialize form data
    setEditUserData({
      name: user.name,
      email: user.email,
      role: user.role
    });
    setEditValidationErrors({});
    setEditUserError(null);
    setEditUserSuccess(null);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
    // Reset delete states
    setDeleteError(null);
    setDeleteSuccess(null);
  };

  // Confirm and execute delete user
  const confirmDeleteUser = async () => {
    if (!selectedUser) return;
    
    setDeleteLoading(true);
    setDeleteError(null);
    setDeleteSuccess(null);
    
    try {
      await axios.delete(
        `${config.apiUrl}/api/users/${selectedUser._id}`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get('token')}`
          }
        }
      );
      
      setDeleteSuccess(`User "${selectedUser.name}" was deleted successfully.`);
      
      // Refresh users list
      fetchUsers();
      
      // Close dialog after success with short delay
      setTimeout(() => {
        setDeleteDialogOpen(false);
        setDeleteError(null);
        setDeleteSuccess(null);
        setSelectedUser(null);
      }, 1500);
      
    } catch (err: any) {
      console.error('Error deleting user:', err);
      setDeleteError(err.response?.data?.message || 'Failed to delete user. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'error';
      case 'lecturer':
        return 'warning';
      case 'student':
        return 'success';
      default:
        return 'default';
    }
  };

  // Open add user modal
  const handleOpenAddModal = () => {
    setAddModalOpen(true);
    // Reset form states
    setNewUser({
      name: '',
      email: '',
      password: '',
      role: 'student'
    });
    setValidationErrors({});
    setAddUserError(null);
    setAddUserSuccess(null);
  };

  // Close add user modal
  const handleCloseAddModal = () => {
    setAddModalOpen(false);
  };

  // Handle input changes for new user form
  const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setNewUser(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Clear validation error when field is updated
      if (validationErrors[name as keyof typeof validationErrors]) {
        setValidationErrors(prev => ({
          ...prev,
          [name]: undefined
        }));
      }
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
    } = {};
    
    // Name validation
    if (!newUser.name.trim()) {
      errors.name = 'Name is required';
    } else if (newUser.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newUser.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(newUser.email)) {
      errors.email = 'Enter a valid email address';
    }
    
    // Password validation
    if (!newUser.password) {
      errors.password = 'Password is required';
    } else if (newUser.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(newUser.password)) {
      errors.password = 'Password must contain uppercase, lowercase and numbers';
    }
    
    // Role validation
    if (!newUser.role) {
      errors.role = 'Role is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Add new user
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setAddUserLoading(true);
    setAddUserError(null);
    setAddUserSuccess(null);
    
    try {
      await axios.post(
        `${config.apiUrl}/api/auth/register`,
        newUser,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get('token')}`
          }
        }
      );
      
      setAddUserSuccess('User added successfully!');
      setAddUserLoading(false);
      
      // Refresh users list
      fetchUsers();
      
      // Close modal after delay
      setTimeout(() => {
        setAddModalOpen(false);
        setAddUserSuccess(null);
      }, 2000);
      
    } catch (err: any) {
      setAddUserLoading(false);
      setAddUserError(err.response?.data?.message || 'Failed to add user. Please try again.');
      console.error('Error adding user:', err);
    }
  };

  // Handle input changes for edit user form
  const handleEditUserChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setEditUserData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Clear validation error when field is updated
      if (editValidationErrors[name as keyof typeof editValidationErrors]) {
        setEditValidationErrors(prev => ({
          ...prev,
          [name]: undefined
        }));
      }
    }
  };

  // Validate edit form
  const validateEditForm = (): boolean => {
    const errors: {
      name?: string;
      email?: string;
      role?: string;
    } = {};
    
    // Name validation
    if (!editUserData.name.trim()) {
      errors.name = 'Name is required';
    } else if (editUserData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!editUserData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(editUserData.email)) {
      errors.email = 'Enter a valid email address';
    }
    
    // Role validation
    if (!editUserData.role) {
      errors.role = 'Role is required';
    }
    
    setEditValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit user edit
  const handleSubmitEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) return;
    if (!validateEditForm()) return;
    
    setEditUserLoading(true);
    setEditUserError(null);
    setEditUserSuccess(null);
    
    try {
      await axios.put(
        `${config.apiUrl}/api/users/${selectedUser._id}`,
        editUserData,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get('token')}`
          }
        }
      );
      
      setEditUserSuccess('User updated successfully!');
      setEditUserLoading(false);
      
      // Refresh users list
      fetchUsers();
      
      // Close modal after delay
      setTimeout(() => {
        setEditModalOpen(false);
        setEditUserSuccess(null);
      }, 2000);
      
    } catch (err: any) {
      setEditUserLoading(false);
      setEditUserError(err.response?.data?.message || 'Failed to update user. Please try again.');
      console.error('Error updating user:', err);
    }
  };

  // Search user by ID
  const searchUserById = async () => {
    if (!searchQuery.trim()) {
      // If search is cleared, reset to show all users
      setSearchPerformed(false);
      fetchUsers();
      return;
    }

    setSearchLoading(true);
    setSearchError(null);
    setSearchPerformed(true);

    // Make API request to search user by ID
    try { 
      const response = await axios.get(
        `${config.apiUrl}/api/users/${searchQuery.trim()}`,
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
      console.error('Error searching user:', err);
      setSearchError('User not found with the provided ID');
      setUsers([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Search user by name
  const searchUserByName = async () => {
    if (!searchQuery.trim()) {
      // If search is cleared, reset to show all users
      setSearchPerformed(false);
      fetchUsers();
      return;
    }

    setSearchLoading(true);
    setSearchError(null);
    setSearchPerformed(true);

    try {
      const response = await axios.get(
        `${config.apiUrl}/api/users/name/${searchQuery.trim()}`,
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
        setSearchError('No users found with the provided name');
      }
    } catch (err: any) {
      console.error('Error searching user by name:', err);
      setSearchError('Failed to search for users by name');
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

  // Clear search and show all users again
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
        User Management
      </Typography>

      {error && !searchError && <Alert severity="error" className="mb-4">{error}</Alert>}

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
                  </FormControl>
                </Box>
              </FormControl>
            </Box>
            
            <TextField
              fullWidth
              variant="outlined"
              placeholder={searchType === 'id' ? "Search user by ID..." : "Search user by name..."}
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
                  {users.length} user{users.length !== 1 ? 's' : ''} found
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
              {searchPerformed ? 'Search Results' : 'All Users'}
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
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<AddIcon />}
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleOpenAddModal}
            >
              Add New User
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
                      active={sortField === 'id'}
                      direction={sortField === 'id' ? sortOrder : 'asc'}
                      onClick={() => handleRequestSort('id')}
                    >
                      User ID
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
                  <TableCell className="font-medium">
                    <TableSortLabel
                      active={sortField === 'role'}
                      direction={sortField === 'role' ? sortOrder : 'asc'}
                      onClick={() => handleRequestSort('role')}
                    >
                      Role
                    </TableSortLabel>
                  </TableCell>
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
                {sortedUsers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user) => (
                    <TableRow key={user._id} hover>
                      <TableCell ><span className='dark:text-white text-black' >{user.id}</span></TableCell>
                      <TableCell><span className='dark:text-white text-black' >{user.name}</span></TableCell>
                      <TableCell><span className='dark:text-white text-black' >{user.email}</span></TableCell>
                      <TableCell>
                        <Chip 
                          label={user.role} 
                          color={getRoleColor(user.role)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell><span className='dark:text-white text-black' >
                        {new Date(user.createdAt).toLocaleDateString()}</span>
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
                          <IconButton 
                            size="small" 
                            color="info"
                            onClick={() => handleEditUser(user)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDeleteUser(user)}
                          >
                            <DeleteIcon fontSize="small" />
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
                          ? "No users found matching your search" 
                          : "No users found"}
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
                      label={selectedUser.role}
                      color={getRoleColor(selectedUser.role)}
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
                        User ID
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

                <Box mt={4} display="flex" justifyContent="space-between">
                  <Button 
                    onClick={() => setViewModalOpen(false)} 
                    variant="outlined"
                  >
                    Close
                  </Button>
                  <Box display="flex" gap={2}>
                    <button 
                      onClick={() => {
                        setViewModalOpen(false);
                        handleEditUser(selectedUser);
                      }}
                      className="btn bg-blue-500 p-3 rounded-3xl shadow-lg hover:bg-blue-600 hover:scale-105 cursor-pointer text-white"
                    >
                      Edit User
                    </button>
                    <button 
                      onClick={() => {
                        setViewModalOpen(false);
                        handleDeleteUser(selectedUser);
                      }}
                      className="btn bg-red-500 p-3 rounded-3xl shadow-lg hover:bg-red-600 hover:scale-105 cursor-pointer text-white"
                    >
                      Delete User
                    </button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        open={editModalOpen}
        onClose={() => !editUserLoading && setEditModalOpen(false)}
        aria-labelledby="edit-user-modal"
      >
        <div className="bg-white dark:bg-gray-800 w-full max-w-lg p-6 m-auto rounded-md shadow-lg absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-h-[90vh] overflow-y-auto">
          {selectedUser && (
            <Card className="shadow-none">
              <CardContent className="p-6">
                <Typography variant="h6" component="h2" sx={{ mb: 3 }}>
                  <span className='font-semibold text-blue-600'>Edit User</span>
                </Typography>
                
                {editUserError && (
                  <Alert severity="error" sx={{ mb: 2 }}>{editUserError}</Alert>
                )}
                
                {editUserSuccess && (
                  <Alert severity="success" sx={{ mb: 2 }}>{editUserSuccess}</Alert>
                )}
                
                <Box component="form" onSubmit={handleSubmitEditUser} sx={{ mt: 1 }}>
                  <TextField
                    margin="normal"
                    fullWidth
                    label="User ID"
                    value={selectedUser.id}
                    disabled
                  />
                  
                  <TextField
                    margin="normal"
                    fullWidth
                    required
                    label="Name"
                    name="name"
                    value={editUserData.name}
                    onChange={handleEditUserChange}
                    error={!!editValidationErrors.name}
                    helperText={editValidationErrors.name}
                    disabled={editUserLoading || !!editUserSuccess}
                  />
                  
                  <TextField
                    margin="normal"
                    fullWidth
                    required
                    label="Email"
                    name="email"
                    type="email"
                    value={editUserData.email}
                    onChange={handleEditUserChange}
                    error={!!editValidationErrors.email}
                    helperText={editValidationErrors.email}
                    disabled={editUserLoading || !!editUserSuccess}
                  />
                  
                  <FormControl 
                    fullWidth 
                    margin="normal"
                    error={!!editValidationErrors.role}
                    disabled={editUserLoading || !!editUserSuccess}
                  >
                    <InputLabel id="edit-role-select-label">Role</InputLabel>
                    <Select
                      labelId="edit-role-select-label"
                      name="role"
                      value={editUserData.role}
                      label="Role"
                      onChange={handleEditUserChange}
                    >
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="lecturer">Lecturer</MenuItem>
                      <MenuItem value="student">Student</MenuItem>
                    </Select>
                    {editValidationErrors.role && (
                      <FormHelperText>{editValidationErrors.role}</FormHelperText>
                    )}
                  </FormControl>

                  {editUserLoading && (
                    <Box sx={{ width: '100%', mt: 2 }}>
                      <LinearProgress />
                    </Box>
                  )}
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                    <Button 
                      onClick={() => setEditModalOpen(false)} 
                      variant="outlined"
                      disabled={editUserLoading}
                    >
                      Cancel
                    </Button>
                    <button 
                      type="submit" 
                      className="btn bg-blue-500 p-3 rounded-3xl shadow-lg hover:bg-blue-600 hover:scale-105 cursor-pointer text-white disabled:opacity-50 disabled:hover:bg-blue-500 disabled:hover:scale-100"
                      disabled={editUserLoading || !!editUserSuccess}
                    >
                      {editUserLoading ? 'Updating...' : 'Save Changes'}
                    </button>
                  </Box>
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
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">
          <span className='font-semibold text-red-600'>Confirm Deletion</span>
        </DialogTitle>
        <DialogContent>
          {deleteError && (
            <Alert severity="error" sx={{ mb: 2 }}>{deleteError}</Alert>
          )}
          
          {deleteSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>{deleteSuccess}</Alert>
          )}
          
          <DialogContentText>
            <span className='text-black dark:text-white'>
              Are you sure you want to delete user "{selectedUser?.name}"? This action cannot be undone.
            </span>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            color="primary"
            disabled={deleteLoading}
          >
            Cancel
          </Button>
          <button 
            onClick={confirmDeleteUser} 
            className="btn bg-red-500 p-3 rounded-3xl shadow-lg hover:bg-red-600 hover:scale-105 cursor-pointer text-white disabled:opacity-50 disabled:hover:bg-red-500 disabled:hover:scale-100"
            disabled={deleteLoading || !!deleteSuccess}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </button>
        </DialogActions>
        {deleteLoading && (
          <Box sx={{ width: '100%', mt: 0 }}>
            <LinearProgress color="error" />
          </Box>
        )}
      </Dialog>

      {/* Add New User Modal */}
      <Modal
        open={addModalOpen}
        onClose={handleCloseAddModal}
        aria-labelledby="add-user-modal"
      >
        <div className="bg-white dark:bg-gray-800 w-full max-w-lg p-6 m-auto rounded-md shadow-lg absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-h-[90vh] overflow-y-auto">
          <Card className="shadow-none">
            <CardContent className="p-6">
              <Typography variant="h6" component="h2" sx={{ mb: 3 }}>
                <span className='font-semibold text-blue-600'>Add New User</span>
              </Typography>

              {addUserError && (
                <Alert severity="error" sx={{ mb: 2 }}>{addUserError}</Alert>
              )}
              
              {addUserSuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>{addUserSuccess}</Alert>
              )}
                
              <Box component="form" onSubmit={handleAddUser} sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  fullWidth
                  required
                  label="Name"
                  name="name"
                  value={newUser.name}
                  onChange={handleNewUserChange}
                  error={!!validationErrors.name}
                  helperText={validationErrors.name}
                  disabled={addUserLoading || !!addUserSuccess}
                />
                
                <TextField
                  margin="normal"
                  fullWidth
                  required
                  label="Email"
                  name="email"
                  type="email"
                  value={newUser.email}
                  onChange={handleNewUserChange}
                  error={!!validationErrors.email}
                  helperText={validationErrors.email}
                  disabled={addUserLoading || !!addUserSuccess}
                />

                <TextField
                  margin="normal"
                  fullWidth
                  required
                  label="Password"
                  name="password"
                  type="password"
                  value={newUser.password}
                  onChange={handleNewUserChange}
                  error={!!validationErrors.password}
                  helperText={validationErrors.password}
                  disabled={addUserLoading || !!addUserSuccess}
                />

                <FormControl 
                  fullWidth 
                  margin="normal"
                  error={!!validationErrors.role}
                  disabled={addUserLoading || !!addUserSuccess}
                >
                  <InputLabel id="role-select-label">Role</InputLabel>
                  <Select
                    labelId="role-select-label"
                    name="role"
                    value={newUser.role}
                    label="Role"
                    onChange={handleNewUserChange}
                  >
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="lecturer">Lecturer</MenuItem>
                    <MenuItem value="student">Student</MenuItem>
                  </Select>
                  {validationErrors.role && (
                    <FormHelperText>{validationErrors.role}</FormHelperText>
                  )}
                </FormControl>

                {addUserLoading && (
                  <Box sx={{ width: '100%', mt: 2 }}>
                    <LinearProgress />
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  <Button 
                    onClick={handleCloseAddModal} 
                    variant="outlined"
                    disabled={addUserLoading || !!addUserSuccess}
                  >
                    Cancel
                  </Button>
                  <button 
                    type="submit" 
                    className="btn bg-blue-500 p-3 rounded-3xl shadow-lg hover:bg-blue-600 hover:scale-105 cursor-pointer text-white disabled:opacity-50 disabled:hover:bg-blue-500 disabled:hover:scale-100"
                    disabled={addUserLoading || !!addUserSuccess}
                  >
                    {addUserLoading ? 'Adding...' : 'Add User'}
                  </button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </div>
      </Modal>
    </motion.div>
  );
}

export default Users;