import React, { useState, useEffect } from "react";

// Main pages. Use below in items to include in header menu
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AnnotatorAmcatClient from "./lib/components/AnnotatorClient/AnnotatorAmcatClient";
import AnnotatorRClient from "./lib/components/AnnotatorClient/AnnotatorRClient";
import DemoJobOverview from "./lib/components/DemoJob/DemoJobOverview";
import GuestCoder from "./lib/components/GuestCoder/GuestCoder";
import "./appStyle.css";

// just for quick testing
const App = () => {
  const [size, setSize] = useState({
    height: window.innerHeight,
    width: document.documentElement.clientWidth,
  });

  // useEffect(() => {
  //   const handleBeforeUnload = (e) => {
  //     e.preventDefault();
  //     const msg = "Are you sure you want to leave?";
  //     e.returnValue = msg;
  //     return msg;
  //   };
  //   window.addEventListener("beforeunload", (e) => handleBeforeUnload(e));
  //   return () => {
  //     window.removeEventListener("beforeunload", (e) => handleBeforeUnload(e));
  //   };
  // }, []);

  useEffect(() => {
    // use window.innerHeight for height, because vh on mobile is weird (can include the address bar)
    // use document.documentElement.clientwidth for width, to exclude the scrollbar
    const onResize = () => {
      setSize({
        height: window.innerHeight,
        width: document.documentElement.clientWidth,
      });
    };

    // Listen for changes to screen size and orientation
    // (this would have been so much easier if Safari would support window.screen.orientation)
    window.addEventListener("resize", onResize);
    if (window?.screen?.orientation) {
      window.screen.orientation?.addEventListener("change", onResize);
    } else if (window?.orientation) window.orientation.addEventListener("change", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (window?.screen?.orientation) {
        window.screen.orientation.removeEventListener("change", onResize);
      } else if (window?.orientation) window.orientation.removeEventListener("change", onResize);
    };
  });

  return (
    <Router basename={process.env.PUBLIC_URL}>
      <div style={{ height: `${size.height}px`, width: `${size.width}px` }}>
        <Routes>
          <Route path="/" exact element={<AnnotatorAmcatClient />} />
          <Route path="/demo" exact element={<DemoJobOverview />} />
          <Route path="/guest" exact element={<GuestCoder />} />
          <Route path="/r" exact element={<AnnotatorRClient />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
