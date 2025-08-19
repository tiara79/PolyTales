import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../style/AdmContDetail.css'; // 스타일 파일 임포트
 // 수정 버튼 이미지 임포트

export default function AdmContDetail() {
    const { storyId } = useParams(); // URL에서 storyId 파라미터 받기
    const navigate = useNavigate();
    const goBack = () => navigate(storyId ? "/admhome" : -1);

    const [contentData, setContentData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // localStorage에 저장된 데이터 우선 사용
        const localData = localStorage.getItem(`story_${storyId}`);
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
        const foundContent = testDataList.find(item => item.storyId === storyId);
        if (foundContent) {
            setContentData(foundContent);
        } else {
            navigate('/admhome');
        }
        setLoading(false);
    }, [storyId, navigate]);

    if (loading) {
        return <div>로딩 중...</div>;
    }

    if (!contentData) {
        return <div>컨텐츠를 찾을 수 없습니다.</div>;
    }

    return (
        <div className="admin-detail-container">
            <div className="back-button-wrapper">
                <button className="back-button" onClick={goBack}>
                    🔙
                </button>
                <h1 className="page-title">컨텐츠 상세 정보</h1>
            </div>

            <div className="detail-content">
                <div className='detail-content-body'>
                    <div className="edit-btn-container">
                        {/* 수정하기 버튼 */}
                        <button className="edit-btn" onClick={() => navigate(`/admcontedit/${storyId}`)}>
                            <img  src="/img/admin/edit_btn.png" alt="수정하기" />
                        </button>

                    </div>

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
                                    <td>{contentData.title}</td>
                                </tr>
                                <tr>
                                    <th>이미지 경로</th>
                                    <td>{contentData.imagePath}</td>
                                </tr>
                                <tr>
                                    <th>썸네일</th>
                                    <td>{contentData.thumbnail}</td>
                                </tr>
                                <tr>
                                    <th>영상</th>
                                    <td>{contentData.video}</td>
                                </tr>
                                <tr>
                                    <th>설명</th>
                                    <td>{contentData.description}</td>
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

                </div>
            </div>
        </div>
    );
}