import { createContext, useEffect, useReducer } from "react";
import axios from "axios";
import { MatxLoading } from "app/components";
import Cookies from 'js-cookie';
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

    const response = await axios.get((process.env.REACT_APP_RESTAI_API_URL || "") + "/users/" + email, { headers: { "Authorization": "Basic " + basicAuth } });

    const user = response.data;

    if (Cookies.get('restai_token')) {
    } else {
      user.token = basicAuth;
    }

    if (user.is_admin === true) {
      user.role = "ADMIN";
    } else {
      user.role = "USER";
    }

    localStorage.setItem("user", JSON.stringify(user));

    dispatch({ type: "LOGIN", payload: { user } });
  };

  const checkAuth = async () => {
    var user;
    if (Cookies.get('restai_token') !== undefined) {
      user = jwtDecode(Cookies.get('restai_token'));
    } else {
      user = JSON.parse(localStorage.getItem("user"));
    }

    try {
      await axios.get((process.env.REACT_APP_RESTAI_API_URL || "") + "/users/" + user.username, { headers: { "Authorization": "Basic " + user.token } });
      Promise.resolve();
    } catch (err) {
      dispatch({ type: "LOGOUT" });
      Promise.reject();
    }
  };

  const logout = () => {
    localStorage.setItem("user", null);
    Cookies.remove('restai_token');
    dispatch({ type: "LOGOUT" });
  };

  useEffect(() => {
    (async () => {
      var user;
      if (Cookies.get('restai_token') !== undefined) {
        user = jwtDecode(Cookies.get('restai_token'));
      } else {
        user = JSON.parse(localStorage.getItem("user"));
      }

      if (user) {
        try {
          const response = await axios.get((process.env.REACT_APP_RESTAI_API_URL || "") + "/users/" + user.username, { headers: { "Authorization": "Basic " + user.token } });
          response.data.token = user.token;

          if (response.data.is_admin === true) {
            response.data.role = "ADMIN";
          } else {
            response.data.role = "USER";
          }

          dispatch({ type: "INIT", payload: { isAuthenticated: true, user: response.data } });
        } catch (err) {
          console.error(err);
          dispatch({ type: "INIT", payload: { isAuthenticated: false, user: null } });
        }
      } else {
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
