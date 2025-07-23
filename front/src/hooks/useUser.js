import { useDispatch, useSelector } from 'react-redux';

const useUser = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);

  const setUser = (userData) => {
    dispatch({ type: 'SET_USER', payload: userData });
  };

  return {
    user,
    setUser,
  };
};

export default useUser;
