import React from "react";

// Main pages. Use below in items to include in header menu
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AnnotatorAPIClient from "lib/components/AnnotatorAPIClient/AnnotatorAPIClient";

const App = () => {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <div style={{ height: "100vh", width: "100vw" }}>
        <Routes>
          <Route path="/" exact element={<AnnotatorAPIClient />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
