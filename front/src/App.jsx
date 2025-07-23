import { BrowserRouter, Routes, Route } from "react-router-dom";

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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 헤더 + 푸터 포함 */}
        <Route element={<MainRouter />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/mypage" element={<Mypage />} />
          <Route path="/bookmark" element={<Bookmark />} />
          <Route path="/history" element={<History />} />
        </Route>

        {/*  헤더만 포함 */}
        <Route element={<DetailRouter />}>
          <Route path="/detail" element={<Detail />} />
        </Route>

        {/* 헤더/푸터 없음 */}
        <Route element={<NoRoute />}>
          <Route path="/learn" element={<Learn />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
