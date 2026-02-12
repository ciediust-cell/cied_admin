import { Outlet } from "react-router-dom";
import { DashboardLayout } from "../components/Dashboard/DashboardLayout.tsx";
import { Sidebar } from "../components/Dashboard/Sidebar.tsx";
import { TopBar } from "../components/Dashboard/TopBar.tsx";

export default function AdminLayout() {
  return (
    <DashboardLayout sidebar={<Sidebar />} topBar={<TopBar />}>
      <Outlet />
    </DashboardLayout>
  );
}
