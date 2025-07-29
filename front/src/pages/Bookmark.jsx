import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "../style/Bookmark.css";
import React from "react";

export default function Bookmark() {
  const navigate = useNavigate();

  const goBack = () => navigate("/"); // back 버튼 -> 홈 이동

  return (
    <div className="mypage-container">
      <div className="back-button-wrapper">
        <button className="back-button" onClick={goBack}>
          🔙
        </button>
        
      </div>
    </div>
  );
}
