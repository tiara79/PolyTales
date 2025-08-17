import Header from "../component/Header";
import { Outlet } from "react-router-dom";
import React from 'react';

// DetailRouter 컴포넌트는 Outlet만 렌더링하여 헤더 페이지만 표시
export default function DetailRouter() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
    </>
  );
}
