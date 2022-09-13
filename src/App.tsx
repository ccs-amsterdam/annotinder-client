import React from "react";

// Main pages. Use below in items to include in header menu
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AnnotatorPythonClient from "./lib/components/AnnotatorClient/AnnotatorPythonClient";
import AnnotatorRClient from "./lib/components/AnnotatorClient/AnnotatorRClient";
import DemoJobOverview from "./lib/components/DemoJob/DemoJobOverview";
import GuestCoder from "./lib/components/GuestCoder/GuestCoder";
import ResponsiveContainer from "./lib/components/Common/ResponsiveContainer";

// just for quick testing
const App = () => {
  return (
    <Router basename={process.env.REACT_APP_PUBLIC_URL || process.env.PUBLIC_URL}>
      <ResponsiveContainer>
        <Routes>
          <Route path="/" exact element={<AnnotatorPythonClient />} />
          <Route path="/demo" exact element={<DemoJobOverview />} />
          <Route path="/guest" exact element={<GuestCoder />} />
          <Route path="/r" exact element={<AnnotatorRClient />} />
        </Routes>
      </ResponsiveContainer>
    </Router>
  );
};

export default App;
