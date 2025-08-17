
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/AdmContAdd.css';

export default function AdmContAdd() {
    const navigate = useNavigate();
    const goBack = () => navigate(-1);

    // 새 컨텐츠 입력값 상태
    const [form, setForm] = useState({
        title: '',
        imagePath: '',
        thumbnail: '',
        video: '',
        description: '',
        koreanLevel: '',
        topic: []
    });

    // input/textarea 값 변경
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // 라디오(한국어 레벨) 변경
    const handleRadioChange = (e) => {
        setForm((prev) => ({ ...prev, koreanLevel: e.target.value }));
    };

    // 체크박스(토픽) 변경
    const handleCheckboxChange = (e) => {
        const value = e.target.value;
        let topics = form.topic || [];
        if (!Array.isArray(topics)) topics = topics ? [topics] : [];
        if (e.target.checked) {
            if (!topics.includes(value)) topics = [...topics, value];
        } else {
            topics = topics.filter((t) => t !== value);
        }
        setForm((prev) => ({ ...prev, topic: topics }));
    };

    // 체크박스 checked 여부
    const isTopicChecked = (value) => {
        if (!form.topic) return false;
        if (Array.isArray(form.topic)) return form.topic.includes(value);
        return form.topic === value;
    };

    // 저장 버튼 클릭 시
    const handleSave = () => {
        // 모든 storyId(숫자) 중 최대값+1로 새 번호 생성
        let maxId = 0;
        // testDataList에서 최대값 찾기
        const testIds = ['01', '02', '03']; // AdmHome.jsx의 testDataList와 동일하게 유지
        testIds.forEach(id => { const n = parseInt(id, 10); if (n > maxId) maxId = n; });
        // localStorage에서 최대값 찾기
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('story_')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    const n = parseInt(data.storyId, 10);
                    if (!isNaN(n) && n > maxId) maxId = n;
                } catch { }
            }
        }
        const newId = (maxId + 1).toString().padStart(2, '0');
        const newContent = { ...form, storyId: newId };
        localStorage.setItem(`story_${newId}`, JSON.stringify(newContent));
        navigate(`/admcontdetail/${newId}`);
    };

    return (
        <div className="admin-edit-container">
            <div className='edit-header'>
                <div className="back-button-wrapper">
                    <button className="back-button" onClick={goBack}>
                        🔙
                    </button>
                    <h1 className="page-title">컨텐츠 추가</h1>
                </div>
                <div className="right-button-wrapper">
                    <button className='save-button' onClick={handleSave}>
                        <img  src="/img/admin/save_btn.png" alt="저장하기" />
                    </button>
                </div>
            </div>

            <div className="detail-content">
                <div className='admin-content-body'>
                    <div className='content-table-container'>
                        <table className="content-table">
                            <tbody>
                                <tr>
                                    <th>타이틀</th>
                                    <td>
                                        <input
                                            type="text"
                                            name="title"
                                            value={form.title}
                                            onChange={handleChange}
                                            placeholder="타이틀 입력"
                                            style={{ width: '90%' }}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <th>이미지</th>
                                    <td className="input-upload-td">
                                        <input
                                            type="text"
                                            name="imagePath"
                                            value={form.imagePath}
                                            onChange={handleChange}
                                            placeholder="이미지 URL"
                                            style={{ width: '80%' }}
                                        />
                                        <button
                                            type="button"
                                            className="upload-btn"
                                            title="파일 업로드"
                                            onClick={() => document.getElementById('image-upload').click()}
                                        >
                                            <img  src="/img/admin/add_btn2.png" alt="파일 업로드" />
                                        </button>
                                        <input
                                            id="image-upload"
                                            type="file"
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (!file) return;
                                                const formData = new FormData();
                                                formData.append('file', file);
                                                const res = await fetch('/api/upload', { method: 'POST', body: formData });
                                                const data = await res.json();
                                                setForm((prev) => ({ ...prev, imagePath: data.url || data.filename || '' }));
                                            }}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <th>썸네일</th>
                                    <td className="input-upload-td">
                                        <input
                                            type="text"
                                            name="thumbnail"
                                            value={form.thumbnail}
                                            onChange={handleChange}
                                            placeholder="썸네일 파일명"
                                            style={{ width: '80%' }}
                                        />
                                        <button
                                            type="button"
                                            className="upload-btn"
                                            title="파일 업로드"
                                            onClick={() => document.getElementById('thumb-upload').click()}
                                        >
                                            <img  src="/img/admin/add_btn2.png" alt="파일 업로드" />
                                        </button>
                                        <input
                                            id="thumb-upload"
                                            type="file"
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (!file) return;
                                                const formData = new FormData();
                                                formData.append('file', file);
                                                const res = await fetch('/api/upload', { method: 'POST', body: formData });
                                                const data = await res.json();
                                                setForm((prev) => ({ ...prev, thumbnail: data.url || data.filename || '' }));
                                            }}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <th>영상</th>
                                    <td className="input-upload-td">
                                        <input
                                            type="text"
                                            name="video"
                                            value={form.video}
                                            onChange={handleChange}
                                            placeholder="영상 파일명"
                                            style={{ width: '80%' }}
                                        />
                                        <button
                                            type="button"
                                            className="upload-btn"
                                            title="파일 업로드"
                                            onClick={() => document.getElementById('video-upload').click()}
                                        >
                                            <img  src="/img/admin/add_btn2.png" alt="파일 업로드" />
                                        </button>
                                        <input
                                            id="video-upload"
                                            type="file"
                                            accept="video/*"
                                            style={{ display: 'none' }}
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (!file) return;
                                                const formData = new FormData();
                                                formData.append('file', file);
                                                const res = await fetch('/api/upload', { method: 'POST', body: formData });
                                                const data = await res.json();
                                                setForm((prev) => ({ ...prev, video: data.url || data.filename || '' }));
                                            }}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <th>설명</th>
                                    <td>
                                        <textarea
                                            name="description"
                                            value={form.description}
                                            onChange={handleChange}
                                            placeholder="설명 입력"
                                            rows={11}
                                            style={{ width: '95%' }}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <th>한국어 레벨</th>
                                    <td>{form.koreanLevel}</td>
                                </tr>
                                <tr>
                                    <th>토픽</th>
                                    <td>{Array.isArray(form.topic) ? form.topic.join(', ') : form.topic}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="right-container">
                        <div className="level-radio">
                            <p>컨텐츠의 레벨을 선택해 주세요</p>
                            <div className="radio-grid">
                                {['초급', '초중급', '중급', '중고급', '고급', '최고급'].map((level) => (
                                    <label className="custom-radio" key={level}>
                                        <input
                                            type="radio"
                                            name="koreanLevel"
                                            value={level}
                                            checked={form.koreanLevel === level}
                                            onChange={handleRadioChange}
                                        /><span></span>{level}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="topic-area">
                            <p>토픽을 선택해 주세요</p>
                            <div className="checkbox-grid">
                                {['가족', '동화', '경제', '로맨스', '공포', '성장', '신화', '액션', '여행', '우정', '인물', '일상', '정보', '판타지', 'SF', '모험'].map((topic) => (
                                    <label className="custom-checkbox" key={topic}>
                                        <input
                                            type="checkbox"
                                            name="topic"
                                            value={topic}
                                            checked={isTopicChecked(topic)}
                                            onChange={handleCheckboxChange}
                                        /><span></span>{topic}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}