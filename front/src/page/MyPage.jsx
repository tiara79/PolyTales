// src/page/MyPage.jsx
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { StoryContext } from "../context/StoryContext";
import { getProfileImageUrl } from "../util/imageUtil";
import { BookMarkContext } from "../context/BookmarkContext";
import "../style/MyPage.css";

// ===== 이미지 유틸 =====
const isAbs = (u) => /^https?:\/\//i.test(String(u || ""));
const norm = (p = "") => String(p).replace(/\\/g, "/").replace(/([^:]\/)\/+/g, "$1");
const baseName = (p = "") => {
  const s = norm(String(p));
  const i = s.lastIndexOf("/");
  return i >= 0 ? s.slice(i + 1) : s;
};
const slugifyTitle = (title = "") => {
  const s = String(title).toLowerCase().replace(/'/g, "").replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim();
  return Array.from(new Set([s.replace(/\s+/g, "_"), s.replace(/\s+/g, "-")]));
};
const wrapLocal = (name, level) => {
  const n = baseName(name);
  if (!n) return [];
  const lv = String(level || "").toLowerCase();
  const arr = [`/img/contents/${n}`, `/img/detail/${n}`];
  if (lv) arr.push(`/img/${lv}/${n}`);
  return arr;
};
const dedupe = (arr) => {
  const out = [];
  const seen = new Set();
  for (const u of (arr || []).filter(Boolean)) {
    const k = isAbs(u) ? u : norm(u);
    if (!seen.has(k)) {
      seen.add(k);
      out.push(k);
    }
  }
  return out;
};

// 북마크 카드용 후보 생성
const buildBookMarkCandidates = (bm, story) => {
  const title = story?.storytitle || bm.storytitle;
  const level = story?.langlevel || bm.langlevel;
  const fromStory = [
    ...(Array.isArray(story?.cover_candidates) ? story.cover_candidates : []),
    story?.thumbnail_url,
    story?.storycoverpath,
    story?.thumbnail,
  ];
  const fromBookMark = [bm.thumb, ...(Array.isArray(bm.thumbCandidates) ? bm.thumbCandidates : [])];
  const fromTitle = slugifyTitle(title)
    .flatMap((slug) => ["jpg", "png", "webp"].flatMap((ext) => [`${slug}.${ext}`, `${slug}_1.${ext}`]))
    .flatMap((n) => wrapLocal(n, level));
  return dedupe([...fromBookMark, ...fromStory, ...fromTitle, "/img/mypage/no_bookmark.png"]);
};

// 읽은 책 카드용 후보 생성
const buildReadCandidates = (rb, story) => {
  const title = story?.storytitle || rb.storytitle;
  const level = story?.langlevel || rb.langlevel;
  const fromStory = [
    ...(Array.isArray(story?.cover_candidates) ? story.cover_candidates : []),
    story?.thumbnail_url,
    story?.storycoverpath,
    story?.thumbnail,
  ];
  const fromNote = [rb.storycoverpath];
  const fromTitle = slugifyTitle(title)
    .flatMap((slug) => ["jpg", "png", "webp"].flatMap((ext) => [`${slug}.${ext}`, `${slug}_1.${ext}`]))
    .flatMap((n) => wrapLocal(n, level));
  return dedupe([...fromNote, ...fromStory, ...fromTitle, "/img/home/no_read.png"]);
};

// 기존 CSS 유지: books-cover-img 사용
function BookMarkCover({ candidates, alt }) {
  const list = useMemo(() => dedupe(candidates), [candidates]);
  const [i, setI] = useState(0);
  const src = list[i] || "/img/mypage/no_bookmark.png";
  return (
    <img
      className="books-cover-img"
      src={src}
      alt={alt}
      onError={() => {
        if (i < list.length - 1) setI(i + 1);
      }}
    />
  );
}

export default function MyPage() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const { BookMarks } = useContext(BookMarkContext);
  const storyContext = useContext(StoryContext);

  const [readBooks, setReadBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // stories 배열 참조(의존성 안정화)
  const storiesArr = storyContext?.stories;
  const byId = useMemo(() => {
    const map = new Map();
    (storiesArr || []).forEach((s) => map.set(String(s.storyid), s));
    return map;
  }, [storiesArr]);

  useEffect(() => {
    const fetchReadBooks = async () => {
      if (!user?.userid) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get(`/notes/${user.userid}`);
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

  const goBack = () => navigate(-1);

  const handleWithdraw = async () => {
    if (!window.confirm("정말로 회원 탈퇴하시겠습니까?")) return;
    if (window.prompt("탈퇴를 원하실 경우, '탈퇴'라고 입력해 주세요.") !== "탈퇴") return;
    try {
      toast.success("회원 탈퇴가 완료되었습니다. 그동안 이용해 주셔서 감사합니다.");
      logout();
      navigate("/");
    } catch {
      toast.error("회원 탈퇴 중 오류가 발생했습니다.");
    }
  };

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

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="main-content">
      <div className="mypage-container">
        <div className="mypage-header">
          <div className="back-button-wrapper">
            <button className="back-button" onClick={goBack}>🔙</button>
            <h1 className="page-title">마이페이지</h1>
          </div>
          <button className="mynote" onClick={() => navigate("/mynotes")}>
            <img src="/img/mypage/notes.png" alt="my note" />
            노트 필기
          </button>
        </div>

        <div className="mypage-wrapper">
          <div className="profile-box">
            <p className="join-date">
              가입일 : {user?.terms_agreed_at
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
                src={getProfileImageUrl(user?.profimg, "/img/login/prof_img.png")}
                alt="profile-image"
                className="profile-img-big"
                onClick={handleProfileImageClick}
                onError={(e) => {
                  e.currentTarget.src = "/img/login/prof_img.png";
                }}
                style={{ cursor: "pointer", opacity: isUploading ? 0.5 : 1 }}
              />
              {isHovering && (
                <div className="profile-img-overlay" onClick={handleProfileImageClick}>📷</div>
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
              <button className="report-btn" onClick={() => navigate("/report")}>학습 정보</button>
              <button className="plan-btn" onClick={() => navigate("/plan")}>구독 이력</button>
            </div>

            <button className="exit" onClick={handleWithdraw}>회원 탈퇴</button>
          </div>

          <div className="contents-list-wrap">
            {/* 내가 읽은 책들 */}
            <div className="read-book">
              <div className="read-header">
                <h2 className="read-title">내가 읽은 책들</h2>
                <button className="more-btn" onClick={() => navigate("/history")}>더보기</button>
              </div>
              <hr />
              {loading ? (
                <div>로딩 중...</div>
              ) : readBooks.length > 0 ? (
                <div className="books-carousel">
                  {readBooks.slice(0, 5).map((book) => {
                    const s = byId.get(String(book.storyid));
                    const level = (s?.langlevel || book.langlevel || "A1").toUpperCase();
                    const candidates = buildReadCandidates(book, s);
                    return (
                      <div
                        key={book.storyid}
                        className="books-card"
                        onClick={() =>
                          navigate(`/detail?storyid=${book.storyid}&level=${level}`, {
                            state: { thumb: candidates[0], thumbCandidates: candidates },
                          })
                        }
                      >
                        <div className="books-cover-wrapper">
                          <BookMarkCover candidates={candidates} alt={book.storytitle} />
                        </div>
                        <div className="books-title">{book.storytitle}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <img
                    src="/img/mypage/no_read.png"
                    alt="읽은 책이 없습니다"
                    className="empty-state-img"
                    onError={(e) => {
                      e.currentTarget.src = "/img/home/no_read.png";
                    }}
                  />
                </div>
              )}
            </div>

            {/* 내가 찜한 책들 — 기존 CSS 유지 */}
            <div className="books-marked">
              <div className="BookMarks-header">
                <h2 className="BookMarks-title">내가 찜한 책들</h2>
                <button className="more-btn" onClick={() => navigate("/BookMark")}>더보기</button>
              </div>
              <hr />
              {BookMarks.length > 0 ? (
                <div className="books-carousel">
                  {BookMarks.map((b, idx) => {
                    const s = byId.get(String(b.storyid));
                    const level = (s?.langlevel || b.langlevel || "A1").toUpperCase();
                    const title = s?.storytitle || b.storytitle || `Story ${b.storyid}`;
                    const candidates = buildBookMarkCandidates(b, s);
                    return (
                      <div
                        key={b.storyid || idx}
                        className="books-card"
                        onClick={() =>
                          navigate(`/detail?storyid=${b.storyid}&level=${level}`, {
                            state: { thumb: candidates[0], thumbCandidates: candidates },
                          })
                        }
                      >
                        <div className="books-cover-wrapper">
                          <BookMarkCover candidates={candidates} alt={title} />
                        </div>
                        <div className="books-title">{title}</div>
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
