import { useCallback, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import axios, { API_URL } from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import "../style/Login.css";
import JoinModal from "./JoinModal";
import SignUpForm from "./SignUpForm";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // 상태 관리
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 디버그: API URL 확인
  useEffect(() => {
    console.log("Current API_URL:", API_URL);
  }, []);

  // 카카오 로그인
  const KAKAO_JS_KEY = process.env.REACT_APP_KAKAO_JS_KEY;
  function loadKakaoSdk() {
    console.log("[KAKAO DEBUG] JS KEY:", KAKAO_JS_KEY);
    console.log(
      "[KAKAO DEBUG] window.location.origin:",
      window.location.origin
    );
    if (!window.Kakao && KAKAO_JS_KEY) {
      if (!document.getElementById("kakao-sdk")) {
        const script = document.createElement("script");
        script.id = "kakao-sdk";
        script.src = "https://developers.kakao.com/sdk/js/kakao.js";
        script.onload = () => {
          console.log("[KAKAO DEBUG] kakao.js loaded");
          if (window.Kakao && !window.Kakao.isInitialized()) {
            window.Kakao.init(KAKAO_JS_KEY);
            console.log("[KAKAO DEBUG] Kakao.init called");
          }
        };
        document.body.appendChild(script);
      }
    } else if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(KAKAO_JS_KEY);
      console.log("[KAKAO DEBUG] Kakao.init called (already loaded)");
    } else if (window.Kakao && window.Kakao.isInitialized()) {
      console.log("[KAKAO DEBUG] Kakao SDK already initialized");
    }
  }

  useEffect(() => {
    loadKakaoSdk();
    // eslint-disable-next-line
  }, []);

  const handleKakaoLogin = () => {
    if (!window.Kakao) {
      setError("카카오 SDK 로드 실패");
      console.error("[KAKAO DEBUG] window.Kakao is undefined");
      return;
    }
    
    setLoading(true);
    setError('');
    
    console.log("[KAKAO DEBUG] Kakao SDK version:", window.Kakao.VERSION);
    window.Kakao.Auth.login({
      scope: "profile_nickname,profile_image",
      success: async function (authObj) {
        try {
          console.log("[KAKAO DEBUG] Auth success", authObj);
          const access_token = authObj.access_token;
          
          const res = await axios.post(
            "/auth/kakao",
            { access_token },
            { headers: { Authorization: undefined } }
          );
          
          console.log("[KAKAO DEBUG] Backend /auth/kakao response", res);
          if (res.data && res.data.token) {
            await login(res.data.user, res.data.token);
            navigate("/");
          } else {
            setError("카카오 로그인 실패");
          }
        } catch (e) {
          console.error("[KAKAO DEBUG] Backend /auth/kakao error", e);
          setError(
            "카카오 로그인 실패: " + (e.response?.data?.message || e.message)
          );
        } finally {
          setLoading(false);
        }
      },
      fail: function (err) {
        console.error("[KAKAO DEBUG] Auth fail", err);
        setError("카카오 인증 실패: " + JSON.stringify(err));
        setLoading(false);
      },
    });
  };

  // 네이버 콜백 처리 함수
  const handleNaverCallback = async (code, state) => {
    try {
      const response = await axios.post('/auth/naver', { code, state });
      
      if (response.data.token) {
        login(response.data.user, response.data.token);
        toast.success("네이버 로그인 성공!");
        navigate("/");
      } else {
        toast.error("네이버 로그인 실패");
      }
    } catch (error) {
      console.error("네이버 로그인 에러:", error);
      toast.error("네이버 로그인 중 오류가 발생했습니다.");
    }
  };

  // 네이버 인증 성공 시 자동 로그인 (중복 토스트 방지)
  useEffect(() => {
    let handled = false;
    
    // 팝업에서 온 메시지 처리
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'NAVER_CODE') {
        handleNaverCallback(event.data.code, event.data.state);
      } else if (event.data.type === 'OAUTH_ERROR') {
        console.error('OAuth error from popup:', event.data.error);
        toast.error('로그인 중 오류가 발생했습니다.');
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    const params = new URLSearchParams(location.search);
    if (params.get("naver") === "success" && !handled) {
      handled = true;
      const token = params.get("token");
      const accessToken = params.get("access_token");
      if (token) {
        localStorage.setItem("token", token);
        if (accessToken) {
          localStorage.setItem("naver_token", accessToken);
        }
        (async () => {
          try {
            const res = await axios.get("/auth/me", {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data && res.data.user) {
              login(res.data.user, token);
              // 쿼리스트링 완전 제거 (history.replaceState)
              window.history.replaceState({}, document.title, "/");
              navigate("/", { replace: true });
            } else {
              toast.error("유저 정보 조회 실패");
            }
          } catch (e) {
            toast.error(
              "자동 로그인 실패: " + (e.response?.data?.message || e.message)
            );
          }
        })();
      }
      // else { 토큰 없을 때 토스트 생략 }
    }
    // 최초 진입시 회원가입 모달 자동 오픈 (예시: 쿼리 ?signup=1)
    if (params.get("signup") === "1") {
      setModalOpen(true);
      window.history.replaceState({}, document.title, "/login");
    }
    
    // 이벤트 리스너 정리
    return () => {
      window.removeEventListener('message', handleMessage);
    };
    // eslint-disable-next-line
  }, [location.search, login, navigate]);

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
      console.log("로그인 시도:", { username, API_URL });
      const response = await axios.post("/auth/login", {
        username,
        password,
      });

      console.log("✅ 로그인 성공:", response.data);
      login(response.data.user, response.data.token);
      toast.success("로그인이 완료되었습니다!");
      navigate("/");
    } catch (error) {
      console.error("❌ 로그인 실패:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL
        }
      });
      const errorMessage =
        error.response?.data?.message || "로그인에 실패했습니다.";
      toast.error(`로그인 실패: ${errorMessage}`);
    }
  };

  // Google 로그인
