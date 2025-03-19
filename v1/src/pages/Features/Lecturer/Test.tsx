//import React from 'react'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import config from '../../../config';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
//rafce
const Test = () => {
    const token = Cookies.get('token'); // Get token from cookie
    const testSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.get(`${config.apiUrl}/api/events`,  {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              });
                console.log('Test response:', response);
            }
            catch (error) {
              console.error('Test error:', error);
            }
        };

const testSubmitPost = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const response = await axios.post(`${config.apiUrl}/api/events`,  {
                title: 'Test Event',
                description: 'This is a test event',
                date: '2022-12-31',
                location: 'Test Location',
            }, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              });
                console.log('Test response:', response);
            }
            catch (error) {
              console.error('Test error:', error);
            }
        };


  return (
    <div className="flex flex-col items-center justify-center mt-[100px] w-full">
        <button onClick={testSubmit}>Test</button>
        <button onClick={testSubmitPost}>Test Create One Two Three</button>
    </div>
  )
}


export default Test;
