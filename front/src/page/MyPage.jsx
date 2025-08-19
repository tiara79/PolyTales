// src/page/MyPage.jsx
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { StoryContext } from "../context/StoryContext";
import "../style/MyPage.css";
import { getProfileImageUrl } from "../util/imageUtil";

// ===== 이미지 유틸 최적화 (통합) =====
const getImageCandidates = (item, story, fallbackImage) => {
  const isAbs = (u) => /^https?:\/\//i.test(String(u || ""));
  const norm = (p = "") => String(p).replace(/\\/g, "/").replace(/([^:]\/)\/+/g, "$1");
  const baseName = (p = "") => {
    const s = norm(String(p));
    const i = s.lastIndexOf("/");
    return i >= 0 ? s.slice(i + 1) : s;
  };
  const slugify = (title = "") => {
    const s = String(title).toLowerCase().replace(/'/g, "").replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim();
    return Array.from(new Set([s.replace(/\s+/g, "_"), s.replace(/\s+/g, "-")]));
  };

  const level = story?.langlevel || item.langlevel;
  const title = story?.storytitle || item.storytitle;

  // 후보 이미지 경로 모으기
  const candidates = [
    ...(Array.isArray(story?.cover_candidates) ? story.cover_candidates : []),
    story?.thumbnail_url,
    story?.storycoverpath,
    story?.thumbnail,
    item.thumb,
    item.storycoverpath,
    ...(Array.isArray(item.thumbCandidates) ? item.thumbCandidates : []),
    ...slugify(title)
      .flatMap((slug) =>
        ["jpg", "png", "webp"].flatMap((ext) =>
          [`/img/contents/${slug}.${ext}`, `/img/detail/${slug}.${ext}`, level ? `/img/${level.toLowerCase()}/${slug}.${ext}` : null]
        )
      ),
    fallbackImage,
  ].filter(Boolean);

  // 중복 제거 및 경로 정규화
  const seen = new Set();
  return candidates.filter((u) => {
    const k = isAbs(u) ? u : norm(u);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

// 북마크/읽은 책 이미지 후보 생성 최적화
const buildImageCandidates = (item, story, fallbackImage) => {
  const title = story?.storytitle || item.storytitle;
  const level = story?.langlevel || item.langlevel;

  const storyImages = [
    ...(Array.isArray(story?.cover_candidates) ? story.cover_candidates : []),
    story?.thumbnail_url,
    story?.storycoverpath,
    story?.thumbnail,
  ];

  const itemImages = [
    item.thumb,
    item.storycoverpath,
    ...(Array.isArray(item.thumbCandidates) ? item.thumbCandidates : []),
  ];

  const titleImages = imageUtils.slugifyTitle(title)
    .flatMap((slug) =>
      ["jpg", "png", "webp"].flatMap((ext) =>
        [`${slug}.${ext}`, `${slug}_1.${ext}`]
      )
    )
    .flatMap((name) => imageUtils.getLocalPaths(name, level));

  return imageUtils.deduplicate([
    ...itemImages,
    ...storyImages,
    ...titleImages,
    fallbackImage,
  ]);
};

// ===== 최적화된 컴포넌트들 =====
const BookCard = ({ item, type, onSelect }) => {
  const story = useMemo(() => {
    return new Map().get(String(item.storyid));
  }, [item.storyid]);

  const imageUrl = useMemo(() => {
    const candidates = getImageCandidates(
      item,
      story,
      type === "bookmark" ? "/img/mypage/no_bookmark.png" : "/img/home/no_read.png"
    );
    return candidates[0] || "/img/mypage/no_bookmark.png";
  }, [item, story, type]);

  const displayTitle = story?.storytitle || item.storytitle || "제목 없음";
  const isCompleted = type === "read" && item.read_status === "completed";

  return (
    <div className="books-card" onClick={() => onSelect(item)}>
      <div className="books-cover-wrapper">
        <img src={imageUrl} alt={displayTitle} className="books-cover-img" />
        {isCompleted && <div className="completion-badge">완독</div>}
      </div>
      <div className="books-title">{displayTitle}</div>
    </div>
  );
};

const NoContent = ({ type }) => {
  const config = {
    bookmark: {
      image: "/img/mypage/no_bookmark.png",
      title: "아직 북마크한 책이 없어요",
      subtitle: "좋아하는 이야기를 찾아보세요!",
    },
    read: {
      image: "/img/home/no_read.png",
      title: "아직 읽은 책이 없어요",
      subtitle: "새로운 이야기를 시작해보세요!",
    },
  };

  const { image, title, subtitle } = config[type] || config.read;

  return (
    <div className="no-content">
      <img src={image} alt={title} className="no-content-image" />
      <h3 className="no-content-title">{title}</h3>
      <p className="no-content-subtitle">{subtitle}</p>
    </div>
  );
};

export default function MyPage() {
  // ===== Hooks 및 Context =====
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const { story } = useContext(StoryContext);

  // ===== State 관리 =====
  const [readBooks, setReadBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawPassword, setWithdrawPassword] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // ===== Refs =====
  const fileInputRef = useRef(null);

  // ===== Memoized Values =====
  const storyMap = useMemo(() => {
    const map = new Map();
    (story || []).forEach((s) => {
      if (s?.storyid) map.set(String(s.storyid), s);
    });
    return map;
  }, [story]);

  useEffect(() => {
    const fetchReadBooks = async () => {
      if (!user?.userid) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get(`/note/${user.userid}`); 
        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        const mapped = [];
        for (const n of data) {
          const sid = n.storyid;
          if (!mapped.find((m) => String(m.storyid) === String(sid))) {
            mapped.push({
              storyid: sid,
              storytitle: n.storytitle || `Story ${sid}`,
              langlevel: n.langlevel || "A1",
              storycoverpath: n.storycoverpath || n.thumbnail || null,
            });
          }
        }
        setReadBooks(mapped);
      } catch {
        setReadBooks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReadBooks();
  }, [user?.userid]);

  const handleProfileImageClick = () => fileInputRef.current?.click();

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("profileImage", file);
      const res = await api.post("/profile/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (!res.data?.data?.profimg) throw new Error();
      toast.success("프로필 이미지가 변경되었습니다!");
    } catch {
      toast.error("프로필 이미지 업로드에 실패했습니다.");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setIsUploading(false);
      setIsHovering(false);
      event.target.value = "";
    }
  };

  // 회원탈퇴 함수
  const handleWithdraw = async () => {
    if (!user?.userid) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    // 소셜 로그인 사용자는 비밀번호 확인 불필요
    if (!user.oauthprovider && !withdrawPassword.trim()) {
      toast.error("비밀번호를 입력해주세요.");
      return;
    }

    if (!window.confirm("정말로 회원탈퇴를 하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      return;
    }

    setIsWithdrawing(true);
    try {
      const requestBody = user.oauthprovider
        ? {} // 소셜 로그인 사용자는 비밀번호 불필요
        : { password: withdrawPassword };

      const response = await api.patch(`/users/${user.userid}/withdraw`, requestBody);

      if (response.status === 200) {
        toast.success("회원탈퇴가 완료되었습니다.");
        logout(); // 로그아웃 처리
        navigate("/"); // 홈으로 이동
      }
    } catch (error) {
      console.error("회원탈퇴 오류:", error);
      const message = error.response?.data?.message || "회원탈퇴 처리 중 오류가 발생했습니다.";
      toast.error(message);
    } finally {
      setIsWithdrawing(false);
      setShowWithdrawModal(false);
      setWithdrawPassword("");
    }
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="main-content">
      <div className="MyPage-container">
        <div className="MyPage-header">
          <div className="back-button-wrapper">
            <button className="back-button" onClick={() => navigate(-1)}>
              <img src="/img/mypage/back-arrow.png" alt="뒤로가기" />
            </button>
          </div>
          <h1 className="page-title">마이페이지</h1>
          <button className="more-btn" onClick={() => navigate("/mynotes")}>
            더보기
          </button>
        </div>

        <div className="MyPage-wrapper">
          <div className="profile-box">
            <p className="join-date">
              가입일 :{" "}
              {user?.terms_agreed_at
                ? new Date(user.terms_agreed_at).toLocaleDateString()
                : user?.createdat
                ? new Date(user.createdat).toLocaleDateString()
                : "가입일 정보 없음"}
            </p>

            <div
              className="profile-img-container"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <img
                src={getProfileImageUrl(user?.profimg, "/profile/prof_img.png")}
                alt="profile-image"
                className="profile-img-big"
                onClick={handleProfileImageClick}
                onError={(e) => {
                  e.currentTarget.src = "/profile/prof_img.png";
                }}
                style={{ cursor: "pointer", opacity: isUploading ? 0.5 : 1 }}
              />
              {isHovering && (
                <div className="profile-img-overlay" onClick={handleProfileImageClick}>
                  📷
                </div>
              )}
              {isUploading && <div className="upload-loading">업로드 중...</div>}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />

            <div className="plan-badge">Premium</div>
            <div className="profile-name">
              <b>{user?.nickName || user?.username || "사용자"}님</b>
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

            <button className="exit" onClick={() => setShowWithdrawModal(true)}>
              회원 탈퇴
            </button>
          </div>

          <div className="contents-list-wrap">
            {/* 내가 읽은 책들 */}
            <div className="read-book">
              <div className="read-header">
                <h2 className="read-title">내가 읽은 책들</h2>
                <button className="more-btn" onClick={() => navigate("/history")}>
                  더보기
                </button>
              </div>
              <hr />
              {loading ? (
                <div className="loading-state">로딩 중...</div>
              ) : readBooks.length > 0 ? (
                <div className="books-carousel">
                  {readBooks.slice(0, 8).map((book, idx) => (
                    <BookCard
                      key={book.storyid || idx}
                      item={book}
                      type="read"
                      onSelect={(item) => {
                        const story = storyMap.get(String(item.storyid));
                        const level = (story?.langlevel || item.langlevel || "A1").toUpperCase();
                        const candidates = buildImageCandidates(item, story, "/img/home/no_read.png");
                        navigate(`/detail?storyid=${item.storyid}&level=${level}`, {
                          state: { thumb: candidates[0], thumbCandidates: candidates },
                        });
                      }}
                    />
                  ))}
                </div>
              ) : (
                <NoContent type="read" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 회원탈퇴 모달 */}
      {showWithdrawModal && (
        <div className="modal-backdrop" onClick={() => setShowWithdrawModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>회원탈퇴</h3>
              <button className="modal-close" onClick={() => setShowWithdrawModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p className="withdraw-warning">
                ⚠️ 회원탈퇴 시 모든 데이터가 삭제되며, 복구할 수 없습니다.
              </p>
              <p className="withdraw-info">정말로 탈퇴하시겠습니까?</p>

              {/* 로컬 계정 사용자만 비밀번호 입력 */}
              {!user?.oauthprovider && (
                <div className="password-input-group">
                  <label htmlFor="withdraw-password">비밀번호 확인</label>
                  <input
                    id="withdraw-password"
                    type="password"
                    value={withdrawPassword}
                    onChange={(e) => setWithdrawPassword(e.target.value)}
                    placeholder="현재 비밀번호를 입력하세요"
                    disabled={isWithdrawing}
                  />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setShowWithdrawModal(false)}
                disabled={isWithdrawing}
              >
                취소
              </button>
              <button
                className="withdraw-btn"
                onClick={handleWithdraw}
                disabled={isWithdrawing || (!user?.oauthprovider && !withdrawPassword.trim())}
              >
                {isWithdrawing ? "처리 중..." : "탈퇴하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
