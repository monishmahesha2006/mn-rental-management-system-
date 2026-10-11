import { useRoutes, Navigate } from "react-router-dom";
import { LoginPage } from "./screens/LoginPage";
import { OwnerDashboard } from "./screens/owner/OwnerDashboard";
import { OwnerTenants } from "./screens/owner/OwnerTenants";
import { OwnerTenantProfile } from "./screens/owner/OwnerTenantProfile";
import { OwnerBilling } from "./screens/owner/OwnerBilling";
import { OwnerMaintenance } from "./screens/owner/OwnerMaintenance";
import { OwnerAutomationLog } from "./screens/owner/OwnerAutomationLog";
import { OwnerSecurityDeposit } from "./screens/owner/OwnerSecurityDeposit";
import { TenantHome } from "./screens/tenant/TenantHome";
import { TenantBills } from "./screens/tenant/TenantBills";
import { TenantMaintenance } from "./screens/tenant/TenantMaintenance";
import { TenantVault } from "./screens/tenant/TenantVault";
import { TenantProfile } from "./screens/tenant/TenantProfile";
import { TenantPaymentHistory } from "./screens/tenant/TenantPaymentHistory";
import { TenantNoticeBoard } from "./screens/tenant/TenantNoticeBoard";
import { OwnerRentAnalytics } from "./screens/owner/OwnerRentAnalytics";
import { OwnerNoticeBoard } from "./screens/owner/OwnerNoticeBoard";
import { SidebarLayout } from "./shared/SidebarLayout";
import { ProtectedRoute } from "./shared/ProtectedRoute";
import { OwnerExpenses } from "./screens/owner/OwnerExpenses";
import { OwnerVendors } from "./screens/owner/OwnerVendors";
import { OwnerInventory } from "./screens/owner/OwnerInventory";
import { OwnerAutomation } from "./screens/owner/OwnerAutomation";
import { OwnerCashApprovals } from "./screens/owner/OwnerCashApprovals";
import { TenantServiceBooking } from "./screens/tenant/TenantServiceBooking";
export function AppRoutes() {
  const element = useRoutes([
    { path: "/login", element: <LoginPage /> },
    { path: "/register", element: <Navigate to="/login" replace /> },
    {
      path: "/owner",
      element: (
        <ProtectedRoute requiredRole="OWNER">
          <SidebarLayout role="OWNER" />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <OwnerDashboard /> },
        { path: "dashboard", element: <OwnerDashboard /> },
        { path: "tenants", element: <OwnerTenants /> },
        { path: "tenants/:tenantId", element: <OwnerTenantProfile /> },
        { path: "billing", element: <OwnerBilling /> },
        { path: "maintenance", element: <OwnerMaintenance /> },
        { path: "expenses", element: <OwnerExpenses /> },
        { path: "vendors", element: <OwnerVendors /> },
        { path: "inventory", element: <OwnerInventory /> },
        { path: "automation", element: <OwnerAutomation /> },
        { path: "cash-approvals", element: <OwnerCashApprovals /> },
        { path: "notices", element: <OwnerNoticeBoard /> },
        { path: "rent-analytics", element: <OwnerRentAnalytics /> },
        { path: "security-deposits", element: <OwnerSecurityDeposit /> }
      ]
    },
    {
      path: "/tenant",
      element: (
        <ProtectedRoute requiredRole="TENANT">
          <SidebarLayout role="TENANT" />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <TenantHome /> },
        { path: "home", element: <TenantHome /> },
        { path: "profile", element: <TenantProfile /> },
        { path: "bills", element: <TenantBills /> },
        { path: "maintenance", element: <TenantMaintenance /> },
        { path: "concierge", element: <TenantServiceBooking /> },
        { path: "notices", element: <TenantNoticeBoard /> },
        { path: "payment-history", element: <TenantPaymentHistory /> },
        { path: "vault", element: <TenantVault /> }
      ]
    },
    { path: "/", element: <LoginPage /> },
    { path: "*", element: <LoginPage /> }
  ]);
  return element;
}