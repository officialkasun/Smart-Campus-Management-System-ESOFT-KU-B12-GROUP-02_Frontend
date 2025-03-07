import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie';

const ManageMe = () => {
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    // Try to get the user cookie using js-cookie library
    const userCookie = Cookies.get('user');
    
    if (userCookie) {
      try {
        const parsedUserData = JSON.parse(userCookie);
        setUserData(parsedUserData);
      } catch (error) {
        console.error('Error parsing user cookie:', error);
      }
    }
  }, []);

  return (
    <div>
      <h1>Home</h1>
      <div>
        {userData ? (
          <div>
            <h2>User Information from Cookie</h2>
            <pre>{JSON.stringify(userData, null, 2)}</pre>
          </div>
        ) : (
          <p>No user data found in cookies</p>
        )}
      </div>
    </div>
  )
}

export default ManageMe