import { useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "../style/Header.css";
import headerLogo from "../style/img/home/headerLogo.png";
import ProfileMenu from "./ProfileMenu";

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate(); // 페이지 이동용 훅
  const { user, logout } = useContext(AuthContext);
  // const user = null; // 로그인 제거된 상태

  const handleLogoClick = () => {
    navigate("/"); //  "back to home"
  };
  const handleStartClick = () => {
    navigate("/login"); //  "시작하기"
  };

  return (
    <header className="header">
      <div className="header-left">
        <img
          src={headerLogo}
          alt="logo"
          className="header-logo"
          onClick={handleLogoClick}
        />
      </div>
      <div className="header-right">
        {user ? (
          <ProfileMenu
            username={user.nickName}
            userId={user.userId}
            userProfileImg={user.profImg}
            onLogout={logout}
          />
        ) : (
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="start-button" onClick={handleStartClick}>
              가입하기
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
