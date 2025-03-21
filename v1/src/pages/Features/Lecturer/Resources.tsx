import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import config from '../../../config';
import { motion } from 'framer-motion';
import {
  Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Chip, IconButton, Box, CircularProgress, Tooltip, TableSortLabel,
  Modal, Card, CardContent, Divider, Button, TextField, InputAdornment,
  FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Tabs, Tab,
  Badge, Alert,
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import {
  Visibility as VisibilityIcon, Refresh as RefreshIcon, Search as SearchIcon,
  Clear as ClearIcon, Inventory as InventoryIcon, Category as CategoryIcon,
  Check as CheckIcon, Room as RoomIcon, EventAvailable as EventAvailableIcon,
  Event as EventIcon, EventBusy as EventBusyIcon, Close as CloseIcon,
} from '@mui/icons-material';

// Define Resource interface
interface Resource {
  _id: string;
  name: string;
  type: string;
  availability: boolean;
  reservationDate: string | null;
  reservationExpiry: string | null;
  reservedBy: { _id: string; name: string; email: string } | string | null;
  createdAt: string;
  __v: number;
}

// Define sorting order type
type Order = 'asc' | 'desc';

// Define sortable fields
type SortField = 'name' | 'type' | 'createdAt' | null;

const Resources = () => {
  return (
    <div>Resources</div>
  )
}

export default Resources