// 소셜 로그인 콜백 페이지는 kakao, google, naver 모두 공통 처리 가능합니다.
// 이미 구현된 SocialCallback 또는 OAuthCallback 컴포넌트가 있다면 그걸 재사용하세요.
// 아래는 통합 콜백 예시입니다.

import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

export default function SocialCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // provider: kakao, google, naver 등
    const provider = searchParams.get("provider") || 
      (searchParams.get("kakao") && "kakao") ||
      (searchParams.get("google") && "google") ||
      (searchParams.get("naver") && "naver");
    const error = searchParams.get("error");
    const token = searchParams.get("token");

    if (error) {
      toast.error(error);
      navigate("/");
      return;
    }
    if (token) {
      // 토큰 저장 및 로그인 처리 로직 추가 가능
      // localStorage.setItem("token", token);
      navigate("/"); // 또는 원하는 페이지로 이동
      return;
    }
    navigate("/");
  }, [searchParams, navigate]);

  return <div>소셜 로그인 처리 중...</div>;
}
