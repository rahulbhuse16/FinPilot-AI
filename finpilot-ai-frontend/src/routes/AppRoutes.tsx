import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { PortalLayout } from "../layouts/PortalLayout";
import { RequireRole } from "./RequireRole";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { UNAUTHORIZED_EVENT } from "../api/axios";
import { signedOut } from "../store/authSlice";
import { useAppDispatch } from "../store/hooks";
import { useAuth } from "../hooks/useAuth";
import { homeRouteForRole } from "../utils/roles";

const DashboardPage = lazy(() => import("../pages/DashboardPage").then((m) => ({ default: m.DashboardPage })));
const AnalystPage = lazy(() => import("../pages/AnalystPage").then((m) => ({ default: m.AnalystPage })));
const CustomersPage = lazy(() => import("../pages/CustomersPage").then((m) => ({ default: m.CustomersPage })));
const CustomerDetailPage = lazy(() => import("../pages/CustomerDetailPage").then((m) => ({ default: m.CustomerDetailPage })));
const TransactionsPage = lazy(() => import("../pages/TransactionsPage").then((m) => ({ default: m.TransactionsPage })));
const DocumentsPage = lazy(() => import("../pages/DocumentsPage").then((m) => ({ default: m.DocumentsPage })));
const InvestigationPage = lazy(() => import("../pages/InvestigationPage").then((m) => ({ default: m.InvestigationPage })));
const PortalOverviewPage = lazy(() => import("../pages/portal/PortalOverviewPage").then((m) => ({ default: m.PortalOverviewPage })));
const PortalAccountsPage = lazy(() => import("../pages/portal/PortalAccountsPage").then((m) => ({ default: m.PortalAccountsPage })));
const PortalTransactionsPage = lazy(() => import("../pages/portal/PortalTransactionsPage").then((m) => ({ default: m.PortalTransactionsPage })));
const PortalLoansPage = lazy(() => import("../pages/portal/PortalLoansPage").then((m) => ({ default: m.PortalLoansPage })));
const PortalProfilePage = lazy(() => import("../pages/portal/PortalProfilePage").then((m) => ({ default: m.PortalProfilePage })));

function RouteFallback() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-navy-900" />
    </div>
  );
}

function HomeRedirect() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={homeRouteForRole(user.role)} replace />;
}

export function AppRoutes() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    function handleUnauthorized() {
      dispatch(signedOut());
      navigate("/login", { replace: true });
    }

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, [dispatch, navigate]);

  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<RequireRole role="ADMIN" />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/analyst" element={<AnalystPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/customers/:customerId" element={<CustomerDetailPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/investigation" element={<InvestigationPage />} />
          </Route>
        </Route>

        <Route element={<RequireRole role="CUSTOMER" />}>
          <Route path="/portal" element={<PortalLayout />}>
            <Route index element={<PortalOverviewPage />} />
            <Route path="accounts" element={<PortalAccountsPage />} />
            <Route path="transactions" element={<PortalTransactionsPage />} />
            <Route path="loans" element={<PortalLoansPage />} />
            <Route path="profile" element={<PortalProfilePage />} />
          </Route>
        </Route>

        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </Suspense>
  );
}
