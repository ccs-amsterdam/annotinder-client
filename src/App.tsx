import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import GlobalStyle from "./lib/styled/GlobalStyle";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// Main pages. Use below in items to include in header menu
import AnnotatorPythonClient from "./lib/components/AnnotatorClient/AnnotatorPythonClient";
import AnnotatorRClient from "./lib/components/AnnotatorClient/AnnotatorRClient";
import AnnotatorDemoClient from "./lib/components/DemoJob/AnnotatorDemoClient";
import ResponsiveContainer from "./lib/components/Common/components/ResponsiveContainer";
import { useTheme } from "./lib/components/Common/components/Theme";

const queryClient = new QueryClient();

// just for quick testing
const App = () => {
  useTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalStyle />
      <Router>
        <ResponsiveContainer>
          <Routes>
            <Route path="/" element={<AnnotatorPythonClient />} />
            <Route path="/demo" element={<AnnotatorDemoClient />} />
            <Route path="/r" element={<AnnotatorRClient />} />
          </Routes>
        </ResponsiveContainer>
      </Router>
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
};

export default App;
