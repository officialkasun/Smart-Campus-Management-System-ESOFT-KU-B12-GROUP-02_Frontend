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

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState<boolean>(false);
  
  const [sortOrder, setSortOrder] = useState<Order>('asc');
  const [sortField, setSortField] = useState<SortField>(null);
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState<boolean>(false);
  
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  const [searchType, setSearchType] = useState<'id' | 'name'>('id');
  

  const fetchUsers = async (showRefreshAnimation = false) => {
    if (showRefreshAnimation) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const response = await axios.get(`${config.apiUrl}/api/users/student`, {
        headers: { Authorization: `Bearer ${Cookies.get('token')}` }
      });
      setUsers(response.data);
      setError(null);
      setLastRefreshTime(new Date());
      if (showRefreshAnimation && searchPerformed) {
        setSearchPerformed(false);
        setSearchQuery('');
        setSearchError(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to collect student details.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, []);

};


const handleRequestSort = (field: SortField) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };
  
  const searchUserById = async () => {
    if (!searchQuery.trim()) return;
    
    setSearchLoading(true);
    setSearchError(null);
    setSearchPerformed(true);
    
    try {
      const response = await axios.get(`${config.apiUrl}/api/users/student/${searchQuery.trim()}`, {
        headers: { Authorization: `Bearer ${Cookies.get('token')}` }
      });
      setUsers(response.data ? [response.data] : []);
    } catch {
      setSearchError('Student not found with the provided ID');
      setUsers([]);
    } finally {
      setSearchLoading(false);
    }

  
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
        <IconButton onClick={handleClearSearch}>
          <ClearIcon />
        </IconButton>
      </InputAdornment>
    ),
  }}
/>
<Modal open={viewModalOpen} onClose={() => setViewModalOpen(false)}>
  <div className="bg-white w-full max-w-lg p-6 m-auto rounded-md shadow-lg">
    {selectedUser && (
      <Card>
        <CardContent>
          <Typography variant="h6">{selectedUser.name}</Typography>
          <Typography variant="body2">ID: {selectedUser.id}</Typography>
          <Typography variant="body2">Email: {selectedUser.email}</Typography>
          <Typography variant="body2">Courses Enrolled: {selectedUser.courses.length || 'None'}</Typography>
          <Button onClick={() => setViewModalOpen(false)}>Close</Button>
        </CardContent>
      </Card>
    )}
  </div>
</Modal>



};

export default Students;