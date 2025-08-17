import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const UserProfile = () => {
  const { user } = useContext(AuthContext);

  return (
    <div>
      {user ? (
        <h1>안녕하세요, {user.nickname}님!</h1>
      ) : (
        <p>로그인 해주세요.</p>
      )}
    </div>
  );
};

export default UserProfile;