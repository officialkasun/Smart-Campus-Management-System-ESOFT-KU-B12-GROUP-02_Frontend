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
  