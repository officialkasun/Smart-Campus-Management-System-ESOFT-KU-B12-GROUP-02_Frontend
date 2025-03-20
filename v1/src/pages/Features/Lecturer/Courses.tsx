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

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // New state for sorting
  const [sortOrder, setSortOrder] = useState<Order>('asc');
  const [sortField, setSortField] = useState<SortField>(null);

  // New state for viewing course details
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState<boolean>(false);

  // New state for creating courses
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [newCourse, setNewCourse] = useState<NewCourse>({
    name: '',
    code: '',
    description: '',
    schedule: {
      day: 'Monday',
      startTime: '',
      endTime: '',
    },
  });
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    code?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
  }>({});
  const [createLoading, setCreateLoading] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<boolean>(false);
  
  // State for delete confirmation
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<boolean>(false);

  // New state for editing courses
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);
  const [editCourse, setEditCourse] = useState<EditCourse>({
    name: '',
    code: '',
    description: '',
    schedule: {
      day: 'Monday',
      startTime: '',
      endTime: '',
    },
  });
  const [editValidationErrors, setEditValidationErrors] = useState<{
    name?: string;
    code?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
  }>({});
  const [editLoading, setEditLoading] = useState<boolean>(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<boolean>(false);

  // New state for search functionality
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState<boolean>(false);
  const [searchType, setSearchType] = useState<'code' | 'name'>('code');
  
  // New state for tracking last refresh time
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // New state for file uploads
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for edit form file uploads
  const [editUploadedFiles, setEditUploadedFiles] = useState<File[]>([]);
  const [editUploadError, setEditUploadError] = useState<string | null>(null);
  const [removedMaterials, setRemovedMaterials] = useState<string[]>([]);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const fetchCourses = async (showRefreshAnimation = false) => {
    if (showRefreshAnimation) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const response = await axios.get(`${config.apiUrl}/api/courses/lecturer`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      });
      setCourses(response.data);
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
      console.error('Error fetching courses:', err);
      setError(err.response?.data?.message || 'Failed to fetch courses.');
    } finally {
      if (showRefreshAnimation) {
        setTimeout(() => setRefreshing(false), 500); // Show refresh animation for at least 500ms
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

};
  export default Courses;