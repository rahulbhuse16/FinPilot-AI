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
import ApplyLoan from "../pages/portal/LoanApplication";
import CreateTransaction from "../pages/portal/CreateTransaction";
import { useSSE } from "../hooks/useSSE";
import { RiskRadarPage } from "../pages/RiskRadarPage";
import { AdminCopilotPage } from "../pages/AdminCopilotPage";
import { PortalHealthPage } from "../pages/portal/PortalHealthPage";
import { PortalScenarioPage } from "../pages/portal/PortalScenarioPage";
import { PayLoan } from "../pages/portal/PayLoan";
import LoanSubmittedSuccess from "../pages/portal/LoanSubmittedSuccess";
import { LoanPaymentSummary } from "../components/loan/LoanPaymentSummary";
import CreateAccount from "../pages/portal/CreateAccount";
import { AddBalanceToAccount } from "../pages/portal/AddBalanceToAccount";
import { enableWebPush } from "../api/webpush.api";

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

export function AppRouter() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();


  const { user } = useAuth()
  useSSE(user?.customer_id as string)

 useEffect(() => {
  const customerId=user?.customer_id
  if (!customerId) return;

  const setupWebPush = async () => {
    try {
      // Ask permission first
      const permission = await Notification.requestPermission();

      console.log("🔔 Notification permission:", permission);

      if (permission !== "granted") {
        console.log("❌ Notification permission denied");
        return;
      }

      // Permission granted → register push
      await enableWebPush(customerId);

      console.log("✅ Web Push enabled");
    } catch (error) {
      console.error(
        "❌ Web Push setup failed:",
        error
      );
    }
  };

  setupWebPush();
}, []);

  useEffect(() => {
  if (!user?.customer_id) return;

  if (Notification.permission !== "granted") {
    return;
  }

  enableWebPush(user.customer_id)
    .then(() => {
      console.log("✅ Web Push registered");
    })
    .catch((error) => {
      console.error("❌ Web Push registration failed:", error);
    });
}, []);

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
            <Route path="/risk-radar" element={<RiskRadarPage />} />
            <Route path="/admin-copilot" element={<AdminCopilotPage />} />


          </Route>
        </Route>

        <Route element={<RequireRole role="CUSTOMER" />}>
          <Route path="/portal" element={<PortalLayout />}>
            <Route index element={<PortalOverviewPage />} />
            <Route path="accounts" element={<PortalAccountsPage />} />
            <Route
  path="/portal/accounts/:accountId/add-money"
  element={<AddBalanceToAccount />}
/>
            <Route path="create-account" element={<CreateAccount />} />

            <Route path="transactions" element={<PortalTransactionsPage />} />
            <Route path="loans" element={<PortalLoansPage />} />
            <Route path="profile" element={<PortalProfilePage />} />
            <Route path="apply" element={<ApplyLoan />} />
            <Route path="create" element={<CreateTransaction />} />
            <Route path="health" element={<PortalHealthPage />} />
            <Route path="scenerio" element={<PortalScenarioPage />} />
            <Route path="pay-loan/:loanId" element={<PayLoan />} />
            <Route path="loan-summary/:loanId" element={<LoanPaymentSummary />} />

            <Route path="loan-request-success" element={<LoanSubmittedSuccess />} />






          </Route>
        </Route>

        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </Suspense>
  );
}
