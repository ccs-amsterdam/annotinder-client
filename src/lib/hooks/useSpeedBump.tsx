import { useEffect, useState } from "react";

const useSpeedBump = (watch: any, time: number = 500) => {
  const [speedbump, setSpeedBump] = useState(false);

  useEffect(() => {
    setSpeedBump(true);
    setTimeout(() => setSpeedBump(false), time);
    return () => {
      setSpeedBump(false);
    };
  }, [time, watch]);

  return speedbump;
};

export default useSpeedBump;
