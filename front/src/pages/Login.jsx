import { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { AuthContext } from "../context/AuthContext";

import axios from "../api/axios";
import JoinModal from "./JoinModal";
import SignupForm from "./SignupForm";
import "../style/Login.css";





export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // 모달 상태 관리
  const [modalOpen, setModalOpen] = useState(false);

  // 일반 로그인 폼 상태
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({});

  // 에러 메시지
  const usernameError =
    touched.username && !username ? "아이디를 입력하세요." : "";
  const passwordError =
    touched.password && !password ? "비밀번호를 입력하세요." : "";

  // 일반 회원가입
  const handleSignup = async (formData) => {
    try {
      await axios.post("/auth/register", formData);
      // const response = await axios.post("/auth/register", formData);
      toast.success("회원가입이 완료되었습니다!");

      // 회원가입 성공 후 자동 로그인
      try {
        const loginResponse = await axios.post("/auth/login", {
          username: formData.username,
          password: formData.password,
        });

        if (loginResponse.data.token) {
          login(loginResponse.data.user, loginResponse.data.token);
          navigate("/");
        }
      } catch (loginError) {
        // 자동 로그인이 실패해도 회원가입은 성공했으므로 모달만 닫기
      }

      setModalOpen(false);
    } catch (error) {
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        "회원가입에 실패했습니다.";
      toast.error(errorMessage);
    }
  };

  // 일반 로그인
  const handleLogin = async (e) => {
    e.preventDefault();
    setTouched({ username: true, password: true });

    if (!username || !password) return;

    try {
      const response = await axios.post("/auth/login", {
        username,
        password,
      });

      login(response.data.user, response.data.token);
      toast.success("로그인이 완료되었습니다!");
      navigate("/");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "로그인에 실패했습니다.";
      toast.error(errorMessage);
    }
  };

  // Google 로그인
const handleCredentialResponse = useCallback(async (response) => {
  try {
    const responsePayload = decodeJwtResponse(response.credential);

    const loginData = {
      oauthProvider: "google",
      oauthId: responsePayload.sub,
      email: responsePayload.email,
      nickName: responsePayload.name,
      profImg: responsePayload.picture,
    };

    const apiResponse = await axios.post("/auth/google", loginData);

    login(apiResponse.data.user, apiResponse.data.token);
    navigate("/");
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "로그인 중 오류가 발생했습니다.";
    toast.error(errorMessage);
  }
}, [login, navigate]);

  // Google 아이콘 클릭 시 Google 로그인 실행
  const handleGoogleLogin = () => {
    if (window.google) {
      window.google.accounts.id.prompt();
    }
  };

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

  // Google Sign-In 초기화
  useEffect(() => {
    window.handleCredentialResponse = handleCredentialResponse;
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id:
          "985549267807-mu62klcok2e4q3su4qbfqklmb0n5b990.apps.googleusercontent.com",
        callback: handleCredentialResponse,
      });
      window.google.accounts.id.renderButton(
        document.getElementById("googleSignInDiv"),
        { type: "icon", theme: "outline", shape: "circle", size: "large" }
      );
    }
  }, [handleCredentialResponse]);

  return (
    <div className="login-page">
      <div>
        <img src="/img/login/login_logo.png" alt="북극곰 Pola" className="login-logo" />
      </div>
      <div className="login-content">
        <p className="login-message">
          "귀여운 북극곰 Pola와 함께
          <br />
          즐거운 다국어 여행을 떠나보세요! "
        </p>
        <form className="login-form" onSubmit={handleLogin}>
          <div className="input-container">
            <div className="input-wrap">
              <div className="input-context">
                <input
                  type="text"
                  placeholder="아이디"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, username: true }))}
                  autoComplete="username"
                />
                {usernameError && <div className="errMsg">{usernameError}</div>}
              </div>
              <div className="input-context">
                <input
                  type="password"
                  placeholder="비밀번호"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  autoComplete="current-password"
                />
                {passwordError && <div className="errMsg">{passwordError}</div>}
              </div>
            </div>
          </div>
          <button type="submit">로그인</button>
        </form>
        <div className="signup-section">
          <p className="signup-text">계정이 없으신가요? 지금 가입해보세요</p>
          <button className="signup-btn" onClick={() => setModalOpen(true)}>
            회원가입
          </button>
        </div>
        <div className="social-login-section">
          <div className="social-login-buttons">
            <button
              className="social-btn google-btn"
              onClick={handleGoogleLogin}
            >
              <img src="/img/login/google.png" alt="구글 로그인" />
            </button>
          </div>
        </div>
        {modalOpen && (
          <JoinModal onClose={() => setModalOpen(false)}>
            <SignupForm onSubmit={handleSignup} />
          </JoinModal>
        )}
        <div
          id="g_id_onload"
          data-client_id="985549267807-mu62klcok2e4q3su4qbfqklmb0n5b990.apps.googleusercontent.com"
          data-context="signin"
          data-ux_mode="popup"
          data-callback="handleCredentialResponse"
          data-auto_prompt="false"
          style={{ display: "none" }}
        ></div>
        <div id="googleSignInDiv" style={{ display: "none" }}></div>
      </div>
    </div>
  );
}