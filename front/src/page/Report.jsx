import React from "react";
import { useNavigate } from "react-router-dom";
import "../style/Report.css";

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
            {/* <img src={Athlete_f} className="img" alt="Athlete" /> */}
            <div className="stage">
              <div className="shadow"></div>
              <div className="core">
                <div className="dress"></div>

                <div className="shoulder-r">
                  <div className="shoulder-r-arm-upper">
                    <div className="elbow-r">
                      <div className="elbow-r-arm-lower">
                        <div className="hand-r"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="shoulder-l">
                  <div className="shoulder-l-arm-upper">
                    <div className="elbow-l">
                      <div className="elbow-l-arm-lower">
                        <div className="hand-l"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="hip-r">
                  <div className="hip-r-leg-upper">
                    <div className="knee-r">
                      <div className="knee-r-leg-lower">
                        <div className="sock-r"></div>
                        <div className="foot-r"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="hip-l">
                  <div className="hip-l-leg-upper">
                    <div className="knee-l">
                      <div className="knee-l-leg-lower">
                        <div className="sock-l"></div>
                        <div className="foot-l"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="headcontainer">
                  <div className="bun-r"></div>
                  <div className="bun-l"></div>
                  <div className="ear-r"></div>
                  <div className="ear-l"></div>
                  <div className="headbg">
                    <div className="hair-r"></div>
                    <div className="hair-l"></div>
                    <div className="face"></div>
                    <div className="smile"></div>
                    <div className="eyes">
                      <div className="eyelid-t"></div>
                      <div className="eyelid-b"></div>
                      <div className="eye-r">
                        <div className="pupil-r"></div>
                      </div>
                      <div className="eye-l">
                        <div className="pupil-l"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 텍스트를 stage 안으로 이동 */}
              <div className="stage-text">
                '<b>21</b>'일째 달리고 있어요.
                <br />
                훌륭하네요~
                <br />
                연속으로 출석해봐요!
              </div>
            </div>
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
                <img  src="/img/report/piechart.png" className="Piechart" alt="Piechart" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
