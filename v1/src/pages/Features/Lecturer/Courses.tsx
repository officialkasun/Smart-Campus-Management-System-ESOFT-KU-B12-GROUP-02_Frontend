import React, { useEffect, useState, useRef } from 'react';
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
  Avatar,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  Alert,
  LinearProgress,
  SelectChangeEvent,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Link,
  Badge,
  Grid,
} from '@mui/material';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import {
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  School as SchoolIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  Code as CodeIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Upload as UploadIcon,
  AttachFile as AttachFileIcon,
  PictureAsPdf as PdfIcon,
  InsertDriveFile as DocIcon,
  Slideshow as PptIcon,
  Article as TxtIcon,
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
  lectureMaterials: string[]; // Array of material paths
  createdAt: string;
}

// New interface for creating a course
interface NewCourse {
  name: string;
  code: string;
  description: string;
  schedule: {
    day: string;
    startTime: string;
    endTime: string;
  };
  lectureMaterials?: string[]; // Optional since it will be handled by FormData
}

// New interface for editing a course
interface EditCourse {
  name: string;
  code: string;
  description: string;
  schedule: {
    day: string;
    startTime: string;
    endTime: string;
  };
  lectureMaterials?: string[]; // Optional since existing materials will be handled separately
}

// Define sorting order type
type Order = 'asc' | 'desc';

// Define sortable fields
type SortField = 'name' | 'code' | 'instructor' | 'createdAt' | null;

// Define days of week for dropdown
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];