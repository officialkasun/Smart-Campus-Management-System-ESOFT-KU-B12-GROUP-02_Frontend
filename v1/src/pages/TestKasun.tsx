import { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import config from '../config';

function TestKasun() {
  const [users, setUsers] = useState<{ id: number; name: string }[]>([]);

  const fetchData = async () => {
    try {
      const token = Cookies.get('token'); // Get token from cookie
      const response = await axios.get(`${config.apiUrl}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div>
      <h2>Home Page</h2>
      <button onClick={fetchData}>Fetch Users</button>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}

<<<<<<< Updated upstream:v1/src/pages/TestKasun.tsx
export default TestKasun;
=======
export default Test;


>>>>>>> Stashed changes:v1/src/pages/Test.tsx
