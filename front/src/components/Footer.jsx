import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import admin from "../style/img/footer/admin.png";
import "../style/Footer.css";

export default function Footer() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // 관리자 페이지로 이동
  const handleAdminClick = () => {
    navigate("/admhome");
  };

  return (
    <footer className="footer">
      <div className="footer-center">
        <span className="copyright">© 2025 PolyTales. All rights reserved</span>
        <span className="divider">|</span>
        <span className="policy-link" onClick={() => window.open("https://www.notion.so/PolyTales-2477f78f7b7180beb12fc9a722e95a43?source=copy_link")}>
          서비스 약관
        </span>
      </div>
      <div className="footer-right">
        {console.log("user.role:", user?.role)}
        {/* 관리자만 admin 버튼 보이게 */}
       {user?.role === 1 || user?.role === "1" ? (
          <img src={admin} alt="Admin" className="admin-icon" onClick={handleAdminClick} />
        ) : null}
      </div>
    </footer>
  );
}