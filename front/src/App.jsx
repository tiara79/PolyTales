import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; 
import { ToastContainer } from 'react-toastify';

import MainRouter from "./routes/MainRouter";
import DetailRouter from "./routes/DetailRouter";
import NoRoute from "./routes/NoRoute";
import Home from "./pages/Home";
import Detail from "./pages/Detail";
import Learn from "./pages/Learn";
import Login from "./pages/Login";
import Mypage from "./pages/Mypage";
import Bookmark from "./pages/Bookmark";
import History from "./pages/History";
import Plan from "./pages/Plan";
import Report from "./pages/Report";
// import SignupWithVerification from "./components/SignupWithVerification";



function App() {
  // const [main, setMain] = useState(0); // 0: 메인, 1~7: 모드, 100: 결과
  // const [resultData, setResultData] = useState([]);

  // // 1. 가입 : user 상태를 localStorage에서 불러오기
  // const [user, setUser] = useState(() => {
  //   const saved = localStorage.getItem("user");
  //   return saved ? JSON.parse(saved) : null;
  // });

  // // [추가] 새로고침 시 accessToken이 있으면 토큰 검증해서 user 상태 복원
  // useEffect(() => {
  //   const accessToken = localStorage.getItem("accessToken");
  //   if (accessToken) {
  //     fetch("http://localhost:3000/auth/verify", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${accessToken}`,
  //       },
  //     })
  //       .then((res) => res.json())
  //       .then((data) => {
  //         if (data.ok && data.user) {
  //           setUser(data.user);
  //         } else {
  //           localStorage.removeItem("accessToken");
  //           setUser(null);
  //         }
  //       })
  //       .catch(() => {
  //         localStorage.removeItem("accessToken");
  //         setUser(null);
  //       });
  //   }
  // }, []);

  // // 2. user 상태가 바뀔 때마다 localStorage에 저장
  // useEffect(() => {
  //   if (user) {
  //     localStorage.setItem("user", JSON.stringify(user));
  //   } else {
  //     localStorage.removeItem("user");
  //   }
  // }, [user]);

  // const handleSelectCards = (cards) => {
  //   setResultData(cards);
  //   setMain(100); // 결과 페이지로 이동
  // };
  return (
    <AuthProvider>
      <BrowserRouter>
          <ToastContainer position="top-right" autoClose={1000} />
        <Routes>
          {/* 헤더 + 푸터 포함 */}
          <Route element={<MainRouter />}>
            <Route path="/" element={<Home />} />
          </Route>

          {/*  헤더만 포함 */}
          <Route element={<DetailRouter />}>
            {/* <Route path="/signup-verify" element={<SignupWithVerification />} /> */}
            <Route path="/login" element={<Login />} />
            <Route path="/detail" element={<Detail />} />
            <Route path="/mypage" element={<Mypage />} />
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
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
