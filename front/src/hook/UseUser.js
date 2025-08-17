import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const UseUser = () => {
  const { user, login, logout } = useContext(AuthContext);

  const setUser = (userData, token) => {
    login(userData, token);
  };

  return {
    user,
    setUser,
    logout,
  };
};

export default UseUser;