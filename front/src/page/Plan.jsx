import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/Plan.css";

export default function Plan() {
  const navigate = useNavigate();
  const goBack = () => navigate(-1);
  const [tableOpen, setTableOpen] = useState(false);

  const handleCancelPlan = async () => {
    if (!window.confirm("정말로 요금제를 취소하시겠습니까?")) return;
    alert("취소 기능이 준비 중입니다.");
  };

  // 예시 구독 내역 데이터
  const subscriptionList = [
    {
      type: '프리미엄 요금제',
      payDate: '2025. 07. 07',
      nextPay: '2025. 08. 07',
      canCancel: true,
    },
    {
      type: '스탠다드 요금제',
      payDate: '2025. 06. 07',
      canCancel: false,
    },
    {
      type: '스탠다드 요금제',
      payDate: '2025. 05. 07',
      canCancel: false,
    },
  ];

  return (
    <div className="main-content">
      <div className="plan-container">
        <div className="back-button-wrapper">
          <button className="back-button" onClick={goBack}>
            🔙
          </button>
          <h1 className="page-title">구독 이력</h1>
        </div>
        <div className="plan-wrapper">
          {/* 좌측: 구독정보 표 */}
          <div className="subscription-info">
            <div className="subscription-table">
              <div className="subscription-table-header">
                <span>구독 정보</span>
                <button
                  className="more-btn"
                  onClick={() => setTableOpen((prev) => !prev)}
                  aria-label={tableOpen ? "닫기" : "더보기"}
                >
                  {tableOpen ? "✕" : "더보기"}
                </button>
              </div>
              {(tableOpen ? subscriptionList : [subscriptionList[0]]).map((item, idx, arr) => (
                <div className="subscription-row" key={idx}>
                  <div className="subscription-type-wrapper">
                    <div className="subscription-type">{item.type}</div>
                  </div>
                  <div className="subscription-detail-wrapper">
                    <div className="subscription-detail">
                      <div className="pay-info-text">
                        <div>결제일</div>
                        <div>다음 결제일</div>
                      </div>
                      <div className="pay-info-date">
                        {item.nextPay && (
                          <div>
                            <div className="pay-date-this">{item.payDate}</div>
                            <div className="pay-date-next">{item.nextPay}</div>
                          </div>
                        )}
                        {(tableOpen ? idx !== arr.length - 1 : false) && <hr />}
                      </div>
                    </div>
                    {item.canCancel && (
                      <button className="cancel-btn" onClick={handleCancelPlan}>요금제 취소</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 우측: 요금제 박스 */}
          <div className="plan-box">
            <div className="premium">
              <p className="plan-name">Premium</p>
              <p className="plan-name-ko">프리미엄 요금제</p>
              <p className="price">월 15,000원</p>
              <p className="plan-explane">월 무제한 컨텐츠 이용 가능</p>
            </div>
            <div className="standard">
              <p className="plan-name">Standard</p>
              <p className="plan-name-ko">스탠다드 요금제</p>
              <p className="price">월 5,000원</p>
              <p className="plan-explane">일 1개의 컨텐츠를 한달간 이용 가능</p>
            </div>
            <div className="free">
              <p className="plan-name">Free</p>
              <p className="plan-name-ko">무료 요금제</p>
              <p className="plan-explane">음성 없이 컨텐츠를 한달 1회 이용 가능</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}