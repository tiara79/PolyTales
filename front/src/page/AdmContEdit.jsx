import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../style/AdmContEdit.css';

export default function AdmContEdit() {
    const { storyid } = useParams(); // storyId → storyid
    const navigate = useNavigate();
    const goBack = () => navigate(-1);

    const [contentData, setContentData] = useState(null);
    const [loading, setLoading] = useState(true);
    // 인라인 수정 상태 관리
    const [editField, setEditField] = useState(null); // {key: 'title'} 등
    const [editValues, setEditValues] = useState({});

    useEffect(() => {
        // localStorage에 저장된 데이터 우선 사용
        const localData = localStorage.getItem(`story_${storyid}`);
        if (localData) {
            setContentData(JSON.parse(localData));
            setLoading(false);
            return;
        }
        // 없으면 기존 테스트 데이터 사용
        const testDataList = [
            {
                storyId: '01',
                title: "Lily's Happy Day",
                imagePath: 'http://cdn.polytales.kr/lilystory.png',
                thumbnail: '썸네일1.jpg',
                video: 'lilys_happy_day_video.mp4',
                description: '릴리의 행복한 하루를 따라가며, 친구들과 함께하는 즐거운 이야기',
                koreanLevel: '초급',
                topic: '일상'
            },
            {
                storyId: '02',
                title: 'Adventure Story',
                imagePath: 'http://cdn.polytales.kr/adventure.png',
                thumbnail: '썸네일2.jpg',
                video: 'adventure_video.mp4',
                description: '모험을 떠나는 친구들의 신나는 이야기',
                koreanLevel: '중급',
                topic: '모험'
            },
            {
                storyId: '03',
                title: 'Magic Forest',
                imagePath: 'http://cdn.polytales.kr/forest.png',
                thumbnail: '썸네일3.jpg',
                video: 'magic_forest_video.mp4',
                description: '마법의 숲에서 벌어지는 환상적인 이야기',
                koreanLevel: '초급',
                topic: '판타지'
            }
        ];
        const foundContent = testDataList.find(item => item.storyId === storyid);
        if (foundContent) {
            setContentData(foundContent);
        } else {
            navigate('/admhome');
        }
        setLoading(false);
    }, [storyid, navigate]);

    if (loading) {
        return <div>로딩 중...</div>;
    }


    if (!contentData) {
        return <div>컨텐츠를 찾을 수 없습니다.</div>;
    }

    // td 클릭 시 표(인라인) 수정 시작
    const handleTdClick = (key) => {
        setEditField(key);
        setEditValues((prev) => ({ ...prev, [key]: contentData[key] }));
    };

    // input/textarea 값 변경
    const handleEditChange = (e, key) => {
        setEditValues((prev) => ({ ...prev, [key]: e.target.value }));
    };

    // 인라인 수정 종료(임시저장)
    const handleEditBlur = (key) => {
        setContentData((prev) => ({ ...prev, [key]: editValues[key] }));
        setEditField(null);
    };

    // 엔터로 저장
    const handleEditKeyDown = (e, key) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleEditBlur(key);
        }
    };

    //삭제 버튼 클릭 시
    const handleDelete = () => {
        // localStorage에서 해당 storyid 삭제
        localStorage.removeItem(`story_${storyid}`);
        // 삭제 후 홈으로 이동 및 새로고침(반영)
        navigate('/admhome');
        window.location.reload();
    };


    // 저장 버튼 클릭 시
    const handleSave = () => {
        // localStorage에 storyid별로 저장
        localStorage.setItem(`story_${storyid}`, JSON.stringify(contentData));
        navigate(`/admcontdetail/${storyid}`);
    };

    // 라디오(한국어 레벨) 변경
    const handleRadioChange = (e) => {
        setContentData((prev) => ({ ...prev, koreanLevel: e.target.value }));
    };

    // 체크박스(토픽) 변경
    const handleCheckboxChange = (e) => {
        const value = e.target.value;
        let topics = contentData.topic;
        // topic이 배열이 아니면 배열로 변환
        if (!Array.isArray(topics)) {
            topics = topics ? [topics] : [];
        }
        if (e.target.checked) {
            if (!topics.includes(value)) topics.push(value);
        } else {
            topics = topics.filter((t) => t !== value);
        }
        setContentData((prev) => ({ ...prev, topic: topics }));
    };

    // 체크박스 checked 여부
    const isTopicChecked = (value) => {
        if (!contentData.topic) return false;
        if (Array.isArray(contentData.topic)) return contentData.topic.includes(value);
        return contentData.topic === value;
    };

    return (
        <div className="admin-edit-container">
            <div className='edit-header'>
                <div className="back-button-wrapper">
                    <button className="back-button" onClick={goBack}>
                        🔙
                    </button>
                    <h1 className="page-title">컨텐츠 수정</h1>
                </div>
                {/* 삭제저장하기 버튼 */}
                <div className="right-button-wrapper">
                    <button className='delete-button' onClick={handleDelete}>
                        <img  src="/img/admin/delete_btn.png" alt="삭제하기" />
                    </button>
                    <button className='save-button' onClick={handleSave}>
                        <img  src="/img/admin/save_btn.png" alt="저장하기" />
                    </button>
                </div>
            </div>

            <div className="detail-content">
                <div className='admin-content-body'>
                    {/* 테이블 영역 */}
                    <div className='content-table-container'>
                        <table className="content-table">
                            <tbody>
                                <tr>
                                    <th>스토리ID</th>
                                    <td>{contentData.storyId}</td>
                                </tr>
                                <tr>
                                    <th>타이틀</th>
                                    <td onClick={() => handleTdClick('title')} style={{ cursor: 'pointer' }}>
                                        {editField === 'title' ? (
                                            <input
                                                type="text"
                                                value={editValues['title'] ?? contentData.title}
                                                autoFocus
                                                onChange={e => handleEditChange(e, 'title')}
                                                onBlur={() => handleEditBlur('title')}
                                                onKeyDown={e => handleEditKeyDown(e, 'title')}
                                                style={{ width: '90%' }}
                                            />
                                        ) : (
                                            contentData.title
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <th>이미지 경로</th>
                                    <td className="input-upload-td">
                                        <input
                                            type="text"
                                            value={editValues['imagePath'] ?? contentData.imagePath}
                                            onChange={e => setEditValues((prev) => ({ ...prev, imagePath: e.target.value }))}
                                            placeholder="예: /img/contents/파일명.jpg"
                                            style={{ width: '80%' }}
                                        />
                                        <button
                                            type="button"
                                            className="upload-btn"
                                            title="파일 업로드"
                                            onClick={() => document.getElementById('edit-image-upload').click()}
                                        >
                                            <img  src="/img/admin/add_btn2.png" alt="파일 업로드" />
                                        </button>
                                        <input
                                            id="edit-image-upload"
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
                                                setEditValues((prev) => ({ ...prev, imagePath: data.url || data.filename || '' }));
                                            }}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <th>썸네일</th>
                                    <td className="input-upload-td">
                                        <input
                                            type="text"
                                            value={editValues['thumbnail'] ?? contentData.thumbnail}
                                            onChange={e => setEditValues((prev) => ({ ...prev, thumbnail: e.target.value }))}
                                            placeholder="예: /img/contents/썸네일.jpg"
                                            style={{ width: '80%' }}
                                        />
                                        <button
                                            type="button"
                                            className="upload-btn"
                                            title="파일 업로드"
                                            onClick={() => document.getElementById('edit-thumb-upload').click()}
                                        >
                                            <img  src="/img/admin/add_btn2.png" alt="파일 업로드" />
                                        </button>
                                        <input
                                            id="edit-thumb-upload"
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
                                                setEditValues((prev) => ({ ...prev, thumbnail: data.url || data.filename || '' }));
                                            }}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <th>영상</th>
                                    <td className="input-upload-td">
                                        <input
                                            type="text"
                                            value={editValues['video'] ?? contentData.video}
                                            onChange={e => setEditValues((prev) => ({ ...prev, video: e.target.value }))}
                                            style={{ width: '80%' }}
                                        />
                                        <button
                                            type="button"
                                            className="upload-btn"
                                            title="파일 업로드"
                                            onClick={() => document.getElementById('edit-video-upload').click()}
                                        >
                                            <img  src="/img/admin/add_btn2.png" alt="파일 업로드" />
                                        </button>
                                        <input
                                            id="edit-video-upload"
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
                                                setEditValues((prev) => ({ ...prev, video: data.url || data.filename || '' }));
                                            }}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <th>설명</th>
                                    <td onClick={() => handleTdClick('description')} style={{ cursor: 'pointer' }}>
                                        {editField === 'description' ? (
                                            <textarea
                                                value={editValues['description'] ?? contentData.description}
                                                autoFocus
                                                onChange={e => handleEditChange(e, 'description')}
                                                onBlur={() => handleEditBlur('description')}
                                                onKeyDown={e => handleEditKeyDown(e, 'description')}
                                                style={{ width: '95%', minHeight: '40px' }}
                                            />
                                        ) : (
                                            contentData.description
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <th>한국어 레벨</th>
                                    <td>{contentData.koreanLevel}</td>
                                </tr>
                                <tr>
                                    <th>토픽</th>
                                    <td>{contentData.topic}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="right-container">

                        {/* 라디오영역 */}
                        <div className="level-radio">
                            <p>컨텐츠의 레벨을 선택해 주세요</p>
                            <div className="radio-grid">
                                {['초급', '초중급', '중급', '중고급', '고급', '최고급'].map((level) => (
                                    <label className="custom-radio" key={level}>
                                        <input
                                            type="radio"
                                            name="koreanLevel"
                                            value={level}
                                            checked={contentData.koreanLevel === level}
                                            onChange={handleRadioChange}
                                        /><span></span>{level}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* 토픽영역 */}
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