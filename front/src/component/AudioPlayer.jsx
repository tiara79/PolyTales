// front/src/component/AudioPlayer.jsx
// -----------------------------------------------------------------------------
// 단순 오디오 플레이어
// - pages[pageNum-1].audio 값을 그대로 사용 (백엔드서 normalizeMedia로 보정됨)
// - 재생, 일시정지, 시크, 자동 다음 페이지 이동
// -----------------------------------------------------------------------------

import React, { useEffect, useRef, useState } from "react";

export default function AudioPlayer({
  pages = [],
  pageNum = 1,
  setPageNum = () => {},
  autoAdvance = true,
}) {
  const audioRef = useRef(null);
  const [dur, setDur] = useState(0);
  const [cur, setCur] = useState(0);
  const [playing, setPlaying] = useState(false);

  const total = Array.isArray(pages) && pages.length > 0 ? pages.length : 1;
  const current = Array.isArray(pages) ? pages[pageNum - 1] : null;
  const src = current?.audio || "";

  useEffect(() => {
    setCur(0);
    setPlaying(false);
  }, [src]);

  const onLoaded = () => {
    const a = audioRef.current;
    if (!a) return;
    setDur(a.duration || 0);
  };
  const onTimeUpdate = () => {
    const a = audioRef.current; if (!a) return;
    setCur(a.currentTime || 0);
  };
  const onEnded = () => {
    setPlaying(false);
    if (autoAdvance && pageNum < total) setPageNum(pageNum + 1);
  };

  const toggle = () => {
    const a = audioRef.current; if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play().catch(() => {}); setPlaying(true); }
  };

  const onSeek = (e) => {
    const a = audioRef.current; if (!a) return;
    const v = Number(e.target.value) || 0;
    a.currentTime = v;
    setCur(v);
  };

  return (
    <div className="learn-audio-panel">
      {src && (
        <audio
          ref={audioRef}
          src={src}
          onLoadedMetadata={onLoaded}
          onTimeUpdate={onTimeUpdate}
          onEnded={onEnded}
        />
      )}
      
      <div className="learn-audio-controls">
        <button className="learn-btn" type="button" onClick={() => setPageNum(Math.max(1, pageNum - 1))}>
          <img src="/img/learn/prev.png" alt="prev" />
        </button>
        <button className="learn-btn" type="button" onClick={toggle} disabled={!src}>
          <img src={playing ? "/img/learn/pause.png" : "/img/learn/play.png"} alt="play/pause" />
        </button>
        <button className="learn-btn" type="button" onClick={() => setPageNum(Math.min(total, pageNum + 1))}>
          <img src="/img/learn/next.png" alt="next" />
        </button>
        <input
          type="range"
          min={0}
          max={Math.max(0, Math.floor(dur))}
          value={Math.floor(cur)}
          onChange={onSeek}
          className="learn-audio-progress"
          disabled={!src}
        />
        <span>{Math.floor(cur)}/{Math.floor(dur)}s</span>
      </div>
      
      {!src && (
        <div className="learn-audio--empty">오디오가 없습니다.</div>
      )}
    </div>
  );
}
