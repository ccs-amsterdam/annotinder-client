// Main pages. Use below in items to include in header menu
import { RefObject, useEffect, useRef } from "react";
import { ReactNode } from "react";

// somehow, taking the full height/width sometimes causes overflows.
// subtracing 1 seems to work, but I can't explain why (maybe some rogue border)
const darkmass = 1;

// just for quick testing
const ResponsiveContainer = ({ children }: { children: ReactNode | ReactNode[] }) => {
  const ref = useRef<HTMLDivElement>();

  useEffect(() => {
    const onResize = () => updateSize(ref);
    // Listen for changes to screen size and orientation
    // (this would have been so much easier if Safari would support window.screen.orientation)
    window.visualViewport.addEventListener("resize", onResize);
    window.addEventListener("resize", onResize);

    if (window?.screen?.orientation)
      window.screen.orientation?.addEventListener("change", onResize);
    return () => {
      window.visualViewport.removeEventListener("resize", onResize);
      window.removeEventListener("resize", onResize);
      if (window?.screen?.orientation)
        window.screen.orientation.removeEventListener("change", onResize);
    };
  }, [ref]);

  useEffect(() => {
    // listening for orientation and size changes doesn't always work and on some devices
    // size isn't properly set on mount. Therefore also just check the size repeatedly
    const interval = setInterval(() => updateSize(ref), 1000);
    return () => clearInterval(interval);
  }, [ref]);

  return (
    <div
      ref={ref}
      style={{
        height: `${window.innerHeight - darkmass}px`,
        width: `${document.documentElement.clientWidth - darkmass}px`,
      }}
    >
      {children}
    </div>
  );
};

function updateSize(ref: RefObject<HTMLDivElement>) {
  // use window.innerHeight for height, because vh on mobile is weird (can include the address bar)
  // use document.documentElement.clientwidth for width, to exclude the scrollbar
  const height = `${window.innerHeight - darkmass}px`;
  const width = `${document.documentElement.clientWidth - darkmass}px`;

  if (height !== ref.current.style.height || width !== ref.current.style.width) {
    ref.current.style.height = height;
    ref.current.style.width = width;
  }
}

export default ResponsiveContainer;
