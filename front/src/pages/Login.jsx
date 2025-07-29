import "../style/Login.css";
import logo from "../style/img/login/loginLogo.png";

// import googleIcon from "../style/img/login/google.png";
import naverIcon from "../style/img/login/naver.png";
import kakaoIcon from "../style/img/login/kakao.png";
import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Google Sign-In 콜백 함수 - 백엔드 연동 추가
  async function handleCredentialResponse(response) {
    try {
      // Google ID 토큰을 디코딩하여 사용자 정보를 얻습니다.
      const responsePayload = decodeJwtResponse(response.credential);
      console.log("Google 사용자 정보:", responsePayload);

      // 백엔드로 Google 로그인 데이터 전송
      const loginData = {
        oauthProvider: "google",
        oauthId: responsePayload.sub,
        email: responsePayload.email,
        nickName: responsePayload.name,
        profImg: responsePayload.picture,
      };

      // 백엔드 API 호출
      const apiResponse = await fetch("http://localhost:3000/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const result = await apiResponse.json();

      if (apiResponse.ok) {
        console.log("로그인 성공:", result);
        // 토큰을 localStorage에 저장
        //Authcontext의 login함수 사용
        login(result.user, result.token);
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));
        // 홈페이지로 리다이렉트
        navigate("/");
      } else {
        console.error("로그인 실패:", result);
        alert("로그인에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("Google 로그인 오류:", error);
      alert("로그인 중 오류가 발생했습니다.");
    }
  }

  // Google 아이콘 클릭 시 Google 로그인 실행
  const handleGoogleLogin = () => {
    if (window.google) {
      window.google.accounts.id.prompt();
    }
  };

  useEffect(() => {
    window.handleCredentialResponse = handleCredentialResponse; // 전역 등록
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id:
          "985549267807-mu62klcok2e4q3su4qbfqklmb0n5b990.apps.googleusercontent.com",
        callback: handleCredentialResponse,
      });
      // 공식 버튼 렌더링(모든 환경 지원/)
      window.google.accounts.id.renderButton(
        document.getElementById("googleSignInDiv"),
        { 
          type : "icon",
          theme: "outline", 
          shape: "circle",
          size: "large" }
      );
    }
  }, []);

  //로그아웃 (임시 작성)
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload();
  };

  // JWT 토큰 디코딩 함수 - 여기에 추가
  function decodeJwtResponse(token) {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  }

  return (
    <div className="login-page">
      <div>
        <img src={logo} alt="북극곰 Pola" className="login-logo" />
      </div>

      <div className="login-content">
        <p className="login-message">
          " 귀여운 북극곰 Pola와 함께
          <br />
          즐거운 다국어 여행을 떠나보세요! "
        </p>

        {/* 숨겨진 Google Sign-In 초기화 */}
        <div
          id="g_id_onload"
          data-client_id="985549267807-mu62klcok2e4q3su4qbfqklmb0n5b990.apps.googleusercontent.com"
          data-context="signin"
          data-ux_mode="popup"
          data-callback="handleCredentialResponse"
          data-auto_prompt="false"
          style={{ display: "none" }}
        ></div>

        <div className="social-login-buttons">
          <button className="social-btn" onClick={handleGoogleLogin}>
            {/* <img src={googleIcon} alt="구글 로그인" /> */}
          </button>
          
          <div id="googleSignInDiv"></div>
          <div className="g_id_signin" data-type="icon" data-shape="circle"></div>

         
        </div>
        {/* <div className="social-login-buttons">
          <button className="social-btn" onClick={handleGoogleLogin}>
            <img src={googleIcon} alt="구글 로그인" />
          </button>
          <button className="social-btn">
            <img src={naverIcon} alt="네이버 로그인" />
          </button>
          <button className="social-btn">
            <img src={kakaoIcon} alt="카카오 로그인" />
          </button>
        </div> */}
      </div>
    </div>
  );
}
