import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { LevelsContext } from "../context/LevelsContext";
import { AuthContext } from "../context/AuthContext";
import { StoryContext } from "../context/StoryContext";
import "../style/MyNotes.css";
import "../style/Note.css";
import noImage from "../style/img/home/no_image.png";

export default function MyNotes() {
  const navigate = useNavigate();
  const { storyid } = useParams();
  const levelsContext = useContext(LevelsContext);
  const levels = levelsContext?.levels || [];
  const levelLabelsKo = levelsContext?.levelLabelsKo || {};
  const { user, token } = useContext(AuthContext);
  const { storyTitleMap, stories, storyImageMap } = useContext(StoryContext);

  const goBack = () => navigate(storyid ? "/mynotes" : -1);

  const [selected, setSelected] = useState(levels[0] || "A1");
  const [notesData, setNotesData] = useState([]);
  const [specificNotes, setSpecificNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storyTitle, setStoryTitle] = useState("");


  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      try {
        // 실제 사용자 ID를 AuthContext에서 가져옴
        const userid = user?.userid;
        if (!userid || !token) {
          setLoading(false);
          alert('로그인 정보가 없습니다. 다시 로그인 해주세요.');
          navigate('/login');
          return;
        }
        let allNotes = [];
        const response = await fetch(
          `http://localhost:3000/notes/${userid}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          }
        );

        if (response.status === 403 || response.status === 401) {
          setLoading(false);
          alert('접근 권한이 없습니다. 로그인 상태를 확인하거나, 다시 로그인 해주세요.');
          navigate('/login');
          return;
        }

        const result = await response.json();

        if (result.message === "ok") {
          allNotes = result.data;
        }

        if (storyid) {
          const storyNotes = allNotes.filter(note => note.storyid === parseInt(storyid));
          setSpecificNotes(storyNotes);
          // storyid로 매핑된 타이틀을 우선 사용, 없으면 노트의 storytitle, 
          // 없으면 첫 번째 노트의 title, 둘 다 없으면 Story {storyid}
          const title =
            storyTitleMap?.[storyid] ||
            storyNotes[0]?.storytitle ||
            storyNotes[0]?.title ||
            `Story ${storyid}`;
          setStoryTitle(title);
        } else {
          const groupedNotes = allNotes.reduce((acc, note) => {
            const storyId = note.storyid;
            if (!acc[storyId]) {
              acc[storyId] = {
                storyid: storyId,
                title: note.storytitle || `Story ${storyId}`,
                level: note.langlevel || "A1",
                image: note.storycoverpath ? note.storycoverpath : noImage,
                noteCount: 0,
                notes: []
              };
            }
            acc[storyId].noteCount++;
            acc[storyId].notes.push(note);
            return acc;
          }, {});
          setNotesData(Object.values(groupedNotes));
        }
        setLoading(false);
      } catch (error) {
        console.error("노트 데이터 로딩 실패:", error);
        setLoading(false);
      }
    };

    fetchNotes();
  }, [storyid, user?.userid, token, storyTitleMap, navigate]);

  const handleSelect = (level) => {
    setSelected((prev) => (prev === level ? null : level));
  };

  // 선택된 level에 따라 스토리 필터링
  const filteredStories = selected
    ? notesData.filter((story) => story.level === selected)
    : [];

  if (loading) {
    return (
      <div className="mynotes-container">
        <div className="back-button-wrapper">
          <button className="back-button" onClick={goBack}>
            🔙
          </button>
          <h1 className="page-title">
            {storyid ? `${storyTitle} - 내 노트` : "내가 작성한 노트들"}
          </h1>
        </div>
        <div>로딩 중...</div>
      </div>
    );
  }

  // 특정 스토리의 노트 상세 페이지
  if (storyid) {
    return (
      <div className="mynotes-container">
        <div className="back-button-wrapper">
          <button className="back-button" onClick={goBack}>
            🔙
          </button>
          <h1 className="page-title">
            {storyTitle ? `${storyTitle} - 내 노트` : "내가 작성한 노트들"}
          </h1>
        </div>
        <div className="notes-display-container">
          {specificNotes.length === 0 ? (
            <p className="no-notes">이 스토리에 대한 노트가 없습니다.</p>
          ) : (
            specificNotes.map((note) => {
              // 날짜 변환 안전 처리
              let dateStr = "";
              if (note.createdat) {
                const dateObj = new Date(note.createdat);
                dateStr = isNaN(dateObj.getTime()) ? "" : dateObj.toLocaleDateString();
              }
              return (
                <div key={note.noteid} className="note-box-display note-box-narrow">
                  <div className="note-head">
                    <strong>Note</strong>
                    <span className="note-date-header">
                      {dateStr}
                    </span>
                  </div>
                  <div className="note-title">
                    <label className="underline-note">Title :</label>
                    <input
                      className="note-input underline note-title-display"
                      value={note.title}
                      readOnly
                    />
                  </div>
                  <div className="note-content-display">
                    {note.content}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // 노트가 있는 작품들의 목록 페이지
  return (
    <div className="mynotes-container">
      <div className="back-button-wrapper">
        <button className="back-button" onClick={goBack}>
          🔙
        </button>
        <h1 className="page-title">내가 작성한 노트들</h1>
      </div>
      <div className="level-buttons">
        {levels.map((level) => {
          const isSelected = selected === level;
          return (
            <button
              key={level}
              onClick={() => handleSelect(level)}
              className={`level-btn ${level} ${isSelected ? `selected ${level}` : ""}`}
            >
              <strong>{level}</strong>
              <br />
              <span>{levelLabelsKo[level]}</span>
            </button>
          );
        })}
      </div>
      <div className="image-grid">
        {filteredStories.map(({ storyid, title, level, image, noteCount }) => {
          // StoryContext에서 이미지 정보 가져오기 (storyImageMap 우선)
          let storyImage = storyImageMap?.[storyid];
          if (!storyImage) {
            const storyObj = stories?.find(s => s.storyid === storyid);
            storyImage = storyObj?.storycoverpath || image || noImage;
          }
          // 이미지 경로가 상대경로면 서버 도메인 붙여줌
          if (storyImage && !/^https?:\/\//.test(storyImage)) {
            const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
            storyImage = storyImage.startsWith("/")
              ? `${baseUrl}${storyImage}`
              : `${baseUrl}/img/contents/${storyImage}`;
          }
          return (
            <div key={storyid} className="image-box">
              <Link to={`/mynotes/${storyid}`}>
                <img src={storyImage} alt={title} />
              </Link>
              <p className="image-title">{title}</p>
              <p className="note-count">{noteCount}개의 노트</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}