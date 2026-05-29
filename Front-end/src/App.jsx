import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PostDetails from "./pages/PostDetails";
import CategoryPage from "./pages/CategoryPage";
import SearchPage from "./pages/SearchPage";
import LoginPage from "./pages/LoginPage";
import AllPosts from "./pages/AllPosts";
import AdminLayout from "./components/layout/AdminLayout";
import Dashboard from "./components/admin/Dashboard";
import NewsPage from "./components/admin/NewsPage";
import OpportunitiesPage from "./components/admin/OpportunitiesPage";
import EventsPage from "./components/admin/EventsPage";
import SportsPage from "./components/admin/SportsPage";
import VisitorsPage from "./components/admin/VisitorsPage";
import DidYouKnowPage from "./components/admin/DidYouKnowPage";
import ProjectsPage from "./components/admin/ProjectsPage";
import UsersPage from "./components/admin/UsersPage";
import ITItemsPage from "./components/admin/ITItemsPage";
import SettingsPage from "./components/admin/SettingsPage";
import {
  AdminRoute,
  FieldBasedRoute,
  AdminPanelRoute,
} from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/toaster";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/post/:type/:id" element={<PostDetails />} />
        <Route path="/category/:category" element={<CategoryPage />} />
        <Route path="/all-posts" element={<AllPosts />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Admin Routes - Now allows students with field-based access */}
        <Route
          path="/admin"
          element={
            <AdminPanelRoute>
              <AdminLayout />
            </AdminPanelRoute>
          }
        >
          <Route
            index
            element={
              <FieldBasedRoute section="dashboard">
                <Dashboard />
              </FieldBasedRoute>
            }
          />
          <Route
            path="news"
            element={
              <FieldBasedRoute section="news">
                <NewsPage />
              </FieldBasedRoute>
            }
          />
          <Route
            path="opportunities"
            element={
              <FieldBasedRoute section="opportunities">
                <OpportunitiesPage />
              </FieldBasedRoute>
            }
          />
          <Route
            path="events"
            element={
              <FieldBasedRoute section="events">
                <EventsPage />
              </FieldBasedRoute>
            }
          />
          <Route
            path="sports"
            element={
              <FieldBasedRoute section="sports">
                <SportsPage />
              </FieldBasedRoute>
            }
          />
          <Route
            path="visitors"
            element={
              <FieldBasedRoute section="visitors">
                <VisitorsPage />
              </FieldBasedRoute>
            }
          />
          <Route
            path="did-you-know"
            element={
              <FieldBasedRoute section="did-you-know">
                <DidYouKnowPage />
              </FieldBasedRoute>
            }
          />
          <Route
            path="projects"
            element={
              <FieldBasedRoute section="projects">
                <ProjectsPage />
              </FieldBasedRoute>
            }
          />
          <Route
            path="users"
            element={
              <AdminRoute>
                <UsersPage />
              </AdminRoute>
            }
          />
          <Route
            path="it-items"
            element={
              <FieldBasedRoute section="it-items">
                <ITItemsPage />
              </FieldBasedRoute>
            }
          />
          <Route
            path="settings"
            element={
              <FieldBasedRoute section="settings">
                <SettingsPage />
              </FieldBasedRoute>
            }
          />
        </Route>

        <Route path="/search" element={<SearchPage />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
