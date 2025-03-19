import React, { useState, useEffect } from 'react';

const Events: React.FC = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const data = [
        { id: 1, title: 'Workshop on AI', date: '2023-11-01', location: 'Auditorium A' },
        { id: 2, title: 'Guest Lecture on Cloud Computing', date: '2023-11-05', location: 'Room 204' },
        { id: 3, title: 'Hackathon', date: '2023-11-10', location: 'Main Hall' },
      ];
      setEvents(data);
    };
    fetchEvents();
  }, []);

  return (
    <div>
      <h1>Upcoming Events</h1>
      <ul>
        {events.map((event) => (
          <li key={event.id}>
            <h2>{event.title}</h2>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Events;
