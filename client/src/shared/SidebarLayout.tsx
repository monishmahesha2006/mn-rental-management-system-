import {
  LayoutDashboard,
  Users,
  ReceiptIndianRupee,
  ShieldCheck,
  Wrench,
  LogOut,
  UserCircle,
  ClipboardList,
  History,
  BarChart3,
  Megaphone,
  ChevronRight,
  Smile,
  ShieldAlert,
  Sparkles,
  Zap,
  Banknote
} from "lucide-react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Role = "OWNER" | "TENANT";

interface SidebarLayoutProps {
  role: Role;
  children?: React.ReactNode;
}

export function SidebarLayout({ role }: SidebarLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
  };

  const ownerLinks = [
    { to: "/owner/dashboard", label: "Overview", icon: LayoutDashboard },
    { to: "/owner/tenants", label: "Residents", icon: Users },
    { to: "/owner/notices", label: "Announcements", icon: Megaphone },
    { to: "/owner/rent-analytics", label: "Revenue", icon: BarChart3 },
    { to: "/owner/billing", label: "Billing", icon: ReceiptIndianRupee },
    { to: "/owner/maintenance", label: "Service Desk", icon: ClipboardList },
    { to: "/owner/expenses", label: "Expenses", icon: ReceiptIndianRupee },
    { to: "/owner/vendors", label: "Vendors", icon: Sparkles },
    { to: "/owner/inventory", label: "Inventory", icon: ClipboardList },
    { to: "/owner/automation", label: "Automation", icon: Zap },
    { to: "/owner/cash-approvals", label: "Approvals", icon: Banknote },
    { to: "/owner/security-deposits", label: "Deposits", icon: ShieldCheck }
  ];

  const tenantLinks = [
    { to: "/tenant/home", label: "Dashboard", icon: LayoutDashboard },
    { to: "/tenant/profile", label: "My Profile", icon: UserCircle },
    { to: "/tenant/notices", label: "Updates", icon: Megaphone },
    { to: "/tenant/bills", label: "Payments", icon: ReceiptIndianRupee },
    { to: "/tenant/payment-history", label: "History", icon: History },
    { to: "/tenant/maintenance", label: "Repairs", icon: Wrench },
    { to: "/tenant/concierge", label: "Concierge", icon: Sparkles },
    { to: "/tenant/vault", label: "Documents", icon: ShieldCheck }
  ];

  const links = role === "OWNER" ? ownerLinks : tenantLinks;

  return (
    <div className="min-h-screen flex bg-navy-950 text-pearl-50 overflow-hidden font-sans">
      <div className="luxury-bg opacity-80" />

      {/* Sidebar */}
      <aside className="hidden md:flex w-72 flex-col border-r border-gold-500/10 bg-navy-900/40 backdrop-blur-2xl relative z-20">
        <div className="px-8 py-10">
          <Link to={role === "OWNER" ? "/owner/dashboard" : "/tenant/home"} className="flex items-center gap-4 group">
            <div className="h-14 w-14 rounded-[1.25rem] bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:scale-105 luxury-glow">
              <span className="text-navy-950 font-serif text-2xl font-semibold">BR</span>
            </div>
            <div>
              <div className="serif-heading text-2xl text-pearl-50 leading-none tracking-tight">Blr Rental</div>
              <div className="text-[10px] font-medium text-gold-400 uppercase tracking-[0.15em] mt-2">
                {role === "OWNER" ? "Property Suite" : "Resident Portal"}
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {links.map((item) => {
            const Icon = item.icon;
            const active = location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `
                  relative group flex items-center gap-3.5 px-5 py-3.5 rounded-xl text-[13px] font-medium transition-all duration-300
                  ${isActive
                    ? "bg-gradient-to-br from-gold-500 to-gold-600 text-navy-950 shadow-lg luxury-glow"
                    : "text-gold-700 hover:text-gold-400 hover:bg-navy-800/50"}
                `}
              >
                <Icon size={18} strokeWidth={active ? 2 : 1.5} />
                <span className="flex-1 tracking-wide">{item.label}</span>
                {active && (
                  <div className="w-1.5 h-1.5 bg-navy-950 rounded-full animate-pulse" />
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-6 mt-auto border-t border-gold-500/10">
          <div className="flex items-center gap-4 mb-6 px-2">
            <div className="h-11 w-11 rounded-full bg-gradient-to-br from-gold-500/20 to-gold-600/20 border border-gold-500/30 flex items-center justify-center text-gold-400 overflow-hidden luxury-glow">
              {user?.name ? <span className="font-semibold text-sm">{user.name[0]}</span> : <UserCircle size={22} strokeWidth={1.5} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-pearl-50 truncate">{user?.name || "Member User"}</div>
              <div className="text-[10px] font-medium text-gold-700 truncate mt-0.5 tracking-wide uppercase">ID: {user?.id?.slice(0, 8) || "N/A"}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-[13px] font-medium bg-navy-800/50 text-gold-700 hover:bg-red-900/20 hover:text-red-400 hover:border-red-500/30 transition-all duration-300 border border-gold-500/10"
          >
            <LogOut size={16} strokeWidth={1.5} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden px-6 py-5 border-b border-gold-500/10 bg-navy-900/60 backdrop-blur-xl flex justify-between items-center z-30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center luxury-glow">
              <span className="text-navy-950 font-serif text-sm font-semibold">BR</span>
            </div>
            <span className="text-sm font-medium tracking-tight text-pearl-50 uppercase tracking-wider">
              {role === "OWNER" ? "Management" : "My Home"}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="h-10 w-10 rounded-xl bg-navy-800/50 text-gold-700 flex items-center justify-center border border-gold-500/10"
          >
            <LogOut size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-12 relative custom-scrollbar">
          <div className="max-w-6xl mx-auto w-full">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-navy-950/90 backdrop-blur-xl flex items-center justify-center z-[100] px-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="glass-card max-w-sm w-full p-12 text-center luxury-shadow"
            >
              <div className="h-20 w-20 rounded-[1.5rem] bg-red-900/20 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto mb-8 luxury-glow">
                <LogOut size={36} strokeWidth={1.5} />
              </div>
              <h3 className="serif-heading text-4xl text-pearl-50 tracking-tight mb-3">Sign Out?</h3>
              <p className="text-sm font-light text-gold-700 mb-10 leading-relaxed px-4">
                Are you sure you want to end your session? You can always return to your exclusive portal.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={confirmLogout}
                  className="luxury-button w-full py-4"
                >
                  Yes, Sign Out
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="w-full bg-navy-800/50 border border-gold-500/20 text-gold-400 font-medium py-4 rounded-xl hover:text-gold-300 hover:border-gold-500/30 transition-all text-sm uppercase tracking-wider"
                >
                  Stay Here
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
