import { useLocation, useNavigate } from 'react-router-dom';
import '../style/Header.css';
import headerLogo from '../style/img/home/headerLogo.png';

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate(); // 페이지 이동용 훅
  const user = null; // 로그인 제거된 상태

  const handleStartClick = () => {
    navigate('/login'); //  "시작하기"
  };

  return (
    <header className="header">
      <div className="header-left">
        <img src={headerLogo} alt="logo" className="header-logo" />
      </div>
      <div className="header-right">
        {user ? (
          <button className="logout-button">로그아웃</button>
        ) : (
          <button className="start-button" onClick={handleStartClick}>
            가입하기
          </button>
        )}
      </div>
    </header>
  );
}
