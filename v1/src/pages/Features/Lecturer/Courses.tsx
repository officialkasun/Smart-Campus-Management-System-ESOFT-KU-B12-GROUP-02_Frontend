import React, { useState, useEffect } from 'react';

const Courses: React.FC = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    // Simulate fetching courses data
    const fetchCourses = async () => {
      const data = [
        { id: 1, name: 'Introduction to AI', code: 'AI101', lecturer: 'Dr. Smith' },
        { id: 2, name: 'Cloud Computing Basics', code: 'CC102', lecturer: 'Prof. Johnson' },
        { id: 3, name: 'Advanced Algorithms', code: 'AA103', lecturer: 'Dr. Brown' },
      ];
      setCourses(data); // Setting the state with fetched data
    };
    fetchCourses(); // Calling the async function
  }, []);

  return (
    <div>
      <h1>Available Courses</h1>
    </div>
  );
};

export default Courses;
