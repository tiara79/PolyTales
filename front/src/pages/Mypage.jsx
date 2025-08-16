import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";
import { BookmarkContext } from "../context/BookmarkContext";
import { StoryContext } from "../context/StoryContext";
import "../style/Mypage.css";
import { getProfileImageUrl } from "../utils/imageUtils";

export default function Mypage() {
  const navigate = useNavigate();
  const goBack = () => navigate(-1);
  const { user, token, logout } = useContext(AuthContext);
  const { bookmarks } = useContext(BookmarkContext);
  const storyContext = useContext(StoryContext);
  const stories = storyContext?.stories || [];
  const [readBooks, setReadBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // 내가 읽은 책 데이터 가져오기 (노트 API 활용)
  useEffect(() => {
    const fetchReadBooks = async () => {
      if (!user?.userid || !token) return;

      try {
        const response = await fetch(
          `http://localhost:3000/notes/${user.userid}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const result = await response.json();
          // 노트 데이터에서 읽은 책 추출 (중복 제거)
          if (result.data) {
            const readStories = result.data.reduce((acc, note) => {
              const storyId = note.storyid;
              if (!acc.find((story) => story.storyid === storyId)) {
                acc.push({
                  storyid: storyId,
                  storytitle: note.storytitle || `Story ${storyId}`,
                  thumbnail: note.storycoverpath,
                  langlevel: note.langlevel || "A1",
                });
              }
              return acc;
            }, []);
            setReadBooks(readStories);
          }
        }
      } catch (error) {
        console.error("읽은 책 데이터 로딩 실패:", error);
        setReadBooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReadBooks();
  }, [user?.userid, token]);

  const handleWithdraw = async () => {
    if (!window.confirm("정말로 회원 탈퇴하시겠습니까?")) return;

    if (window.prompt("탈퇴를 원하실 경우, '탈퇴'라고 입력해 주세요.") !== "탈퇴")
      return;

    try {
      // 실제 탈퇴 API 호출 (구현 필요)
      // await withdrawUser();
      toast.success("회원 탈퇴가 완료되었습니다. 그동안 이용해 주셔서 감사합니다.");
      logout();
      navigate("/");
    } catch (error) {
      console.error("회원 탈퇴 실패:", error);
      toast.error("회원 탈퇴 중 오류가 발생했습니다.");
    }
  };

  // 프로필 이미지 클릭 핸들러
  const handleProfileImageClick = () => {
    fileInputRef.current?.click();
  };

  // 파일 선택 핸들러
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 실제 업로드 API 호출
      const formData = new FormData();
      formData.append("profileImage", file);

      const response = await fetch("http://localhost:3000/profile/upload-image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("이미지 업로드 실패");

      const result = await response.json();
      if (result.data?.profimg) {
        // 프로필 이미지 갱신
        // setProfileImg(result.data.profimg); // 필요시 상태로 관리
        // AuthContext의 user 정보도 갱신
        // login({ ...user, profimg: result.data.profimg }, token);
        toast.success("프로필 이미지가 변경되었습니다!");
      } else {
        throw new Error("서버에서 이미지 경로를 받지 못했습니다.");
      }
    } catch (error) {
      toast.error("프로필 이미지 업로드에 실패했습니다.");
      // 업로드 실패 시 기본 이미지로 복구
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setIsUploading(false);
      setIsHovering(false);
      event.target.value = "";
    }
  };

  if (!user) {
    navigate("/login");
    return null;
  }

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
            <img src="/img/mypage/notes.png" alt="my note" />노트 필기
          </button>
        </div>
        <div className="mypage-wrapper">
          {/* 왼쪽  영역 */}
          <div className="profile-box">
            {/* 가입일 */}
            <p className="join-date">
              가입일 : {user?.terms_agreed_at
                ? new Date(user.terms_agreed_at).toLocaleDateString()
                : user?.createdat
                  ? new Date(user.createdat).toLocaleDateString()
                  : "가입일 정보 없음"}
            </p>
            {/* 프로필 이미지 */}
            <div
              className="profile-img-container"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <img
                src={getProfileImageUrl(user?.profimg, "/img/login/prof_img.png")}
                alt="profile-image"
                className="profile-img-big"
                onClick={handleProfileImageClick}
                onError={e => { e.target.onerror = null; e.target.src = "/img/login/prof_img.png"; }}
                style={{  cursor: "pointer",
                  opacity: isUploading ? 0.5 : 1,  }}
              />
              {isHovering && (
                <div
                  className="profile-img-overlay"
                  onClick={handleProfileImageClick}
                >  📷
                </div>
              )}
              {isUploading && ( <div className="upload-loading">업로드 중...</div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            {/* 가입 플랜 - 요금제 */}
            <div className="plan-badge">Premium</div>
            <div className="profile-name">
              <b>{user?.nickName || user?.username || "사용자"}님</b>
            </div>
            <div className="profile-email">{user?.email}</div>
            <div className="button-container">
              {/* 학습 정보 */}
              <button
                className="report-btn"
                onClick={() => navigate("/report")}
              >
                {" "}
                학습 정보
              </button>
              {/* 구독 이력 */}
              <button className="plan-btn" onClick={() => navigate("/plan")}>
                구독 이력
              </button>
            </div>
            {/* 회원 탈퇴 */}
            <button className="exit" onClick={handleWithdraw}>
              회원 탈퇴
            </button>
          </div>

          {/* 오른쪽: 리스트 전체 랩 */}
          <div className="contents-list-wrap">
            <div className="read-book">
              <div className="read-header">
                <h2 className="read-title">내가 읽은 책들</h2>
                <button
                  className="more-btn"
                  onClick={() => navigate("/history")}
                >
                  {" "}
                  더보기
                </button>
              </div>
              <hr />
              {loading ? (
                <div>로딩 중...</div>
              ) : readBooks.length > 0 ? (
                <div className="books-carousel">
                  {readBooks.slice(0, 5).map((book) => (
                    <div key={book.storyid} className="books-card">
                      <div className="books-cover-wrapper">
                        <img
                          className="books-cover-img"
                          src={
                            book.thumbnail ||
                            "/img/home/no_read.png"
                          }
                          alt={book.storytitle}
                          onError={(e) => {
                            e.target.src = "/img/home/no_read.png";
                          }}
                        />
                      </div>
                      <div className="books-title">{book.storytitle}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <img
                    src="/img/mypage/no_read.png"
                    alt="읽은 책이 없습니다"
                    className="empty-state-img"
                    onError={(e) => {
                      e.target.src = "/img/home/no_read.png";
                    }}
                  />
                </div>
              )}
            </div>

            <div className="books-marked">
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
                  {bookmarks.map((book, idx) => {
                    const storyObj = stories?.find(s => String(s.storyid) === String(book.storyid));
                    // 대표 이미지 추출 (없으면 no_bookmark.png)
                    const imageUrl =
                      storyObj?.thumbnail
                        ? `/img/contents/${storyObj.thumbnail}`
                          : "/img/mypage/no_bookmark.png";

                    return (
                      <div key={book.storyid || idx} className="books-card">
                        <div className="books-cover-wrapper">
                          <img
                            className="books-cover-img"
                            src={imageUrl}
                            alt={storyObj?.storytitle || book.storytitle}
                            onError={e => { e.target.src = "/img/mypage/no_bookmark.png"; }}
                          />
                        </div>
                        <div className="books-title">{storyObj?.storytitle || book.storytitle}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <img
                    src="/img/mypage/no_bookmark.png"
                    alt="찜한 책이 없습니다"
                    className="empty-state-img"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
