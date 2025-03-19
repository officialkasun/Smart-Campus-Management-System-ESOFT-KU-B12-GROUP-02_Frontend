import React, { useState, useEffect } from 'react';

const Courses: React.FC = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      const data = [
        { id: 1, name: 'Introduction to AI', code: 'AI101', lecturer: 'Dr. Smith' },
        { id: 2, name: 'Cloud Computing Basics', code: 'CC102', lecturer: 'Prof. Johnson' },
        { id: 3, name: 'Advanced Algorithms', code: 'AA103', lecturer: 'Dr. Brown' },
      ];
      setCourses(data);
    };
    fetchCourses();
  }, []);

  return (
    <div>
      <h1>Available Courses</h1>
      <ul>
        {courses.map((course) => (
          <li key={course.id}>
            <h2>{course.name}</h2>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Courses;
