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
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Room as RoomIcon,
  EventAvailable as EventAvailableIcon,
  EventBusy as EventBusyIcon,
  Add as AddIcon,
} from '@mui/icons-material';

// Define Resource interface based on actual API response
interface Resource {
  _id: string;
  name: string;
  type: string;
  availability: boolean;
  reservationDate: string | null;
  reservationExpiry: string | null;
  reservedBy: string | null;
  createdAt: string;
  __v: number;
}

// Define sorting order type
type Order = 'asc' | 'desc';

// Define sortable fields
type SortField = 'name' | 'type' | 'availability' | 'createdAt' | null;

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
  
  // State for filtering resources (all vs available)
  const [showOnlyAvailable, setShowOnlyAvailable] = useState<boolean>(false);

  // State for add resource modal
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [newResource, setNewResource] = useState({
    name: '',
    type: 'classroom',
  });

  // State for edit resource modal
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [editResource, setEditResource] = useState({
    _id: '',
    name: '',
    type: 'classroom',
  });

  // Add state for success messages
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Fetch resources function
  const fetchResources = async (showRefreshAnimation = false) => {
    if (showRefreshAnimation) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      let response;
      if (showOnlyAvailable) {
        response = await axios.get(`${config.apiUrl}/api/resources/${resourceLimit}/available`, {
          headers: {
            Authorization: `Bearer ${Cookies.get('token')}`,
          },
        });
      } else {
        response = await axios.get(`${config.apiUrl}/api/resources`, {
          headers: {
            Authorization: `Bearer ${Cookies.get('token')}`,
          },
        });
      }
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

  useEffect(() => {
    fetchResources();
  }, [showOnlyAvailable, resourceLimit]);

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

  // Function to handle editing a resource
  const handleEditResource = (resource: Resource) => {
    setEditResource({
      _id: resource._id,
      name: resource.name,
      type: resource.type,
    });
    setEditModalOpen(true);
  };

  // Handle input change for edit resource
  const handleEditResourceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setEditResource((prev) => ({ ...prev, [name]: value }));
  };

  // Handle edit resource submission
  const handleUpdateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateError(null);
    try {
      const response = await axios.put(`${config.apiUrl}/api/resources/${editResource._id}`, {
        name: editResource.name,
        type: editResource.type,
      }, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      });
      
      // Update resources array with the updated resource
      setResources(resources.map(resource => 
        resource._id === editResource._id ? response.data : resource
      ));
      
      // Show success message
      setSuccessMessage('Resource updated successfully!');
      
      // Clear any existing errors
      setError(null);
      setUpdateError(null);
      
      // Close modal after a short delay to show the success message
      setTimeout(() => {
        setEditModalOpen(false);
        setSuccessMessage(null);
      }, 1500);
    } catch (err: any) {
      console.error('Error updating resource:', err);
      setUpdateError(err.response?.data?.message || 'Failed to update resource.');
    }
  };

  // Handle refresh button click
  const handleRefresh = () => {
    fetchResources(true);
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
      const response = await axios.get(`${config.apiUrl}/api/resources/name/${searchQuery}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      });
      
      setResources(response.data);
      setSearchError(null);
      
      if (response.data.length === 0) {
        setSearchError('No resources match your search criteria.');
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

  // Toggle between all resources and available resources
  const handleToggleAvailability = () => {
    setShowOnlyAvailable(!showOnlyAvailable);
  };

  // Handle input change for new resource
  const handleNewResourceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setNewResource((prev) => ({ ...prev, [name]: value }));
  };

  // Handle add resource submission
  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateError(null);
    try {
      const response = await axios.post(`${config.apiUrl}/api/resources`, newResource, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      });
      setResources((prev) => [...prev, response.data]);
      
      // Show success message
      setSuccessMessage('Resource added successfully!');
      
      // Clear any existing errors
      setError(null);
      
      // Close modal after a short delay to show the success message
      setTimeout(() => {
        setAddModalOpen(false);
        setSuccessMessage(null);
        setNewResource({ name: '', type: 'classroom' });
      }, 1500);
    } catch (err: any) {
      console.error('Error adding resource:', err);
      setUpdateError(err.response?.data?.message || 'Failed to add resource.');
    }
  };

  // Get appropriate icon for resource type
  const getResourceTypeIcon = (type: string) => {
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
  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
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
              {searchPerformed ? 'Search Results' : 'All Resources'}
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
            
            <Button
              variant="outlined"
              color={showOnlyAvailable ? "success" : "primary"}
              onClick={handleToggleAvailability}
              startIcon={showOnlyAvailable ? <CheckIcon /> : <InventoryIcon />}
            >
              {showOnlyAvailable ? "Available Only" : "All Resources"}
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

        <Box display="flex" justifyContent="flex-end" mb={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setAddModalOpen(true)}
            startIcon={<AddIcon />}
          >
            Add Resource
          </Button>
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
                      active={sortField === 'availability'}
                      direction={sortField === 'availability' ? sortOrder : 'asc'}
                      onClick={() => handleRequestSort('availability')}
                    >
                      Availability
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
                        backgroundColor: resource.availability ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                        '&:hover': {
                          backgroundColor: resource.availability ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 152, 0, 0.2)',
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
                        <Chip
                          label={resource.availability ? "Available" : "Reserved"}
                          size="small"
                          color={resource.availability ? "success" : "error"}
                          icon={resource.availability ? <EventAvailableIcon /> : <EventBusyIcon />}
                        />
                      </TableCell>
                      <TableCell>
                        <span className='dark:text-white text-black'>
                          {formatDate(resource.createdAt).split(',')[0]}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Box display="flex">
                          <Tooltip title="View Details">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleViewResource(resource)}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Resource">
                            <IconButton 
                              size="small" 
                              color="secondary"
                              onClick={() => handleEditResource(resource)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Resource">
                            <IconButton 
                              size="small" 
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                {filteredResources.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" className="py-8">
                      <Typography variant="body1" color="textSecondary">
                        No resources found
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
                    bgcolor: selectedResource.availability ? 'success.main' : 'error.main' 
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
                      label={selectedResource.availability ? 'Available' : 'Reserved'}
                      color={selectedResource.availability ? 'success' : 'error'}
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
                  
                  {!selectedResource.availability && (
                    <>
                      <div className="flex items-center">
                        <EventBusyIcon className="text-red-600 mr-3" />
                        <div>
                          <Typography variant="body2" color="primary">
                            Reserved Since
                          </Typography>
                          <Typography variant="body1">
                            {formatDate(selectedResource.reservationDate)}
                          </Typography>
                        </div>
                      </div>
                      
                      {selectedResource.reservationExpiry && (
                        <div className="flex items-center">
                          <EventAvailableIcon className="text-green-600 mr-3" />
                          <div>
                            <Typography variant="body2" color="primary">
                              Reservation Expires
                            </Typography>
                            <Typography variant="body1">
                              {formatDate(selectedResource.reservationExpiry)}
                            </Typography>
                          </div>
                        </div>
                      )}
                      
                      {selectedResource.reservedBy && (
                        <div className="flex items-start">
                          <div>
                            <Typography variant="body2" color="primary">
                              Reserved By
                            </Typography>
                            <Typography variant="body1">
                              {selectedResource.reservedBy}
                            </Typography>
                          </div>
                        </div>
                      )}
                    </>
                  )}

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

      {/* Add Resource Modal */}
      <Modal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        aria-labelledby="add-resource-modal"
      >
        <div className="bg-white dark:bg-gray-800 w-full max-w-lg p-6 m-auto rounded-md shadow-lg absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Typography variant="h6" className="font-bold mb-4">
            Add New Resource
          </Typography>
          
          {successMessage && (
            <Box sx={{ mb: 2, p: 1, bgcolor: 'success.light', borderRadius: 1 }}>
              <Typography color="success.contrastText">{successMessage}</Typography>
            </Box>
          )}
          
          {updateError && (
            <Box sx={{ mb: 2, p: 1, bgcolor: 'error.light', borderRadius: 1 }}>
              <Typography color="error.contrastText">{updateError}</Typography>
            </Box>
          )}
          
          <form onSubmit={handleAddResource}>
            <TextField
              fullWidth
              label="Resource Name"
              name="name"
              value={newResource.name}
              onChange={handleNewResourceChange}
              variant="outlined"
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="resource-type-label">Type</InputLabel>
              <Select
                labelId="resource-type-label"
                id="resource-type"
                name="type"
                value={newResource.type}
                onChange={handleNewResourceChange}
                required
              >
                <MenuItem value="classroom">Classroom</MenuItem>
                <MenuItem value="equipment">Equipment</MenuItem>
                <MenuItem value="lab">Lab</MenuItem>
              </Select>
            </FormControl>
            <Box mt={2} display="flex" justifyContent="flex-end">
              <Button 
                onClick={() => {
                  setAddModalOpen(false);
                  setUpdateError(null);
                  setSuccessMessage(null);
                }} 
                variant="outlined" 
                color="secondary" 
                sx={{ mr: 2 }}
                disabled={!!successMessage}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={!!successMessage}
              >
                Add
              </Button>
            </Box>
          </form>
        </div>
      </Modal>

      {/* Edit Resource Modal */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        aria-labelledby="edit-resource-modal"
      >
        <div className="bg-white dark:bg-gray-800 w-full max-w-lg p-6 m-auto rounded-md shadow-lg absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Typography variant="h6" className="font-bold mb-4">
            Edit Resource
          </Typography>
          
          {successMessage && (
            <Box sx={{ mb: 2, p: 1, bgcolor: 'success.light', borderRadius: 1 }}>
              <Typography color="success.contrastText">{successMessage}</Typography>
            </Box>
          )}
          
          {updateError && (
            <Box sx={{ mb: 2, p: 1, bgcolor: 'error.light', borderRadius: 1 }}>
              <Typography color="error.contrastText">{updateError}</Typography>
            </Box>
          )}
          
          <form onSubmit={handleUpdateResource}>
            <TextField
              fullWidth
              label="Resource Name"
              name="name"s
              value={editResource.name}
              onChange={handleEditResourceChange}
              variant="outlined"
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="edit-resource-type-label">Type</InputLabel>
              <Select
                labelId="edit-resource-type-label"
                id="edit-resource-type"
                name="type"
                value={editResource.type}
                onChange={handleEditResourceChange}
                required
              >
                <MenuItem value="classroom">Classroom</MenuItem>
                <MenuItem value="equipment">Equipment</MenuItem>
                <MenuItem value="lab">Lab</MenuItem>
              </Select>
            </FormControl>
            <Box mt={2} display="flex" justifyContent="flex-end">
              <Button 
                onClick={() => {
                  setEditModalOpen(false);
                  setUpdateError(null);
                  setSuccessMessage(null);
                }} 
                variant="outlined" 
                color="secondary" 
                sx={{ mr: 2 }}
                disabled={!!successMessage}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={!!successMessage}
              >
                Update
              </Button>
            </Box>
          </form>
        </div>
      </Modal>
    </motion.div>
  );
};

export default Resources;