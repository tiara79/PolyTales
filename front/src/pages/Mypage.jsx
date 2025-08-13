import React, { useContext, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { AuthContext } from "../context/AuthContext";
import { uploadProfileImage, withdrawUser, kakaoUnlink } from "../api/axios";
import { getProfileImageUrl } from "../utils/imageUtils";
import { BookmarkContext } from "../context/BookmarkContext";
import "../style/Mypage.css";
import ProfImg from "../style/img/login/ProfImg.png";
import NoBookmark from "../style/img/mypage/nobookmark.png";
import NotRead from "../style/img/mypage/notread.png";
import notes from "../style/img/mypage/notes.png";

export default function Mypage() {
  const navigate = useNavigate();
  const goBack = () => navigate(-1); // back 버튼 -> 전단계로
  const { user, login, logout } = useContext(AuthContext);
  const { bookmarks } = useContext(BookmarkContext); // 북마크 데이터 가져오기
  const fileInputRef = useRef(null);                     //파일업로드
  const [isUploading, setIsUploading] = useState(false); //파일업로드 - 업로드중

  // ==========  읽은/찜한 책 기능 실제 프로덕션용 API 구현부 ==========
  const [readBooks, setReadBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const readResponse = await fetch(`/api/users/${user.id}/read-books`);
        if (!readResponse.ok) {
          throw new Error('데이터를 불러오는데 실패했습니다.');
        }
        const readData = await readResponse.json();
        setReadBooks(readData.data || []);
      } catch (err) {
        setReadBooks([]);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) {
      fetchUserData();
    }
  }, [user?.id]);

  if (loading) {
    return (
      <div className="main-content">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <div>데이터를 불러오는 중...</div>
        </div>
      </div>
    );
  }
  // ========================================================

  // 프로필 이미지 클릭 핸들러
  const handleProfileImageClick = () => {
    fileInputRef.current?.click();
  };
  // 파일 선택 핸들러
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // 파일 크기 체크 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("파일 크기는 5MB 이하여야 합니다.");
      return;
    }

    // 파일 타입 체크
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("JPG, PNG, GIF 파일만 업로드 가능합니다.");
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('profileImage', file);

      const response = await uploadProfileImage(formData);

      // 사용자 정보 업데이트
      const updatedUser = {
        ...user,
        profimg: response.data.profimg
      };

      // AuthContext 업데이트
      const token = localStorage.getItem('token');
      login(updatedUser, token);

      toast.success("프로필 이미지가 성공적으로 변경되었습니다!");
    } catch (error) {
      console.error("프로필 이미지 업로드 실패:", error);
      toast.error(error.response?.data?.message || "프로필 이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
      // 파일 input 초기화
      event.target.value = '';
    }
  };

  const handleWithdraw = async () => {
    if (!window.confirm("정말로 회원 탈퇴하시겠습니까?")) return;

    // 추가 확인
    if (!window.prompt("탈퇴를 원하실 경우, '탈퇴'라고 입력해 주세요.")) return;

    try {
      // 카카오 계정이면 언링크 API 호출
      if (user?.oauthprovider === 'kakao') {
        const access_token = localStorage.getItem('kakao_access_token');
        console.log('user 객체:', user);
        console.log('[DEBUG] 카카오 언링크 요청 access_token:', access_token);
        console.log('[DEBUG] 카카오 언링크 요청 oauthid:', user.oauthid);
        if (!access_token) throw new Error('카카오 access_token이 없습니다.');
        const unlinkResult = await kakaoUnlink({ access_token, oauthid: user.oauthid });
        console.log('[DEBUG] kakaoUnlink 응답:', unlinkResult);
      } else {
        await withdrawUser();
      }
      toast.success("회원 탈퇴가 완료되었습니다. 그동안 이용해 주셔서 감사합니다.");
      logout(); // 로그아웃 처리
      navigate("/"); // 홈으로 이동
    } catch (error) {
      console.error("회원 탈퇴 실패:", error);
      if (error.response) {
        console.error('[DEBUG] 서버 응답 데이터:', error.response.data);
        console.error('[DEBUG] 서버 응답 상태:', error.response.status);
        console.error('[DEBUG] 서버 응답 헤더:', error.response.headers);
      }
      toast.error(error.response?.data?.message || "회원 탈퇴 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="main-content">
      <div className="mypage-container">
        <div className="mypage-header">
          <div className="back-button-wrapper">
            <button className="back-button" onClick={goBack}>
              🔙
            </button>
            <h1 className="page-title">마이페이지</h1>
          </div>
          <button className="mynote" onClick={() => navigate("/mynotes")}>
            <img src={notes} alt="my note" />노트 필기
          </button>
        </div>

        <div className="mypage-wrapper">
          {/* 왼쪽: 프로필 */}
          <div className="profile-box">
            <p className="join-date">
              가입일 : {user?.joinDate || "2025-07-07"}
            </p>
            <div className="profile-img-container">
              <img
                src={getProfileImageUrl(user?.profimg, ProfImg)}
                alt="profile-image"
                className="profile-img-big"
                onClick={handleProfileImageClick}
                onError={e => { e.target.onerror = null; e.target.src = ProfImg; }}
                style={{
                  cursor: 'pointer',
                  opacity: isUploading ? 0.5 : 1
                }}
              />
              {/* 모든 사용자에게 카메라 아이콘 표시 */}
              <div className="profile-img-overlay" onClick={handleProfileImageClick}>
                📷
              </div>
              {isUploading && (
                <div className="upload-loading">업로드 중...</div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <div className="plan-badge">Premium</div>
            <div className="profile-name">
              <b>{user?.nickname || user?.username || "사용자"}님</b>
            </div>
            <div className="profile-email">{user?.email}</div>
            <div className="button-container">
              <button
                className="report-btn"
                onClick={() => navigate("/report")}
              >
                학습 정보
              </button>
              <button className="plan-btn" onClick={() => navigate("/plan")}>
                구독 이력
              </button>
            </div>
            <button className="exit" onClick={handleWithdraw}>
              회원 탈퇴
            </button>
          </div> {/* // 왼쪽 프로필 영역 마감 */}

          {/* 오른쪽: 리스트 전체 랩 */}
          <div className="contents-list-wrap">
            <div className="read-book">
              {/*내가 읽은 책 헤더 */}
              <div className="read-header">
                <h2 className="read-title">내가 읽은 책들</h2>
                <button
                  className="more-btn"
                  onClick={() => navigate("/history")}
                >
                  더보기
                </button>
              </div>
              <hr />
              {/* 조건부 렌더링: 읽은 책이 있는지 확인 */}
              {readBooks.length > 0 ? (
                <div className="books-carousel">
                  {readBooks.map((book) => (
                    <div key={book.id} className="books-card">
                      <div className="books-cover-wrapper">
                        <img
                          className="books-cover-img"
                          src={book.img}
                          alt={book.title}
                        />
                      </div>
                      <div className="books-title">{book.title}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <img
                    src={NotRead}
                    alt="읽은 책이 없습니다"
                    className="empty-state-img"
                  />
                </div>
              )}
            </div>

            <div className="books-marked">
              {/*내가찜한 책 헤더 */}
              <div className="bookmarks-header">
                <h2 className="bookmarks-title">내가 찜한 책들</h2>
                <button
                  className="more-btn"
                  onClick={() => navigate("/bookmark")}
                >
                  더보기
                </button>
              </div>
              <hr />

              {/* 북마크 리스트 렌더링 */}
              {bookmarks.length > 0 ? (
                <div className="books-carousel">
                  {bookmarks.map((book) => {
                    const imageBaseUrl = process.env.REACT_APP_IMAGE_BASE_URL || 'http://localhost:3000/img/contents';
                    const imageUrl = book.thumbnail ? `${imageBaseUrl}/${book.thumbnail}` : NoBookmark;
                    return (
                      <div key={book.storyid} className="books-card">
                        <div className="books-cover-wrapper">
                          <img
                            className="books-cover-img"
                            src={imageUrl}
                            alt={book.storytitle}
                          />
                        </div>
                        <div className="books-title">{book.storytitle}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <img
                    src={NoBookmark}
                    alt="찜한 책이 없습니다"
                    className="empty-state-img"
                  />
                </div>
              )}
            </div> {/* // 내가 찜한 책들 마감 */}
          </div> {/* // 오른쪽: 리스트 전체 랩 마감 */}
        </div>{/* // 전체 랩 마감 */}
      </div> {/* // 내 정보 마감 */}
    </div> // 마이페이지  마감
  );
}