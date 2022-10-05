import React from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "./App.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// Main pages. Use below in items to include in header menu
import AnnotatorPythonClient from "./lib/components/AnnotatorClient/AnnotatorPythonClient";
import AnnotatorRClient from "./lib/components/AnnotatorClient/AnnotatorRClient";
import DemoJobOverview from "./lib/components/DemoJob/DemoJobOverview";
import ResponsiveContainer from "./lib/components/Common/ResponsiveContainer";

const queryClient = new QueryClient();

// just for quick testing
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router basename={process.env.REACT_APP_PUBLIC_URL || process.env.PUBLIC_URL}>
        <ResponsiveContainer>
          <Routes>
            <Route path="/" element={<AnnotatorPythonClient />} />
            <Route path="/demo" element={<DemoJobOverview />} />
            <Route path="/r" element={<AnnotatorRClient />} />
          </Routes>
        </ResponsiveContainer>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;
