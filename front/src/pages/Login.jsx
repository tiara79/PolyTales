import '../style/Login.css';
import logo from '../style/img/login/loginLogo.png';
import googleIcon from '../style/img/login/google.png';
import naverIcon from '../style/img/login/naver.png';
import kakaoIcon from '../style/img/login/kakao.png';
import React from 'react';

export default function Login() {
  return (
    <div className="login-page">
      <div>
        <img src={logo} alt="북극곰 Pola" className="login-logo" />
      </div>

      <div className="login-content">
        <p className="login-message">
          " 귀여운 북극곰 Pola와 함께<br />즐거운 다국어 여행을 떠나보세요! "
        </p>
        <div className="social-login-buttons">
          <button className="social-btn">
            <img src={googleIcon} alt="구글 로그인" />
          </button>
          <button className="social-btn">
            <img src={naverIcon} alt="네이버 로그인" />
          </button>
          <button className="social-btn">
            <img src={kakaoIcon} alt="카카오 로그인" />
          </button>
        </div>
      </div>
    </div>
  );
}
