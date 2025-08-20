import { useNavigate } from "react-router-dom";

import "../style/Footer.css";

export default function Footer() {
  // useNavigate는 함수 컴포넌트 내부에서만 호출해야 합니다.
  const navigate = useNavigate();

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
        <img  
          src="/img/footer/admin.png" 
          alt="Admin" 
          className="admin-icon" 
          onClick={() => navigate("/admhome")}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/img/footer/admin.png";
          }}
        />
      </div>
    </footer>
  );
}