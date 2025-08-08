import "../style/Login.css";
import logo from "../style/img/login/loginLogo.png";
import { useContext, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // JWT 토큰 디코딩 함수
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

  // Google Sign-In 콜백 함수
  const handleCredentialResponse = useCallback(async (response) => {
    try {
      // console.log(" Google 원본 응답:", response);
      
      // Google ID 토큰 디코딩
      const responsePayload = decodeJwtResponse(response.credential);
      // console.log(" 디코딩된 Google 사용자 정보:", responsePayload);

      // 필드별 상세 정보 확인
      // console.log(" 필드별 상세 정보:");
      // console.log("- sub (ID):", responsePayload.sub, "타입:", typeof responsePayload.sub);
      // console.log("- email:", responsePayload.email, "타입:", typeof responsePayload.email);
      // console.log("- name:", responsePayload.name, "타입:", typeof responsePayload.name);
      // console.log("- picture:", responsePayload.picture, "타입:", typeof responsePayload.picture);

      // Backend로 전송할 데이터 준비
      const loginData = {
        oauthprovider: "google",
        oauthid: String(responsePayload.sub),
        email: responsePayload.email,
        nickname: responsePayload.name || "구글사용자",
        profimg: responsePayload.picture || null,
      };

      // console.log(" Backend로 전송할 최종 데이터:", loginData);
      // console.log(" JSON 직렬화 테스트:", JSON.stringify(loginData, null, 2));

      // Backend API 호출
      const apiResponse = await fetch("http://localhost:3000/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      // console.log(" API 응답 상태:", apiResponse.status);
      
      const result = await apiResponse.json();

      if (apiResponse.ok) {
        console.log(" 로그인 성공!");
        
        // AuthContext로 전달할 데이터 확인
        // console.log(" AuthContext로 전달할 데이터:", {
        //   user: result.user,
        //   token: result.token
        // });
        
        // AuthContext login 호출
        login(result.user, result.token);
        
        // localStorage 저장
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));
        
        // console.log(" localStorage 저장된 user:", JSON.parse(localStorage.getItem("user")));
        
        // 홈페이지로 이동
        navigate("/");
      } else {
        // console.error(" 로그인 실패:", result.message);
        alert(`로그인 실패: ${result.message}`);
      }
    } catch (error) {
      // console.error(" Google 로그인 처리 오류:", error);
      alert("로그인 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  }, [login, navigate]);

  // Google Sign-In 초기화
  useEffect(() => {
    // 전역 콜백 함수 등록
    window.handleCredentialResponse = handleCredentialResponse;
    
    if (window.google) {
      // Google Sign-In 초기화
      window.google.accounts.id.initialize({
        client_id: "985549267807-mu62klcok2e4q3su4qbfqklmb0n5b990.apps.googleusercontent.com",
        callback: handleCredentialResponse,
      });
      
      // Google 버튼 렌더링
      window.google.accounts.id.renderButton(
        document.getElementById("googleSignInDiv"),
        { 
          type: "icon",
          theme: "outline", 
          shape: "circle",
          size: "large" 
        }
      );
    }
  }, [handleCredentialResponse]);

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
          {/* Google Sign-In 공식 버튼 */}
          <div id="googleSignInDiv"></div>
  
        </div>
      </div>
    </div>
  );
}