const handleCredentialResponse = useCallback(async (response) => {
  try {
    const responsePayload = decodeJwtResponse(response.credential);

    const loginData = {
      oauthprovider: "google",
      oauthid: responsePayload.sub,
      email: responsePayload.email,
      nickname: responsePayload.name,
      profimg: responsePayload.picture,
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
    
    const initializeGoogleSignIn = () => {
      if (window.google) {
        try {
          window.google.accounts.id.initialize({
            client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || "1091328318644-87kerghdtm0kibacghdtiejadv36hqqe.apps.googleusercontent.com",
            callback: handleCredentialResponse,
          });
          
          const googleDiv = document.getElementById("googleSignInDiv");
          if (googleDiv) {
            window.google.accounts.id.renderButton(googleDiv, {
              type: "icon",
              theme: "outline", 
              shape: "circle",
              size: "large"
            });
          }
        } catch (error) {
          console.error("Google Sign-In 초기화 실패:", error);
        }
      }
    };

    // Google SDK가 이미 로드되었다면 즉시 초기화
    if (window.google) {
      initializeGoogleSignIn();
    } else {
      // 아니면 조금 기다렸다가 다시 시도
      const timer = setTimeout(initializeGoogleSignIn, 1000);
      return () => clearTimeout(timer);
    }
  }, [handleCredentialResponse]);

  // 네이버 로그인
  const NAVER_CLIENT_ID = process.env.REACT_APP_NAVER_CLIENT_ID;
  const NAVER_REDIRECT_URI = process.env.REACT_APP_NAVER_REDIRECT_URI;

  function handleNaverLogin() {
    const state = Math.random().toString(36).substring(2); // CSRF 방지용
    const url = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      NAVER_REDIRECT_URI
    )}&state=${state}`;
    
    // 팝업 창 열기 - 크기 최적화
    const popup = window.open(
      url,
      'NaverLogin',
      'width=500,height=700,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no'
    );
    
    // 메시지 핸들러 등록
    const messageHandler = async (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === 'NAVER_CODE') {
        try {
          setLoading(true);
          setError('');

          const response = await axios.post('/auth/naver/callback', {
            code: event.data.code,
            state: event.data.state
          });

          if (response.data.token) {
            await login(response.data.token, response.data.user);
            navigate('/');
          } else {
            setError('로그인에 실패했습니다.');
          }
        } catch (error) {
          console.error('네이버 로그인 오류:', error);
          setError(error.response?.data?.message || '네이버 로그인에 실패했습니다.');
        } finally {
          setLoading(false);
          window.removeEventListener('message', messageHandler);
          if (popup && !popup.closed) popup.close();
        }
      } else if (event.data.type === 'OAUTH_ERROR') {
        setError('네이버 로그인이 취소되었습니다.');
        setLoading(false);
        window.removeEventListener('message', messageHandler);
        if (popup && !popup.closed) popup.close();
      }
    };

    window.addEventListener('message', messageHandler);
    
    // 팝업 창 닫힘 감지 - 메모리 누수 방지
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        setLoading(false);
        window.removeEventListener('message', messageHandler);
        console.log('네이버 로그인 팝업이 닫혔습니다.');
      }
    }, 1000);
  }

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
          {error && <div className="errMsg" style={{ marginTop: '10px', textAlign: 'center' }}>{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        <div className="signup-section">
          <p className="signup-text">계정이 없으신가요? 지금 가입해보세요</p>
          <button className="signup-btn" onClick={() => setModalOpen(true)}>
            회원가입
          </button>
        </div>
        <div className="social-login-section">
          <div className="social-login-buttons">
            <div
              id="googleSignInDiv"
              className="google-signin-btn"
            ></div>
            <button className="social-btn naver-btn" onClick={handleNaverLogin}>
              <img src="/img/login/naver.png" alt="네이버 로그인" />
            </button>
            <button className="social-btn kakao-btn" onClick={handleKakaoLogin}>
              <img src="/img/login/kakao.png" alt="카카오 로그인" />
            </button>
          </div>
        </div>
        {modalOpen && (
          <JoinModal onClose={() => setModalOpen(false)}>
            <SignUpForm onSubmit={handleSignup} />
          </JoinModal>
        )}
        <div
          id="g_id_onload"
          data-client_id="1091328318644-87kerghdtm0kibacghdtiejadv36hqqe.apps.googleusercontent.com"
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