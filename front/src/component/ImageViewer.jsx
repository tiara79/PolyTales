// front/src/component/ImageViewer.jsx
// -----------------------------------------------------------------------------
// 이미지 뷰어(경로는 백엔드 normalizeMedia로 보정된 image 사용)
// - 이미지 로드 실패 시 '/img/home/no_image.png'로 대체
// -----------------------------------------------------------------------------
import React, { useEffect, useState } from "react";

export default function ImageViewer({
  pages = [],
  pageNum = 1,
  setPageNum = () => {},
  caption = "",
  setCaption = () => {},
}) {
  const total = Array.isArray(pages) && pages.length > 0 ? pages.length : 1;
  const current = Array.isArray(pages) ? pages[pageNum - 1] : null;
  const src = current?.image || current?.imagepath || "";

  // 캡션 동기화
  useEffect(() => {
    const c = current?.caption || current?.subtitle || current?.text || "";
    setCaption(typeof c === "string" ? c : "");
  }, [src]);

  const onImgError = (e) => { e.currentTarget.src = "/img/home/no_image.png"; };

  const prev = () => setPageNum((p) => Math.max(1, p - 1));
  const next = () => setPageNum((p) => Math.min(total, p + 1));

  return (
    <div className="learn-media-wrap">
      <div className="learn-image-container">
        {src ? (
          <img className="learn-image" src={src} alt={`page-${pageNum}`} onError={onImgError} />
        ) : (
          <div className="learn-image learn-image--empty">
            <img src="/img/home/no_image.png" alt="no image" />
            <div>no image</div>
          </div>
        )}

        {caption && <div className="caption-text">{caption}</div>}

        <div className="learn-image-nav">
          <button className="learn-btn" type="button" onClick={prev}>
            <img src="/img/learn/prev.png" alt="prev" />
          </button>
          <span className="learn-page-indicator">
            {Math.max(1, Math.min(pageNum, total))}/{total}
          </span>
          <button className="learn-btn" type="button" onClick={next}>
            <img src="/img/learn/next.png" alt="next" />
          </button>
        </div>
      </div>
    </div>
  );
}
