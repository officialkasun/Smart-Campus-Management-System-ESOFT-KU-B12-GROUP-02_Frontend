import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import config from '../../../config';
import { motion } from 'framer-motion';
import {
  Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Chip, IconButton, Box, CircularProgress, Tooltip, TableSortLabel,
  Modal, Card, CardContent, Divider, Button, Avatar, TextField, InputAdornment,
  FormControl, InputLabel, MenuItem, Select, FormHelperText, Alert, LinearProgress, 
  List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Checkbox, ListItemIcon,
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import {
  Visibility as VisibilityIcon, Refresh as RefreshIcon, Event as EventIcon, 
  LocationOn as LocationIcon, Person as PersonIcon, Group as GroupIcon, 
  CalendarToday as CalendarIcon, Search as SearchIcon, Clear as ClearIcon, 
  Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, 
  PersonAdd as PersonAddIcon, PersonRemove as PersonRemoveIcon,
} from '@mui/icons-material';


// Define Event interface
interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  organizer: {
    _id: string;
    name: string;
    email: string;
  };
  attendees: {
    _id: string;
    name: string;
    email: string;
  }[];
  attendeesCount: number;
  createdAt: string;
}

// Define interfaces for event actions
interface NewEvent {
  title: string;
  description: string;
  date: string;
  location: string;
  organizer: string;
}

interface EditEvent extends NewEvent {}

// Define sorting order type
type Order = 'asc' | 'desc';

// Define sortable fields
type SortField = 'title' | 'date' | 'location' | 'organizer' | 'attendeesCount' | 'createdAt' | null;

};

export default Events;
