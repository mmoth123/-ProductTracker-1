import { useState, useEffect } from "react";

export function useCurrentTime(refreshInterval = 1000) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, refreshInterval);

    return () => {
      clearInterval(timer);
    };
  }, [refreshInterval]);

  const formattedTime = currentTime.toLocaleTimeString();
  const formattedDate = currentTime.toLocaleDateString();

  return {
    currentTime,
    formattedTime,
    formattedDate
  };
}
