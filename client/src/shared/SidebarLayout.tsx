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
    { to: "/tenant/concierge", label: "Concierge", icon: Sparkles, badge: "Soon" },
    { to: "/tenant/vault", label: "Documents", icon: ShieldCheck }
  ];
  const links = role === "OWNER" ? ownerLinks : tenantLinks;
  return (
    <div className="min-h-screen flex overflow-hidden font-sans" style={{background: 'var(--ivory)', color: 'var(--slate-dark)'}}>
      <div className="luxury-bg" />
      { }
      <aside className="hidden md:flex w-72 flex-col relative z-20 sidebar-bg backdrop-blur-xl">
        <div className="px-8 py-8 border-b" style={{borderColor: 'var(--linen)'}}>
          <Link to={role === "OWNER" ? "/owner/dashboard" : "/tenant/home"} className="flex items-center gap-4 group">
            <div className="h-13 w-13 rounded-[1.25rem] flex items-center justify-center shadow-lg transition-all duration-500 group-hover:scale-105" style={{background: 'linear-gradient(135deg, var(--indigo-deep), var(--indigo-mid))', width: '3.25rem', height: '3.25rem'}}>
              <span className="font-bold text-xl" style={{color: '#fff', fontFamily: 'Playfair Display, Georgia, serif'}}>BR</span>
            </div>
            <div>
              <div className="serif-heading text-xl leading-none tracking-tight" style={{color: 'var(--slate-dark)'}}>Blr Rental</div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.15em] mt-1.5" style={{color: 'var(--gold)'}}>
                {role === "OWNER" ? "Property Suite" : "Resident Portal"}
              </div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {links.map((item: any) => {
            const Icon = item.icon;
            const active = location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `relative group flex items-center gap-3.5 px-4 py-3 rounded-xl text-[13px] font-medium transition-all duration-300 ${
                    isActive ? 'sidebar-active' : 'sidebar-inactive'
                  }`
                }
              >
                <Icon size={17} strokeWidth={active ? 2.2 : 1.6} />
                <span className="flex-1 tracking-wide">{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    active ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {active && !item.badge && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
                )}
              </NavLink>
            );
          })}
        </nav>
        <div className="p-5 mt-auto" style={{borderTop: '1px solid var(--linen)'}}>
          <div className="flex items-center gap-3 mb-4 px-1">
            <div className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0" style={{background: 'linear-gradient(135deg, var(--indigo-pale), #dde)', color: 'var(--indigo-deep)', border: '2px solid rgba(45,43,127,0.15)'}}>
              {user?.name ? user.name[0].toUpperCase() : <UserCircle size={20} strokeWidth={1.5} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate" style={{color: 'var(--slate-dark)'}}>{user?.name || "Member"}</div>
              <div className="text-[10px] font-medium truncate mt-0.5 uppercase tracking-wide" style={{color: 'var(--slate-light)'}}>ID: {user?.id?.slice(0, 8) || "N/A"}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[13px] font-medium transition-all duration-300"
            style={{background: 'rgba(45,43,127,0.05)', border: '1px solid rgba(45,43,127,0.10)', color: 'var(--slate)'}}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(220,50,50,0.08)'; (e.currentTarget as HTMLElement).style.color = '#c0392b'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(45,43,127,0.05)'; (e.currentTarget as HTMLElement).style.color = 'var(--slate)'; }}
          >
            <LogOut size={15} strokeWidth={1.6} />
            Sign Out
          </button>
        </div>
      </aside>
      { }
      <main className="flex-1 flex flex-col relative overflow-hidden">
        { }
        <div className="md:hidden px-5 py-4 flex justify-between items-center z-30 backdrop-blur-xl" style={{borderBottom: '1px solid var(--linen)', background: 'rgba(253,250,245,0.9)'}}>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, var(--indigo-deep), var(--indigo-mid))'}}>
              <span className="text-white font-bold text-sm" style={{fontFamily: 'Playfair Display, serif'}}>BR</span>
            </div>
            <span className="text-sm font-semibold uppercase tracking-wider" style={{color: 'var(--slate-dark)'}}>
              {role === "OWNER" ? "Management" : "My Home"}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="h-9 w-9 rounded-xl flex items-center justify-center"
            style={{background: 'rgba(45,43,127,0.07)', color: 'var(--slate)', border: '1px solid var(--linen)'}}
          >
            <LogOut size={17} strokeWidth={1.6} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 md:p-10 relative custom-scrollbar">
          <div className="max-w-6xl mx-auto w-full">
            <Outlet />
          </div>
        </div>
      </main>
      { }
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-xl flex items-center justify-center z-[100] px-4" style={{background: 'rgba(253,250,245,0.88)'}}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="glass-card max-w-sm w-full p-10 text-center luxury-shadow"
            >
              <div className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{background: 'rgba(192,57,43,0.09)', border: '1.5px solid rgba(192,57,43,0.2)', color: '#c0392b'}}>
                <LogOut size={30} strokeWidth={1.6} />
              </div>
              <h3 className="serif-heading text-3xl tracking-tight mb-2" style={{color: 'var(--slate-dark)'}}>Sign Out?</h3>
              <p className="text-sm font-light mb-8 leading-relaxed px-4" style={{color: 'var(--slate)'}}>
                Are you sure you want to end your session?
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
                  className="luxury-button-outline w-full"
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