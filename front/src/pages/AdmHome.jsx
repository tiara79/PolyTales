import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';

import addbtn from '../style/img/admin/addbtn.png';
import emptydata from '../style/img/admin/emptydata.png';
import findglass from '../style/img/admin/findglass.png';
import '../style/AdmHome.css';

export default function Admin() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [content, setContent] = useState('');
    const [searchFilter, setSearchFilter] = useState('타이틀');
    const [currentPage, setCurrentPage] = useState(1);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const itemsPerPage = 25;

    // 테스트 데이터 표시 여부 (개발용 - true/false로 변경해서 테스트)
    const showTestData = true; // true로 변경하면 테스트 데이터 표시

    const filterOptions = [
        '타이틀',
        '스토리ID',
        '검색어',
        '한국레벨',
        '토픽'
    ];

    // 테스트 데이터 배열
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


    // localStorage에서 story_로 시작하는 데이터 읽어오기
    const [contentList, setContentList] = useState([]);

    useEffect(() => {
        if (!showTestData) {
            setContentList([]);
            return;
        }
        // localStorage에서 story_로 시작하는 모든 값 읽기
        const localStories = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('story_')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    if (data && data.storyId) localStories.push(data);
                } catch { }
            }
        }
        // testDataList에서 storyId가 localStories에 없는 것만 추가
        const merged = [...localStories];
        testDataList.forEach(item => {
            if (!localStories.find(ls => ls.storyId === item.storyId)) {
                merged.push(item);
            }
        });
        setContentList(merged);
    }, [showTestData]);

    // 검색 필터링 로직
    const getFilteredData = () => {
        if (!content.trim()) {
            return contentList; // 검색어가 없으면 전체 데이터 반환
        }

        const searchTerm = content.toLowerCase().trim();

        return contentList.filter(item => {
            switch (searchFilter) {
                case '타이틀':
                    return item.title.toLowerCase().includes(searchTerm);
                case '스토리ID':
                    return item.storyId.toLowerCase().includes(searchTerm);
                case '한국레벨':
                    return item.koreanLevel.toLowerCase().includes(searchTerm);
                case '토픽':
                    return item.topic.toLowerCase().includes(searchTerm);
                case '검색어':
                    // 전체 필드에서 검색
                    return (
                        item.title.toLowerCase().includes(searchTerm) ||
                        item.storyId.toLowerCase().includes(searchTerm) ||
                        item.imagePath.toLowerCase().includes(searchTerm) ||
                        item.thumbnail.toLowerCase().includes(searchTerm) ||
                        item.video.toLowerCase().includes(searchTerm) ||
                        item.description.toLowerCase().includes(searchTerm) ||
                        item.koreanLevel.toLowerCase().includes(searchTerm) ||
                        item.topic.toLowerCase().includes(searchTerm)
                    );
                default:
                    return true;
            }
        });
    };

    // 필터링된 데이터 (storyId 오름차순 정렬)
    const filteredData = getFilteredData().slice().sort((a, b) => {
        const na = parseInt(a.storyId, 10);
        const nb = parseInt(b.storyId, 10);
        if (isNaN(na) || isNaN(nb)) return 0;
        return na - nb;
    });

    // 페이지네이션 로직 (필터링된 데이터 기준)
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredData.slice(startIndex, endIndex);

    // 페이지 변경 함수
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // 검색어 변경 시 첫 페이지로 이동
    const handleSearchChange = (e) => {
        setContent(e.target.value);
        setCurrentPage(1); // 검색할 때마다 첫 페이지로 이동
    };

    // 드롭다운 외부 클릭 시 닫기
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.filter-dropdown')) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // 어드민 접근 자격(role=1) 검증
    // useEffect(() => {
    //     // 로그인하지 않았거나 role이 1이 아닌 경우
    //     if (!user || user.role !== 1) {
    //         toast.error('관리자 외 진입 불가합니다.');
    //         navigate('/'); // 랜딩페이지로 리다이렉트
    //     }
    // }, [user, navigate]);

    // // role이 1이 아닌 경우 아무것도 렌더링하지 않음
    // if (!user || user.role !== 1) {
    //     return null;
    // }

    // 컨텐츠 추가 페이지로 이동
    const handleAddContent = () => {
        navigate('/admcontadd'); // 컨텐츠 추가 페이지로 이동
    };

    // 드롭다운 토글
    const toggleDropdown = () => {
        console.log('드롭다운 토글 클릭:', !isDropdownOpen); // 디버깅용
        setIsDropdownOpen(!isDropdownOpen);
    };

    // 필터 선택
    const handleFilterSelect = (option) => {
        setSearchFilter(option);
        setIsDropdownOpen(false);
    };

    // 로우 클릭 시 디테일 페이지로 이동
    const handleRowClick = (storyId) => {
        navigate(`/admcontdetail/${storyId}`); // 디테일 페이지로 이동 (스토리ID 전달)
    };



    return (
        <div className='admin-content-container'>
            <div className='admin-content-header'>
                <h1>컨텐츠 정보</h1>
                <div className='search-bar-btn'>
                    <div className='search-input-container'>
                        <div className='filter-dropdown'>
                            <div className={`custom-select ${isDropdownOpen ? 'open' : ''}`} onClick={toggleDropdown}>
                                <span className='filter-select-display'>{searchFilter}</span>
                                <span className='dropdown-arrow'>▼</span>
                                {/* 드롭다운 상태에 따라 표시 */}
                                {isDropdownOpen && (
                                    <div className='dropdown-options'>
                                        {filterOptions.map((option, index) => (
                                            <div
                                                key={index}
                                                className={`dropdown-option ${searchFilter === option ? 'selected' : ''}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleFilterSelect(option);
                                                }}
                                            >
                                                {option}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className='search-input-wrapper'>
                            <input
                                type="text"
                                value={content}
                                onChange={handleSearchChange}
                                placeholder="컨텐츠를 검색해 보세요"
                                className='search-input'
                            />
                            <img src={findglass} alt="Search" className='search-icon' />
                        </div>
                    </div>
                    <img
                        src={addbtn}
                        alt="Add-btn"
                        className='add-icon'
                        onClick={handleAddContent}
                        title="컨텐츠 추가"
                    />
                </div>
            </div>

            <div className='admin-content-body'>
                {/* 테이블 영역 - 항상 헤더 표시 */}
                <div className='adminhome-table-container'>
                    <table className={`adminhome-table ${filteredData.length > 0 ? 'has-data' : ''}`}>
                        <thead>
                            <tr>
                                <th>스토리ID</th>
                                <th>타이틀</th>
                                <th>이미지 경로</th>
                                <th>썸네일</th>
                                <th>영상</th>
                                <th>설명</th>
                                <th>한국어 레벨</th>
                                <th>토픽</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length === 0 ? (
                                // 빈 데이터 상태 - 테이블 내부에 표시
                                <tr>
                                    <td colSpan="8" className='empty-table-cell'>
                                        <div className='empty-state'>
                                            <img src={emptydata} alt="No data" className='empty-icon' />
                                            <p className='empty-message'>
                                                {content.trim() ? '검색 결과가 없습니다.' : '아직 어떤 컨텐츠도 없습니다. 컨텐츠를 작성해 주세요.'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                // 데이터가 있을 때 실제 데이터 표시
                                currentItems.map((item, index) => (
                                    <tr
                                        key={index}
                                        onClick={() => handleRowClick(item.storyId)}
                                        style={{ cursor: 'pointer' }}
                                        className="table-row-clickable"
                                    >
                                        <td>{item.storyId}</td>
                                        <td>{item.title}</td>
                                        <td>{item.imagePath}</td>
                                        <td>{item.thumbnail}</td>
                                        <td>{item.video}</td>
                                        <td>{item.description}</td>
                                        <td>{item.koreanLevel}</td>
                                        <td>{item.topic}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                    <div className='pagination'>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                            <button
                                key={pageNumber}
                                className={`pagination-btn ${currentPage === pageNumber ? 'active' : ''}`}
                                onClick={() => handlePageChange(pageNumber)}
                            >
                                {pageNumber}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
