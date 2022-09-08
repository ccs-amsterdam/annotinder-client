import { useRef, useEffect } from "react";

const useSpeedBump = (watch: any, time: number = 500) => {
  const speedbump = useRef(false);

  useEffect(() => {
    speedbump.current = true;
    setTimeout(() => (speedbump.current = false), time);
    return () => {
      speedbump.current = false;
    };
  }, [time, watch]);

  return speedbump;
};

export default useSpeedBump;
