import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import NotFoundPage from "@/pages/NotFoundPage/NotFoundPage";
import ChatPage from "@/pages/ChatPage/ChatPage";
import LiteraturePage from "@/pages/LiteraturePage/LiteraturePage";
import LiteratureDetailPage from "@/pages/LiteratureDetailPage/LiteratureDetailPage";
import DataCenterPage from "@/pages/DataCenterPage/DataCenterPage";
import StandardPage from "@/pages/StandardPage/StandardPage";
import ExperimentPage from "@/pages/ExperimentPage/ExperimentPage";
import PaperPage from "@/pages/PaperPage/PaperPage";
import SopPage from "@/pages/SopPage/SopPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/chat" replace />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="literature" element={<LiteraturePage />} />
        <Route path="literature/:id" element={<LiteratureDetailPage />} />
        <Route path="data" element={<DataCenterPage />} />
        <Route path="standard" element={<StandardPage />} />
        <Route path="experiment" element={<ExperimentPage />} />
        <Route path="paper" element={<PaperPage />} />
        <Route path="sop" element={<SopPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
