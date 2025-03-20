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

};

export default Events;
