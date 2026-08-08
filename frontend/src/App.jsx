import { Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import GlobalFeed from "./pages/GlobalFeed.jsx";
import RiskMap from "./pages/RiskMap.jsx";
import PortfolioExposure from "./pages/PortfolioExposure.jsx";
import KnowledgeGraph from "./pages/KnowledgeGraph.jsx";
import Analytics from "./pages/Analytics.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      <Route path="/dashboard" element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="global-feed" element={<GlobalFeed />} />
        <Route path="risk-map" element={<RiskMap />} />
        <Route path="portfolio" element={<PortfolioExposure />} />
        <Route path="knowledge-graph" element={<KnowledgeGraph />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>
    </Routes>
  );
}

export default App;
