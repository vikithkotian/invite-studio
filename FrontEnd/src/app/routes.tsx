import { createBrowserRouter } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { SignUpPage } from "./pages/SignUpPage";
import { TemplatesPage } from "./pages/TemplatesPage";
import { EditorPage } from "./pages/EditorPage";
import { AdminTemplateEditorPage } from "./pages/AdminTemplateEditorPage";
import { PricingPage } from "./pages/PricingPage";
import { AboutPage } from "./pages/AboutPage";
import { TermsPage } from "./pages/TermsPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { ContactPage } from "./pages/ContactPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

console.log("routes.tsx: building router");
console.log("Admin template editor route: /admin/templates/:id/editor");

const PageNotFound = () => (
  <div style={{ color: "white", padding: "40px" }}>
    <h1>Page Not Found</h1>
  </div>
);

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/forgot-password",
    Component: ForgotPasswordPage,
  },
  {
    path: "/reset-password/:token",
    Component: ResetPasswordPage,
  },
  {
    path: "/signup",
    Component: SignUpPage,
  },
  {
    path: "/templates",
    Component: TemplatesPage,
  },
  {
    path: "/pricing",
    Component: PricingPage,
  },
  {
    path: "/about",
    Component: AboutPage,
  },
  {
    path: "/terms",
    Component: TermsPage,
  },
  {
    path: "/privacy",
    Component: PrivacyPage,
  },
  {
    path: "/contact",
    Component: ContactPage,
  },
  // Protected routes
  {
    path: "/admin/templates/:id/editor",
    element: (
      <ProtectedRoute requireAdmin>
        <AdminTemplateEditorPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/editor/:id",
    element: (
      <ProtectedRoute>
        <EditorPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute requireAdmin>
        <AdminDashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <PageNotFound />,
    errorElement: <PageNotFound />,
  },
]);
