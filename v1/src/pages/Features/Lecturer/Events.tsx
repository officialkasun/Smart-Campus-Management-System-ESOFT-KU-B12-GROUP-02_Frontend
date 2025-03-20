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

const [events, setEvents] = useState<Event[]>([]);
const [loading, setLoading] = useState<boolean>(true);
const [error, setError] = useState<string | null>(null);
const [page, setPage] = useState<number>(0);
const [rowsPerPage, setRowsPerPage] = useState<number>(10);

const [sortOrder, setSortOrder] = useState<Order>('asc');
const [sortField, setSortField] = useState<SortField>('date');

const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
const [viewModalOpen, setViewModalOpen] = useState<boolean>(false);

const [searchQuery, setSearchQuery] = useState<string>('');
const [searchLoading, setSearchLoading] = useState<boolean>(false);
const [searchError, setSearchError] = useState<string | null>(null);
const [searchPerformed, setSearchPerformed] = useState<boolean>(false);

};

const filteredEvents = React.useMemo(() => {
  if (!searchQuery) return events;
  return events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.organizer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
}, [events, searchQuery]);

const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setSearchQuery(e.target.value);
};


<TextField
  fullWidth
  variant="outlined"
  placeholder="Search events by title, location, or organizer..."
  value={searchQuery}
  onChange={handleSearchChange}
  InputProps={{
    startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
    endAdornment: searchQuery && (
      <InputAdornment position="end">
        <IconButton onClick={() => setSearchQuery('')}>
          <ClearIcon />
        </IconButton>
      </InputAdornment>
    ),
  }}
/>

<Modal open={viewModalOpen} onClose={() => setViewModalOpen(false)}>
  <div className="bg-white p-6 rounded-md shadow-lg">
    {selectedEvent && (
      <Card>
        <CardContent>
          <Typography variant="h6">{selectedEvent.title}</Typography>
          <Typography variant="body2">Date: {new Date(selectedEvent.date).toLocaleDateString()}</Typography>
          <Typography variant="body2">Location: {selectedEvent.location}</Typography>
          <Typography variant="body2">Organizer: {selectedEvent.organizer.name}</Typography>
          <Button onClick={() => setViewModalOpen(false)}>Close</Button>
        </CardContent>
      </Card>
    )}
  </div>
</Modal>
};
export default Events;
