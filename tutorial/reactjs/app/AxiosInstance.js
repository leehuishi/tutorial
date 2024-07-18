// axiosInstance.js

import Axios from 'axios'
import Cookies from 'js-cookie';

// Create an Axios instance
const Axiosinstance = Axios.create({
  baseURL: 'http://localhost:8080', // Replace with your API base URL
});

// Add a request interceptor
Axiosinstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get('jwtToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor
Axiosinstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401) {
      // Handle unauthorized access or refresh token here
      console.log(error)
    }
    return Promise.reject(error);
  }
);

export default Axiosinstance;
