import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Bookmark from './page/Bookmark'; // 경로가 맞음 (파일명 Bookmark.jsx, 폴더명 page)

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      <App />
  </React.StrictMode>
);

