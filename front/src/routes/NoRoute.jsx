import { Outlet } from "react-router-dom";
import React from 'react';

// NoRoute 컴포넌트는 Outlet만 렌더링하여 헤더/푸터 없이 페이지 표시
export default function NoRoute() {
  return (
    <>
      <main>
        <Outlet />
      </main>
    </>
  )
}