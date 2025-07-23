import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import LinkRouter from "./router/LinkRouter";
import Home from "./pages/Home";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LinkRouter />}>
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
