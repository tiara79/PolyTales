import { useNavigate } from "react-router-dom";
import "../style/Bookmark.css";

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
