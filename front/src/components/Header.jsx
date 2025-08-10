import { useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import headerLogo from "../style/img/home/headerLogo.png";
import adminLogo from "../style/img/admin/adminLogo.PNG";
import ProfileMenu from "./ProfileMenu";
import "../style/Header.css";

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const isAdminPage = pathname.startsWith('/admin');
  const logoSrc = isAdminPage ? adminLogo : headerLogo;

  const handleLogoClick = () => navigate("/");
  const handleStartClick = () => navigate("/login");
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="header">
      <div className="header-left">
        <img
          src={logoSrc}
          alt="logo"
          className="header-logo"
          onClick={handleLogoClick}
        />
      </div>
      <div className="header-right">
        {user ? (
          <ProfileMenu
            username={user.nickname || user.username}
            userId={user.userid}
            userProfileImg={user.profimg}
            onLogout={handleLogout}
          />
        ) : (
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="start-button" onClick={handleStartClick}>
              시작하기
            </button>
          </div>
        )}
      </div>
    </header>
  );
}