import React, { useState, useEffect } from "react";

// Main pages. Use below in items to include in header menu
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AnnotatorAPIClient from "lib/components/AnnotatorAPIClient/AnnotatorAPIClient";
import DemoJobOverview from "lib/components/DemoJob/DemoJobOverview";

// just for quick testing
//import AnnotatorRClient from "lib/components/AnnotatorAPIClient/AnnotatorRClient";

const App = () => {
  const [height, setHeight] = useState(window.innerHeight);

  useEffect(() => {
    // use windonw.innerHeight, because vh on mobile is weird (can include the address bar)
    const onResize = () => {
      setHeight(window.innerHeight);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  });

  return (
    <Router basename={process.env.PUBLIC_URL}>
      <div style={{ height: `${height}px`, width: "100vw" }}>
        <Routes>
          <Route path="/" exact element={<AnnotatorAPIClient />} />
          <Route path="/demo" exact element={<DemoJobOverview />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
