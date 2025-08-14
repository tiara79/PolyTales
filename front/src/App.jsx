// App.jsx
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useContext } from "react";
import { AuthProvider, AuthContext } from "./context/AuthContext"; //  useContext로 직접 접근
import { StoryProvider } from "./context/StoryContext";
import { BookmarkProvider } from "./context/BookmarkContext";
import { LevelsProvider } from "./context/LevelsContext";

import SignupWithVerification from "./components/SignupWithVerification";
import AdmContAdd from "./pages/AdmContAdd";
import AdmContDetail from "./pages/AdmContDetail";
import AdmContEdit from "./pages/AdmContEdit";
import AdmHome from "./pages/AdmHome";
import Bookmark from "./pages/Bookmark";
import Detail from "./pages/Detail";
import History from "./pages/History";
import Home from "./pages/Home";
import Learn from "./pages/Learn";
import Login from "./pages/Login";
import MyNotes from "./pages/MyNotes";
import Mypage from "./pages/Mypage";
import Plan from "./pages/Plan";
import Report from "./pages/Report";
import DetailRouter from "./routes/DetailRouter";
import MainRouter from "./routes/MainRouter";
import NoRoute from "./routes/NoRoute";

// 파일 분리 없이 App.jsx 내부에 보호 라우트 정의
function AdminRoute({ children }) {
  const { user, authLoading } = useContext(AuthContext) || {};

  // 초기 인증 동기화 중엔 잘못된 리다이렉트를 막기 위해 대기
  if (authLoading) return null; // 필요하면 로딩 스피너 컴포넌트로 교체

  if (!user) return <Navigate to="/login" replace />;
  // 프로젝트 컨벤션: 1=관리자, 2=회원 (다르면 여기만 맞춰 바꾸세요)
  if (user.role !== 1) return <Navigate to="/" replace />;

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StoryProvider>
          <LevelsProvider>
            <BookmarkProvider>
              <Routes>
                {/* 메인 레이아웃 */}
                <Route element={<MainRouter />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/home" element={<Home />} />
                </Route>

                {/* 상세/일반 레이아웃 */}
                <Route element={<DetailRouter />}>
                  <Route path="/signup-verify" element={<SignupWithVerification />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/detail" element={<Detail />} />
                  <Route path="/mypage" element={<Mypage />} />
                  <Route path="/mynotes" element={<MyNotes />} />
                  {/* 파라미터 컨벤션 통일: :storyid (소문자) */}
                  <Route path="/mynotes/:storyid" element={<MyNotes />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/bookmark" element={<Bookmark />} />
                  <Route path="/plan" element={<Plan />} />
                  <Route path="/report" element={<Report />} />
                </Route>

                {/* 관리자 보호 라우트 */}
                <Route
                  path="/admhome"
                  element={
                    <AdminRoute>
                      <AdmHome />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admcontadd"
                  element={
                    <AdminRoute>
                      <AdmContAdd />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admcontdetail/:storyid"
                  element={
                    <AdminRoute>
                      <AdmContDetail />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admcontedit/:storyid"
                  element={
                    <AdminRoute>
                      <AdmContEdit />
                    </AdminRoute>
                  }
                />

                {/* 스탠드얼론 레이아웃 (기존 NoRoute 활용) */}
                <Route element={<NoRoute />}>
                  <Route path="/learn" element={<Learn />} />
                </Route>

                {/* 404: 존재하지 않는 경로는 NoRoute(또는 NotFound)로 */}
                <Route path="*" element={<NoRoute />} />
              </Routes>

              <ToastContainer position="top-right" autoClose={3000} />
            </BookmarkProvider>
          </LevelsProvider>
        </StoryProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
