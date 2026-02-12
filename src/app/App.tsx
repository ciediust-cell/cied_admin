import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "./pages/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import { NewsListPage } from "./pages/NewsListPage";
import NewsFormPage from "./pages/NewsFormPage";
import { EventsListPage } from "./pages/EventsListPage";
import EventsFormPage from "./pages/EventsFormPage";
import { ProgramsListPage } from "./pages/ProgramsListPage";
import ProgramFormPage from "./pages/ProgramFormPage";
import GalleryListPage from "./pages/GalleryListPage";
import GalleryDetailPage from "./pages/GalleryDetailPage";
import GalleryFormPage from "./pages/GalleryFormPage";
import { MembersListPage } from "./pages/MembersListPage";
import MemberFormPage from "./pages/MemberFormPage";
import { EnquiriesListPage } from "./pages/EnquiriesListPage";
import { AwardsListPage } from "./pages/AwardsListPage";
import AwardsFormPage from "./pages/AwardsFormPage";
import { SettingsProfilePage } from "./pages/SettingsProfilePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="news" element={<NewsListPage />} />
          <Route path="news/new" element={<NewsFormPage mode="create" />} />
          <Route
            path="news/:newsId/edit"
            element={<NewsFormPage mode="edit" />}
          />
          <Route path="events" element={<EventsListPage />} />
          <Route
            path="events/new"
            element={<EventsFormPage mode="create" />}
          />
          <Route
            path="events/:eventId/edit"
            element={<EventsFormPage mode="edit" />}
          />
          <Route path="programs" element={<ProgramsListPage />} />
          <Route
            path="programs/new"
            element={<ProgramFormPage mode="create" />}
          />
          <Route
            path="programs/:programId/edit"
            element={<ProgramFormPage mode="edit" />}
          />
          <Route path="gallery" element={<GalleryListPage />} />
          <Route path="gallery/new" element={<GalleryFormPage />} />
          <Route path="gallery/:albumId" element={<GalleryDetailPage />} />
          <Route path="members" element={<MembersListPage />} />
          <Route
            path="members/new"
            element={<MemberFormPage mode="create" />}
          />
          <Route
            path="members/:memberId/edit"
            element={<MemberFormPage mode="edit" />}
          />
          <Route path="enquiries" element={<EnquiriesListPage />} />
          <Route path="awards" element={<AwardsListPage />} />
          <Route path="awards/new" element={<AwardsFormPage mode="create" />} />
          <Route
            path="awards/:awardId/edit"
            element={<AwardsFormPage mode="edit" />}
          />
          <Route path="settings" element={<SettingsProfilePage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
