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
import { PortfolioListPage } from "./pages/PortfolioListPage";
import PortfolioFormPage from "./pages/PortfolioFormPage";
import { MembersListPage } from "./pages/MembersListPage";
import MemberFormPage from "./pages/MemberFormPage";
import { EnquiriesListPage } from "./pages/EnquiriesListPage";
import { AwardsListPage } from "./pages/AwardsListPage";
import AwardsFormPage from "./pages/AwardsFormPage";
import { SettingsProfilePage } from "./pages/SettingsProfilePage";
import ProtectedRoute from "./auth/ProtectedRoute";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{ duration: 3000 }}
        containerStyle={{ zIndex: 9999 }}
      />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />

          {/* News */}
          <Route path="news" element={<NewsListPage />} />
          <Route
            path="news/createNews"
            element={<NewsFormPage mode="create" />}
          />
          <Route
            path="news/:newsId/edit"
            element={<NewsFormPage mode="edit" />}
          />

          {/* Events */}
          <Route path="events" element={<EventsListPage />} />
          <Route
            path="events/createEvent"
            element={<EventsFormPage mode="create" />}
          />
          <Route
            path="events/:eventId/edit"
            element={<EventsFormPage mode="edit" />}
          />

          {/* Programs */}
          <Route path="programs" element={<ProgramsListPage />} />
          <Route
            path="programs/createProgram"
            element={<ProgramFormPage mode="create" />}
          />
          <Route
            path="programs/:programId/edit"
            element={<ProgramFormPage mode="edit" />}
          />

          {/* Portfolio */}
          <Route path="portfolio" element={<PortfolioListPage />} />
          <Route
            path="portfolio/createPortfolio"
            element={<PortfolioFormPage mode="create" />}
          />
          <Route
            path="portfolio/:portfolioId/edit"
            element={<PortfolioFormPage mode="edit" />}
          />

          {/* Gallery */}
          <Route path="gallery" element={<GalleryListPage />} />
          <Route path="gallery/new" element={<GalleryFormPage />} />
          <Route path="gallery/:albumId" element={<GalleryDetailPage />} />

          {/* Members */}
          <Route path="members" element={<MembersListPage />} />
          <Route
            path="members/addMember"
            element={<MemberFormPage mode="create" />}
          />
          <Route
            path="members/:memberId/edit"
            element={<MemberFormPage mode="edit" />}
          />

          {/* Enquiries */}
          <Route path="enquiries" element={<EnquiriesListPage />} />

          {/* Awards */}
          <Route path="awards" element={<AwardsListPage />} />
          <Route
            path="awards/addAward"
            element={<AwardsFormPage mode="create" />}
          />
          <Route
            path="awards/:awardId/edit"
            element={<AwardsFormPage mode="edit" />}
          />

          {/* Settings */}
          <Route path="settings" element={<SettingsProfilePage />} />

          {/* Catch-all inside dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* Global catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
