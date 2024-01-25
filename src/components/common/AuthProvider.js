import { useLocalStorage } from "./useLocalStorage";
import React, { createContext } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode'
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useLocalStorage("user", null);

  const login = (username, password) => {
    const url = process.env.REACT_APP_RESTAI_API_URL || "";

    //if (Cookies.get('restai_token') !== undefined) {}

    var opts = {};
    var basicAuth = "";
    if (username !== undefined && password !== undefined) {
      basicAuth = btoa(username + ":" + password);
      opts = { "headers": new Headers({ 'Authorization': 'Basic ' + basicAuth }) }
    }

    fetch(url + "/users/" + username, opts)
      .then((res) => {
        if (res.status === 401) {
          setUser(null)
          return null;
        } else if (res.status === 200) {
          return res.json();
        } else {
          setUser(null)
          return null;
        }
      }).then((res) => {
        if (res !== null)
          if (Cookies.get('restai_token')) {
            setUser({ username: username, expires: 28800, created: Math.floor(Date.now() / 1000), admin: res.is_admin });
          } else {
            setUser({ username: username, basicAuth: basicAuth, expires: 28800, created: Math.floor(Date.now() / 1000), admin: res.is_admin });
          }
      })
  };
  const logout = () => {
    setUser(null)
    Cookies.remove('restai_token');
  };
  const checkAuth = () => {
    if (Cookies.get('restai_token') !== undefined && user == null) {
      const user = jwtDecode(Cookies.get('restai_token'));
      login(user.username);
      return false;
    } else if(Cookies.get('restai_token') === undefined && user.basicAuth === undefined) {
      logout();
      return false;
    }
    if (user !== null) {
      if (Math.floor(Date.now() / 1000) >= (user.created + user.expires)) {
        setUser(null);
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  };

  const getBasicAuth = () => {
    return user;
  };

  return (
    <AuthContext.Provider value={{ login, logout, checkAuth, getBasicAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;