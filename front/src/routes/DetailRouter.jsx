import Header from "../components/Header";
import { Outlet } from "react-router-dom";

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
