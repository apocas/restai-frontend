import { createContext, useEffect, useReducer } from "react";
import axios from "axios";
import { MatxLoading } from "app/components";
import { jwtDecode } from 'jwt-decode'

const initialState = {
  user: null,
  isInitialized: false,
  isAuthenticated: false
};

const reducer = (state, action) => {
  switch (action.type) {
    case "INIT": {
      const { isAuthenticated, user } = action.payload;
      return { ...state, isAuthenticated, isInitialized: true, user };
    }

    case "LOGIN": {
      return { ...state, isAuthenticated: true, user: action.payload.user };
    }

    case "LOGOUT": {
      return { ...state, isAuthenticated: false, user: null };
    }

    default:
      return state;
  }
};

const AuthContext = createContext({
  ...initialState,
  method: "JWT",
  login: () => { },
  checkAuth: () => { },
  logout: () => { }
});

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const login = async (email, password) => {
    var basicAuth = "";
    if (email !== undefined && password !== undefined) {
      basicAuth = btoa(email + ":" + password);
    }

    const response = await axios.get(
      (process.env.REACT_APP_RESTAI_API_URL || "") + "/users/" + email, 
      { 
        headers: { "Authorization": "Basic " + basicAuth },
        withCredentials: true // Enable sending cookies
      }
    );

    const user = response.data;
    user.token = basicAuth;

    if (user.is_admin === true) {
      user.role = "ADMIN";
    } else {
      user.role = "USER";
    }

    localStorage.setItem("user", JSON.stringify(user));
    dispatch({ type: "LOGIN", payload: { user } });
  };

  const checkAuth = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        throw new Error('No user data found');
      }

      await axios.get(
        (process.env.REACT_APP_RESTAI_API_URL || "") + "/users/" + user.username, 
        { 
          headers: { "Authorization": "Basic " + user.token },
          withCredentials: true
        }
      );
      Promise.resolve();
    } catch (err) {
      dispatch({ type: "LOGOUT" });
      Promise.reject();
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    // The backend will handle clearing the HTTP-only cookie
    axios.post(
      (process.env.REACT_APP_RESTAI_API_URL || "") + "/logout",
      {},
      { withCredentials: true }
    ).catch(console.error);
    dispatch({ type: "LOGOUT" });
  };

  useEffect(() => {
    (async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) {
          dispatch({ type: "INIT", payload: { isAuthenticated: false, user: null } });
          return;
        }

        const response = await axios.get(
          (process.env.REACT_APP_RESTAI_API_URL || "") + "/users/" + user.username,
          { 
            headers: { "Authorization": "Basic " + user.token },
            withCredentials: true
          }
        );

        const userData = response.data;
        userData.token = user.token;

        if (userData.is_admin === true) {
          userData.role = "ADMIN";
        } else {
          userData.role = "USER";
        }

        dispatch({ type: "INIT", payload: { isAuthenticated: true, user: userData } });
      } catch (err) {
        console.error(err);
        dispatch({ type: "INIT", payload: { isAuthenticated: false, user: null } });
      }
    })();
  }, []);

  if (!state.isInitialized) return <MatxLoading />;

  return (
    <AuthContext.Provider value={{ ...state, method: "JWT", login, checkAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
