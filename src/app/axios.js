

import axios from "axios";

// Switch between local and production easily
//const apiBaseUrl = "http://localhost:4001";
const apiBaseUrl = "https://kalash.app";

const  dataAxios = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: add interceptors for logging / auth tokens later
// dataAxios.interceptors.request.use(config => {
//   console.log("Request:", config);
//   return config;
// });

export default dataAxios;
