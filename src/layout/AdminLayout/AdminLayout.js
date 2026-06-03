import React, { useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import styles from "./AdminLayout.module.css";
import { roleLabel, ROLES } from "../../app/auth/auth";
import { useAuth } from "../../app/auth/AuthProvider";

function Icon({ name }) {
  const map = {
    dashboard: "▦",
    users: "👤",
    request: "📝",
    profile: "⚙",
    services: "📋",
    quotes: "💬",
    compose: "✎",
    history: "📤",
    command: "🚨",
    control: "🛡",
    logout: "↩",
    menu: "☰",
  };
  return (
    <span className={styles.icon} aria-hidden="true">
      {map[name] || "•"}
    </span>
  );
}

function NavItem({ to, icon, label, onClick, end }) {
  return (
    <NavLink
      end={end}
      to={to}
      className={({ isActive }) => (isActive ? styles.navItemActive : styles.navItem)}
      onClick={onClick}
    >
      <Icon name={icon} />
      <span>{label}</span>
    </NavLink>
  );
}

export default function AdminLayout() {
  const { auth, logout, stopImpersonating, isImpersonating } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const nav = useMemo(() => {
    const role = auth?.role;
    if (role === ROLES.SUPER_ADMIN) {
      return [
        { to: "/dashboard", icon: "dashboard", label: "Dashboard" },
        { to: "/super-admin/admin-control", icon: "control", label: "Admin Control" },
        { to: "/super-admin/users", icon: "users", label: "Users" },
        { to: "/super-admin/users/new", icon: "compose", label: "Create user" },
        { to: "/roadside/requests", icon: "request", label: "Roadside (oversight)" },
        { to: "/insurance/quotes", icon: "quotes", label: "Insurance (oversight)" },
        { to: "/support/command-center", icon: "command", label: "Support (oversight)" },
      ];
    }

    if (role === ROLES.ROAD_ASSIST_AGENT) {
      return [
        { to: "/dashboard", icon: "dashboard", label: "Dashboard" },
        { to: "/roadside/requests", icon: "request", label: "Assistance Requests" },
        { to: "/roadside/profile", icon: "profile", label: "My Profile" },
        { to: "/roadside/services", icon: "services", label: "Services Listing" },
      ];
    }

    if (role === ROLES.INSURANCE_AGENT) {
      return [
        { to: "/dashboard", icon: "dashboard", label: "Dashboard" },
        { to: "/insurance/quotes", icon: "quotes", label: "Quote requests" },
        { to: "/insurance/quotes/compose", icon: "compose", label: "Compose" },
        { to: "/insurance/quotes/sent", icon: "history", label: "Sent quotes" },
        { to: "/insurance/profile", icon: "profile", label: "My Profile" },
      ];
    }

    if (role === ROLES.SUPPORT_AGENT) {
      return [
        { to: "/dashboard", icon: "dashboard", label: "Dashboard" },
        { to: "/support/command-center", icon: "command", label: "Command Center" },
      ];
    }

    return [{ to: "/dashboard", icon: "dashboard", label: "Dashboard" }];
  }, [auth?.role]);

  const title = useMemo(() => {
    const p = location.pathname;
    if (p === "/super-admin/users/new") return "Create user";
    if (p.includes("/super-admin/users/") && p.endsWith("/edit")) return "Update user";
    const onlyUser = p.match(/^\/super-admin\/users\/([^/]+)$/);
    if (onlyUser && onlyUser[1] !== "new") return "User details";
    if (p.startsWith("/insurance/quotes/compose")) return "Compose quote";
    if (p.startsWith("/insurance/quotes/sent")) return "Sent quotes";
    if (p.startsWith("/support/command-center")) return "Support Agent Command Center";
    if (p.startsWith("/super-admin/admin-control/")) return "Manage admin";
    if (p.startsWith("/super-admin/admin-control")) return "Admin Control Center";
    const match = nav.find((x) => p === x.to);
    return match?.label || "Admin";
  }, [location.pathname, nav]);

  const closeOnMobileNav = () => setSidebarOpen(false);

  const onLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const onStopImpersonating = () => {
    stopImpersonating();
    navigate("/super-admin/admin-control", { replace: true });
  };

  return (
    <div className={styles.shell}>
      <aside className={sidebarOpen ? styles.sidebarOpen : styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.logo} aria-hidden="true">
            JV
          </div>
          <div>
            <div className={styles.brandTitle}>Joy Virual Connect</div>
            <div className={styles.brandSub}>Admin Panel</div>
          </div>
        </div>

        <div className={styles.roleChip}>{roleLabel(auth?.role)}</div>
        <div className={styles.userLine}>{auth?.name || "—"}</div>

        <nav className={styles.nav}>
          {nav.map((item) => (
            <NavItem
              key={item.to}
              {...item}
              end={item.to === "/super-admin/users" || item.to === "/insurance/quotes" || item.to === "/super-admin/admin-control"}
              onClick={closeOnMobileNav}
            />
          ))}
        </nav>

        <button type="button" className={styles.logout} onClick={onLogout}>
          <Icon name="logout" />
          <span>Logout</span>
        </button>
      </aside>

      <div className={styles.content}>
        <header className={styles.topbar}>
          <button
            type="button"
            className={styles.menuBtn}
            onClick={() => setSidebarOpen((s) => !s)}
            aria-label="Toggle menu"
          >
            <Icon name="menu" />
          </button>

          <div className={styles.pageTitle}>
            <div className={styles.title}>{title}</div>
            <div className={styles.subtitle}>
              {auth?.name || "User"}
              {auth?.email ? <span className={styles.email}> · {auth.email}</span> : null}
            </div>
          </div>
        </header>

        <main className={styles.main}>
          {isImpersonating ? (
            <div className={styles.impersonationBanner}>
              <span>
                Viewing as <strong>{auth?.name}</strong> ({roleLabel(auth?.role)})
              </span>
              <button type="button" className="btn btnPrimary" onClick={onStopImpersonating}>
                Exit impersonation
              </button>
            </div>
          ) : null}
          {auth?.role === ROLES.SUPER_ADMIN && !isImpersonating ? (
            <div className={styles.oversightBanner}>
              Super Admin oversight — you have full control over all agent panels and accounts.
            </div>
          ) : null}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

