import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/AuthContext";
import { StoryProvider } from "./context/StoryContext";

import SignupWithVerification from "./components/SignupWithVerification";
import { BookmarkProvider } from './context/BookmarkContext';
import { LevelsProvider } from './context/LevelsContext';
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

export default function App() {
  // 1. 가입 : user 상태를 localStorage에서 불러오기
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  // [추가] 새로고침 시 accessToken이 있으면 토큰 검증해서 user 상태 복원
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const API_BASE_URL =
      process.env.REACT_APP_API_URL || "http://localhost:3000";
    if (accessToken) {
      fetch(`${API_BASE_URL}/auth/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.ok && data.user) {
            setUser(data.user);
          } else {
            localStorage.removeItem("accessToken");
            setUser(null);
          }
        })
        .catch(() => {
          localStorage.removeItem("accessToken");
          setUser(null);
        });
    }
  }, []);

  // 2. user 상태가 바뀔 때마다 localStorage에 저장
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  return (
    <AuthProvider>
      <StoryProvider>
      <BrowserRouter>
       <LevelsProvider>
       <BookmarkProvider>
        <Routes>
          {/* 헤더 + 푸터 포함 */}
          <Route element={<MainRouter />}>
            <Route path="/" element={<Home />} />
          </Route>

          {/*  헤더만 포함 */}
          <Route element={<DetailRouter />}>
            <Route path="/signup-verify" element={<SignupWithVerification />} />
            <Route path="/admhome" element={<AdmHome />} />
            <Route path="/admcontadd" element={<AdmContAdd />} />
            <Route path="/admcontdetail/:storyId" element={<AdmContDetail />} />
            <Route path="/admcontedit/:storyId" element={<AdmContEdit />} />
            <Route path="/login" element={<Login />} />
            <Route path="/detail" element={<Detail />} />
            <Route path="/mypage" element={<Mypage />} />
            <Route path="/mynotes" element={<MyNotes />} />
            <Route path="/mynotes/:storyid" element={<MyNotes />} />
            <Route path="/history" element={<History />} />
            <Route path="/bookmark" element={<Bookmark />} />
            <Route path="/plan" element={<Plan />} />
            <Route path="/report" element={<Report />} />
          </Route>

          {/* 헤더/푸터 없음 */}
          <Route element={<NoRoute />}>
            <Route path="/learn" element={<Learn />} />
          </Route>

          {/* 존재하지 않는 경로들을 홈으로 리다이렉트 */}
          <Route path="/MainPage" element={<Home />} />
          <Route path="*" element={<Home />} />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        </BookmarkProvider>
        </LevelsProvider>
      </BrowserRouter>
      </StoryProvider>
    </AuthProvider>
  );
}
