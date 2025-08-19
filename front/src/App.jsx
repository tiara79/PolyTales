import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider } from "./context/AuthContext";
import { StoryProvider } from "./context/StoryContext";
import { LevelsProvider } from "./context/LevelsContext";
import { BookmarkProvider } from "./context/BookmarkContext"; 
import { NoteProvider } from "./context/NoteContext";

import AdmContAdd from "./page/AdmContAdd";
import AdmContDetail from "./page/AdmContDetail";
import AdmContEdit from "./page/AdmContEdit";
import AdmHome from "./page/AdmHome";
import BookMark from "./page/Bookmark";
import Detail from "./page/Detail";
import History from "./page/History";
import Home from "./page/Home";
import Learn from "./page/Learn";
import Login from "./page/Login";
import MyNotes from "./page/MyNotes";
import MyPage from "./page/MyPage";
import Plan from "./page/Plan";
import Report from "./page/Report";
import DetailRouter from "./route/DetailRouter";
import MainRouter from "./route/MainRouter";
import NoRouter from "./route/NoRouter";
import SignUpForm from "./page/SignUpForm";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StoryProvider>
          <LevelsProvider>
            <BookmarkProvider>
              <NoteProvider>
                <Routes>
                  {/* 헤더 + 푸터 포함 */}
                  <Route element={<MainRouter />}>
                    <Route path="/" element={<Home />} />
                  </Route>

                  {/* 헤더만 포함 */}
                  <Route element={<DetailRouter />}>
                    <Route path="/signup-verify" element={<SignUpForm />} />
                    <Route path="/admhome" element={<AdmHome />} />
                    <Route path="/admcontadd" element={<AdmContAdd />} />
                    <Route path="/admcontdetail/:storyId" element={<AdmContDetail />} />
                    <Route path="/admcontedit/:storyId" element={<AdmContEdit />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/detail" element={<Detail />} />
                    <Route path="/mypage" element={<MyPage />} />
                    <Route path="/mynotes" element={<MyNotes />} />
                    <Route path="/mynotes/:storyid" element={<MyNotes />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/bookmark" element={<BookMark />} />
                    <Route path="/plan" element={<Plan />} />
                    <Route path="/report" element={<Report />} />
                  </Route>

                  {/* 헤더/푸터 없음 */}
                  <Route element={<NoRouter />}>
                    <Route path="/learn" element={<Learn />} />
                  </Route>

                  {/* 존재하지 않는 경로들 */}
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
              </NoteProvider>
            </BookmarkProvider>
          </LevelsProvider>
        </StoryProvider> 
      </AuthProvider>
    </BrowserRouter>
  );
}
