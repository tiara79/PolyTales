import { Link, useLocation } from 'react-router-dom';
import '../../style/Header.css';
import headerLogo from '../../style/img/headerLogo.png'; // 경로에 맞게 조정 필요

export default function Header() {
  const { pathname } = useLocation();
  const user = null; // 로그인 제거된 상태

  return (
    <header className="header">
      <div className="header-left">
        <img src={headerLogo} alt="logo" className="header-logo" />

      </div>
      <div className="header-right">
        {user ? (
          <button className="logout-button">로그아웃</button>
        ) : (
          <button className="start-button">시작하기</button>
        )}
      </div>
    </header>
  );
}
