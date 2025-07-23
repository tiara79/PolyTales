// src/components/common/CurrentTime.jsx
import React, { useEffect, useState } from "react";

export default function CurrentTime() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const timeStr = time.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const dateStr = time.toLocaleDateString("ko-KR", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  }).replace(/\./g, "").replace(/\s/g, "");

  // 디버깅용 출력
  // console.log("[현재 시각]", timeStr, dateStr);

  return (
    <p style={{ fontSize: "0.9rem", margin: 0 }}>
      ⏰ {timeStr} &nbsp; 📅 {dateStr}
    </p>
  );
}
