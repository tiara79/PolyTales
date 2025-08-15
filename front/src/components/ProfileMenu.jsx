import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../style/ProfileMenu.css";

export default function ProfileMenu({ username, userid, userProfileImg, onLogout }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();

  // 바깥 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClick = (e) => {
      if (open && menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={menuRef} className="profile-menu-wrap">
      <div className="profile-btn" onClick={() => setOpen((v) => !v)}>
        <img
          src={userProfileImg || "/style/img/login/prof_img.png"}
          alt="profile-image"
          className="profile-img"
          onError={(e) => {
            e.target.src = "/style/img/home/header_logo.png";
          }}
        />
        <div className="profile-username">{`${username || "사용자"}님`}</div>
      </div>
      {open && (
        <div className="profile-dropdown">
          <button className="close-btn" onClick={() => setOpen(false)}>
            X
          </button>
          <img
            src={userProfileImg || "/style/img/login/prof_Img.png"}
            alt="profile-image"
            className="dropdown-profile-img"
            onError={(e) => {
              e.target.src = "/style/img/home/header_logo.png";
            }}
          />
          <div className="dropdown-greeting">
            안녕하세요, <b>{username}</b>님
          </div>
          <div className="button-container">
            <button
              className="mypage-btn"
              
              onClick={() => {
                navigate("/mypage");
                setOpen(false);
              }}
            >
              마이페이지
            </button>
            <button className="logout-btn" onClick={onLogout}>
              로그아웃
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
