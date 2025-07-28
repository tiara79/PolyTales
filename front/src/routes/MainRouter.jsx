import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import React from 'react';

// MainRouter 컴포넌트는 헤더/푸터 모두 페이지 표시
const MainRouter = () => {
  return (
     <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default MainRouter;
