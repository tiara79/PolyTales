//  front/src/pages/joinModal.jsx 
import React from "react";
import '../style/JoinModal.css';
import { IoClose } from "react-icons/io5";

/**
 * 회원가입/로그인 모달 컴포넌트
 * @param {function} onClose - 모달 닫기 핸들러
 * @param {ReactNode} children - 모달 내부 컨텐츠
 */
export default function JoinModal({ onClose, children }) {
  return (
    // 모달 배경 오버레이
    <div 
      className="modal-overlay" 
      onMouseDown={(e) => {
        // 오버레이 직접 클릭 시에만 닫기
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* 모달 컨텐츠 영역 */}
      <div 
        className="modal-content" 
        // 내부 클릭 이벤트 전파 방지
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button className="modal-close" onClick={onClose} aria-label="닫기">
          <IoClose size={18}/>
        </button>
        {/* 자식 컴포넌트 렌더링 */}
        {children}
      </div>
    </div>
  );
}
