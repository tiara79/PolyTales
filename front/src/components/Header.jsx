import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "../style/Header.css";
import headerLogo from "../style/img/home/headerLogo.png";
import ProfileMenu from "./ProfileMenu";

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  // 디버깅 로그 추가
  // console.log("Header rendering - user data received:", user);
  // console.log("Field-by-field check:");
  // console.log("- user.nickname:", user?.nickname);
  // console.log("- user.userid:", user?.userid);
  // console.log("- user.profimg:", user?.profimg);

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleStartClick = () => {
    navigate("/login");
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
            username={user.nickname}        
            userId={user.userid}             
            userProfileImg={user.profimg}   
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