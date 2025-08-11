import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { BookmarkContext } from "../context/BookmarkContext";
import "../style/Mypage.css";
import Lilyshappyday from "../style/img/home/Lilyshappyday.png";
import ProfImg from "../style/img/login/ProfImg.png";

export default function Mypage() {
  const navigate = useNavigate();
  const { user, onLogout } = useContext(AuthContext);
  const { bookmarks } = useContext(BookmarkContext);

  const likedBooks = [
    { id: 4, title: "Lily's happy dayLily's happy day", img: Lilyshappyday },
    { id: 5, title: "Red Ridinghood", img: Lilyshappyday },
    { id: 6, title: "My diary", img: Lilyshappyday },
    { id: 7, title: "The Little Prince", img: Lilyshappyday },
    { id: 8, title: "Fighters", img: Lilyshappyday },
  ];

  const handleWithdraw = async () => {
    if (!window.confirm("정말로 회원 탈퇴하시겠습니까?")) return;
    alert("탈퇴 기능이 준비 중입니다. 로그아웃 처리합니다.");
    onLogout();
  };

  return (
    <div className="main-content">
      <div className="mypage-container">
        <div className="back-button-wrapper">
          <button className="back-button" onClick={() => navigate("-1")}>
            🔙
          </button>
          <h1 className="page-title">마이페이지</h1>
        </div>

        <div className="mypage-wrapper">
          {/* 왼쪽: 프로필 */}
          <div className="profile-box">
            <p className="join-date">
              가입일 : {user?.joinDate || "2025-07-07"}
            </p>
            <img
              src={user?.profImg || ProfImg}
              alt="profile-image"
              className="profile-img-big"
            />
            <div className="plan-badge">Premium</div>
            <div className="profile-name">
              <b>{user?.nickName || "사용자"}님</b>
            </div>
            <div className="profile-email">{user?.email}</div>
            <div className="button-container">
              <button className="report-btn" onClick={() => navigate("/report")}>
                학습 정보
              </button>
              <button className="plan-btn" onClick={() => navigate("/plan")}>
                구독 이력
              </button>
            </div>
            <button className="exit" onClick={handleWithdraw}>
              회원 탈퇴
            </button>
          </div>

          {/* 오른쪽: 리스트 전체 랩 */}
          <div className="contents-list-wrap">
            <div className="read-book">
              {/*내가 읽은 책 헤더 */}
              <div className="read-header">
                <h2 className="read-title">내가 읽은 책들</h2>
                <button className="more-btn" onClick={() => navigate("/history")} >
                  더보기
                </button>
              </div>
              <hr />
              {/* 캐러셀로 변경 */}
              <div className="books-carousel">
                {likedBooks.map((book) => (
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
              <div className="my-bookmark-section">
                {bookmarks.length === 0 ? (
                  <p>찜한 책이 없습니다.</p>
                ) : (
                  <div className="bookmark-list">
                    {bookmarks.map((book) => {
                      const imageBaseUrl = process.env.REACT_APP_IMAGE_BASE_URL || 'http://localhost:3000/img/contents';
                      const imageUrl = book.thumbnail ? `${imageBaseUrl}/${book.thumbnail}` : Lilyshappyday;
                      return (
                        <div key={book.storyid} className="bookmark-item">
                          <img src={imageUrl} alt={book.storytitle} />
                          <p>{book.storytitle}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
