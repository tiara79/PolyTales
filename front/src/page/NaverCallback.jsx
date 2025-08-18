import { useEffect } from 'react';

function NaverCallback() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');

    if (window.opener) {
      if (error) {
        window.opener.postMessage(
          { type: 'OAUTH_ERROR', error },
          window.location.origin
        );
      } else if (code) {
        window.opener.postMessage(
          { type: 'NAVER_CODE', code, state },
          window.location.origin
        );
      }
      window.close();
    } else {
      // 팝업이 아닌 경우 로그인 페이지로 리다이렉트
      window.location.href = `/login?code=${code}&state=${state}`;
    }
  }, []);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h3>로그인 처리 중...</h3>
      <p>잠시만 기다려 주세요.</p>
    </div>
  );
}

export default NaverCallback;
