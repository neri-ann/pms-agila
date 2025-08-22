import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate(); 
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleSignIn = (user) => {
    setLoggedInUser(user);
    setIsAuthenticated(true);
  };

  useEffect(() => {
    console.log("User authenticated state:", isAuthenticated);
  }, [isAuthenticated]);

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setLoggedInUser(null);
    navigate("/loginpage");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loggedInUser, handleSignIn, handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
};