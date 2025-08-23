import React, { createContext, useContext, useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate(); 
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for stored user data on initialization
  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    const storedAuth = localStorage.getItem('isAuthenticated');
    
    if (storedUser && storedAuth === 'true') {
      try {
        const userData = JSON.parse(storedUser);
        setLoggedInUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('isAuthenticated');
      }
    }
    setLoading(false);
  }, []);

  const handleSignIn = (user) => {
    console.log("User details:", user);
    setIsAuthenticated(true);
    setLoggedInUser(user);
    
    // Persist to localStorage
    localStorage.setItem('loggedInUser', JSON.stringify(user));
    localStorage.setItem('isAuthenticated', 'true');
    
    console.log("User authenticated state:", true);
    navigate("/loginpage");
  };

  const handleSignOut = () => {
    console.log("Signing out...");
    setIsAuthenticated(false);
    setLoggedInUser(null);
    
    // Clear localStorage
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('isAuthenticated');
    
    console.log("User authenticated state:", false);
    console.log("Logged-in user:", null);
    navigate("/loginpage");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loggedInUser, handleSignIn, handleSignOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
