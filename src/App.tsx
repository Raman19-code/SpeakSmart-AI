import { Link, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { DashboardPage } from "./pages/DashboardPage";
import { FluencyPage } from "./pages/FluencyPage";
import { GroupPage } from "./pages/GroupPage";
import { ImpromptuPage } from "./pages/ImpromptuPage";
import { InterviewPage } from "./pages/InterviewPage";
import { LandingPage } from "./pages/LandingPage";
import { SessionPage } from "./pages/SessionPage";
import { SettingsPage } from "./pages/SettingsPage";
import { VocabularyPage } from "./pages/VocabularyPage";

function NotFound() {
  return (
    <div className="card p-6">
      <h1 className="text-2xl font-bold text-white">Page not found</h1>
      <Link to="/" className="btn btn-primary mt-4">
        Go home
      </Link>
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="practice/fluency" element={<FluencyPage />} />
        <Route path="practice/impromptu" element={<ImpromptuPage />} />
        <Route path="practice/group" element={<GroupPage />} />
        <Route path="practice/interview" element={<InterviewPage />} />
        <Route path="vocabulary" element={<VocabularyPage />} />
        <Route path="sessions/:id" element={<SessionPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
