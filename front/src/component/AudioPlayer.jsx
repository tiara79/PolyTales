// front/src/component/AudioPlayer.jsx
// -----------------------------------------------------------------------------
// Learn.jsx 에서 실행되는 오디오 플레이어
// - pages[pageNum-1].audio 값 사용 
// - 재생, 일시정지, 시크, 자동 다음 페이지 이동
// -----------------------------------------------------------------------------

// front/src/component/AudioPlayer.jsx
import React, { useEffect, useRef, useState } from "react";

export default function AudioPlayer({ pages = [], pageNum = 1, setPageNum = () => {}, setCaption = () => {} }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [src, setSrc] = useState("");

  useEffect(() => {
    const current = pages[pageNum - 1];
    const audioPath = current?.audiopath ? `/${current.audiopath}` : "";
    setSrc(audioPath);
    setIsPlaying(false);
    if (current?.caption) {
      setCaption(current.caption);
    }
  }, [pageNum, pages, setCaption]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !src) return;

    const handleCanPlay = () => {
      if (isPlaying) {
        audio.play().catch((e) => {
          console.error("play 오류", e);
        });
      }
    };

    const handleError = () => {
      console.error("오디오 로딩 실패:", src);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.pause();
    audio.currentTime = 0;
    audio.src = src;
    audio.load();

    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("error", handleError);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [src, isPlaying]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("오디오 재생 오류:", error);
      setIsPlaying(false);
    }
  };

  const goPrev = () => {
    setPageNum((p) => Math.max(p - 1, 1));
  };

  const goNext = () => {
    setPageNum((prev) => Math.min(prev + 1, pages.length));
  };

  return (
    <>
      <audio
        ref={audioRef}
        preload="metadata"
        crossOrigin="anonymous"
        style={{ display: "none" }}
      />

      <div className="caption-box">
        <div className="control-btns">
          <button
            onClick={goPrev}
            disabled={pageNum === 1}
            className={`btn Text${pageNum === 1 ? " disabled" : ""}`}
          >
            <img src="/img/learn/prev.png" alt="previous" className="icon" />
            <span>이전 문장</span>
          </button>
          <button onClick={togglePlay} className="btn pause">
            <img
              src={isPlaying ? "/img/learn/pause.png" : "/img/learn/play.png"}
              alt="play/pause"
            />
          </button>
          <button
            onClick={goNext}
            disabled={pageNum === pages.length}
            className="btn Text"
          >
            <img src="/img/learn/next.png" alt="next" className="icon" />
            <span>다음 문장</span>
          </button>
        </div>
      </div>
    </>
  );
}
