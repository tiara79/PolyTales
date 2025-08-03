import React from "react";
import { useNavigate } from "react-router-dom";
import "../style/Report.css";
import Athlete_f from "../style/img/report/Athlete_f.png";
import Piechart from "../style/img/report/Piechart.png";

export default function Report() {
  const navigate = useNavigate();
  const goBack = () => navigate(-1); // back 버튼 -> 전단계로

  return (
    <div className="main-content">
      <div className="report-container">
        {/* 버튼 라인 */}
        <div className="back-button-wrapper">
          <button className="back-button" onClick={goBack}>
            🔙
          </button>

          <h1 className="page-title">학습 정보</h1>
        </div>

        {/* 전체 래퍼*/}
        <div className="report-wrapper">
          {/* 좌측 출석일 박스 */}
          <div className="date-box">
            <img src={Athlete_f} className="img" alt="Athlete" />
            <p className="img-text">
              '<b>21</b>'일째 달리고 있어요.
              <br />
              훌륭하네요~
              <br />
              연속으로 출석해봐요!
            </p>
          </div>

          {/* 컨텐츠 로우 박스 리스트 */}
          <div className="contents-list-wrap">
            {/* 관심 카테고리 */}
            <div className="interest-category">
              <div className="interest-header">
                <h2 className="interest-title">가장 관심있는 카테고리 TOP3</h2>
              </div>
              <hr />
              <div className="hash-img">
                <span className="hashtag">#일상</span>
                <span className="hashtag romance">#로맨스</span>
                <span className="hashtag sf">#SF</span>
              </div>
            </div>

            {/* 순위별 레벨 차트 */}
            <div className="study-level">
              <div className="level-header">
                <h2 className="level-title">가장 많이 공부한 레벨 TOP3</h2>
              </div>
              <hr />
              <div className="pie">
                <img src={Piechart} className="Piechart" alt="Piechart" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
