import React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Link } from "react-router-dom";

import "../style/MyNotes.css";
import "../style/Note.css";

import Lilyshappyday from "../style/img/home/Lilyshappyday.png";
import noImage from "../style/img/home/no_image.png";

const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];

const levelLabelsKo = {
    A1: "초급",
    A2: "초중급",
    B1: "중급",
    B2: "중고급",
    C1: "고급",
    C2: "최고급",
};

// 스토리 정보 (실제로는 백엔드에서 가져와야 함)
const storyInfo = {
    1: { title: "Lily's happy day", level: "A1", image: Lilyshappyday },
    999: { title: "Demo Story", level: "A1", image: noImage } // 데모용 스토리
};

// 데모 노트 데이터
const demoNotes = [
    {
        noteid: 999001,
        userid: 2,
        storyid: 999,
        title: "첫 번째 노트",
        content: "이것은 데모 노트입니다.\n\nLearn 페이지에서 작성한 노트가 이런 식으로 표시됩니다.\n\n• 문법 정리\n• 새로운 단어들\n• 발음 연습",
        createdat: "2025-08-08T10:30:00.000Z"
    },
    {
        noteid: 999002,
        userid: 2,
        storyid: 999,
        title: "두 번째 노트",
        content: "학습하면서 중요한 부분을 정리했습니다.\n\n1. 주요 표현들\n2. 어려운 문법\n3. 기억해야 할 점들\n\n계속 복습하면서 실력을 늘려나가겠습니다!",
        createdat: "2025-08-08T14:15:00.000Z"
    }
];

export default function MyNotes() {
    const navigate = useNavigate();
    const { storyid } = useParams();
    const goBack = () => navigate(storyid ? "/mynotes" : -1);

    const [selected, setSelected] = useState("A1");
    const [notesData, setNotesData] = useState([]);
    const [specificNotes, setSpecificNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [storyTitle, setStoryTitle] = useState("");    // 노트 데이터 불러오기
    useEffect(() => {
        const fetchNotes = async () => {
            try {
                // 실제 사용자 ID (나중에 context에서 가져와야 함)
                const userid = 2;

                let allNotes = [...demoNotes]; // 데모 노트로 시작

                try {
                    const response = await fetch(`http://localhost:3000/notes/${userid}`);
                    const result = await response.json();

                    if (result.message === "ok") {
                        allNotes = [...allNotes, ...result.data]; // 실제 노트 추가
                    }
                } catch (apiError) {
                    console.log("API 호출 실패, 데모 데이터만 사용:", apiError);
                }

                if (storyid) {
                    // 특정 스토리의 노트만 필터링
                    const storyNotes = allNotes.filter(note => note.storyid === parseInt(storyid));
                    setSpecificNotes(storyNotes);
                    setStoryTitle(storyInfo[storyid]?.title || `Story ${storyid}`);
                } else {
                    // 스토리별로 노트 그룹화
                    const groupedNotes = allNotes.reduce((acc, note) => {
                        const storyId = note.storyid;
                        if (!acc[storyId]) {
                            acc[storyId] = {
                                storyid: storyId,
                                title: storyInfo[storyId]?.title || `Story ${storyId}`,
                                level: storyInfo[storyId]?.level || "A1",
                                image: storyInfo[storyId]?.image || noImage,
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
    }, [storyid]);

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
                        {storyid ? `${storyTitle} - 내 노트` : "내가 읽은 책들"}
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
                    <h1 className="page-title">{storyTitle} - 내 노트</h1>
                </div>

                <div className="notes-display-container">
                    {specificNotes.length === 0 ? (
                        <p className="no-notes">이 스토리에 대한 노트가 없습니다.</p>
                    ) : (
                        specificNotes.map((note) => (
                            <div key={note.noteid} className="note-box-display">
                                <div className="note-head">
                                    <strong>Note</strong>
                                    <span className="note-date-header">
                                        {new Date(note.createdat).toLocaleDateString()}
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
                        ))
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
                            className={`level-btn ${level} ${isSelected ? `selected ${level}` : ""
                                }`}
                        >
                            <strong>{level}</strong>
                            <br />
                            <span>{levelLabelsKo[level]}</span>
                        </button>
                    );
                })}
            </div>
            <div className="image-grid">
                {filteredStories.map(({ storyid, title, level, image, noteCount }) => (
                    <div key={storyid} className="image-box">
                        <Link to={`/mynotes/${storyid}`}>
                            <img src={image} alt={title} />
                        </Link>
                        <p className="image-title">{title}</p>
                        <p className="note-count">{noteCount}개의 노트</p>
                    </div>
                ))}
            </div>
        </div>
    );
}