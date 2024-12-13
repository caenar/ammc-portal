import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { isTokenExpired } from "utils/authUtils";

import { getApiUrl } from "utils/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
   const [user, setUser] = useState(() => {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
   });
   const [token, setToken] = useState(localStorage.getItem("token") || null);

   useEffect(() => {
      if (token) {
         if (isTokenExpired(token)) {
            logout();
         } else {
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            const tokenExpirationTime =
               JSON.parse(atob(token.split(".")[1])).exp * 1000 - Date.now();

            const logoutTimer = setTimeout(() => {
               logout();
               alert("Session expired. Please login again.")
            }, tokenExpirationTime);

            return() => clearTimeout(logoutTimer)
         }
      } else {
         setUser(null);
      }
   }, [token]);

   const login = async (userId, password) => {
      try {
         const url = getApiUrl();
         const response = await axios.post(`${url}/auth/login`, {
            userId,
            password,
         });
         const { token, role } = response.data;
         const user = { userId, role };

         setUser(user);
         setToken(token);
         localStorage.setItem("token", token);
         localStorage.setItem("user", JSON.stringify(user));
         axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

         return user;
      } catch (error) {
         console.error("Login failed", error);
         throw error;
      }
   };

   const logout = () => {
      setUser(null);
      setToken(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      delete axios.defaults.headers.common["Authorization"];
   };

   const value = {
      user,
      token,
      login,
      logout,
      isAuthenticated: !!token,
   };

   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
