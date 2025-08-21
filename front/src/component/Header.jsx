import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import ProfileMenu from "./ProfileMenu";

import "../style/Header.css";

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogoClick = () => navigate("/");
  const handleStartClick = () => navigate("/login");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="header">
      <img
        src="/img/home/header_logo.png"
        alt="PolyTales Logo"
        className="header-logo"
        onClick={handleLogoClick}
      />

      <div className="header-right">
        {user ? (
          <ProfileMenu
            username={user.nickname || user.username}
            userId={user.userid}
            profimg={user.profimg}
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
