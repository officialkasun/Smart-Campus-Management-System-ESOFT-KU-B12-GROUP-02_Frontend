import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import config from '../../../config';
import { motion } from 'framer-motion';
import { 
  Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Chip, IconButton, Box, Modal, Card, CardContent, TextField, Divider,
  Avatar, CircularProgress, Alert, InputAdornment, Tooltip, TableSortLabel
} from '@mui/material';

import { 
  Visibility as VisibilityIcon, Person as PersonIcon, Email as EmailIcon, Badge as BadgeIcon,
  School as SchoolIcon, AccessTime as AccessTimeIcon, Search as SearchIcon, Clear as ClearIcon,
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
  