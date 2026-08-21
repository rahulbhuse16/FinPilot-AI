import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";

const DashboardPage = lazy(() => import("../pages/DashboardPage").then((m) => ({ default: m.DashboardPage })));
const AnalystPage = lazy(() => import("../pages/AnalystPage").then((m) => ({ default: m.AnalystPage })));
const CustomersPage = lazy(() => import("../pages/CustomersPage").then((m) => ({ default: m.CustomersPage })));
const CustomerDetailPage = lazy(() => import("../pages/CustomerDetailPage").then((m) => ({ default: m.CustomerDetailPage })));
const TransactionsPage = lazy(() => import("../pages/TransactionsPage").then((m) => ({ default: m.TransactionsPage })));
const DocumentsPage = lazy(() => import("../pages/DocumentsPage").then((m) => ({ default: m.DocumentsPage })));
const InvestigationPage = lazy(() => import("../pages/InvestigationPage").then((m) => ({ default: m.InvestigationPage })));

function RouteFallback() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-navy-900" />
    </div>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/analyst" element={<AnalystPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/customers/:customerId" element={<CustomerDetailPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/investigation" element={<InvestigationPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
