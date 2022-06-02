import React from "react";

// Main pages. Use below in items to include in header menu
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AnnotatorAmcatClient from "./lib/components/AnnotatorClient/AnnotatorAmcatClient";
import AnnotatorRClient from "./lib/components/AnnotatorClient/AnnotatorRClient";
import DemoJobOverview from "./lib/components/DemoJob/DemoJobOverview";
import GuestCoder from "./lib/components/GuestCoder/GuestCoder";
import useWindowSize from "./lib/hooks/useWindowSize";
import styled from "styled-components";
import "./appStyle.css";

const ResponsiveContainer = styled.div<{ height: number; width: number }>`
  height: ${(props) => props.height}px;
  width: ${(props) => props.width}px;
`;

// just for quick testing
const App = () => {
  const size = useWindowSize();

  return (
    <Router basename={process.env.PUBLIC_URL}>
      <ResponsiveContainer height={size.height - 1} width={size.width - 1}>
        <Routes>
          <Route path="/" exact element={<AnnotatorAmcatClient />} />
          <Route path="/demo" exact element={<DemoJobOverview />} />
          <Route path="/guest" exact element={<GuestCoder />} />
          <Route path="/r" exact element={<AnnotatorRClient />} />
        </Routes>
      </ResponsiveContainer>
    </Router>
  );
};

export default App;
