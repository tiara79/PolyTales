
import { useSelector } from "react-redux";  // Redux의 상태를 읽기 위한 훅

const UserProfile = () => {
  // Redux 상태에서 로그인된 사용자 정보 가져오기
  const user = useSelector((state) => state.user);

  return (
    <div>
      {user ? (
        <h1>안녕하세요, {user.name}님!</h1>  // 로그인된 사용자 이름 표시
      ) : (
        <p>로그인 해주세요.</p>  // 로그인되지 않은 경우 메시지
      )}
    </div>
  );
};

export default UserProfile;
