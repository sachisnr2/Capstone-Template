import { useState, useEffect } from "react";
import {
  LayoutDashboard, Settings, ClipboardList, Search, CheckSquare,
  AlertTriangle, BarChart2, ThumbsUp, Bell, ChevronDown, Eye, EyeOff,
  RefreshCw, Activity, Wrench, TrendingUp, Shield, LogOut, User,
  Menu, X, Circle
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

// ─── Design Tokens ───────────────────────────────────────────────────────────
const C = {
  bg:       "#0A0F1E",
  surface:  "#111827",
  elevated: "#1F2937",
  border:   "#374151",
  blue:     "#0EA5E9",
  green:    "#10B981",
  amber:    "#F59E0B",
  red:      "#EF4444",
  text:     "#F9FAFB",
  muted:    "#9CA3AF",
  subtle:   "#6B7280",
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
const maintenanceTrendData = [
  { week: "W1",  planned: 12, unplanned: 3  },
  { week: "W2",  planned: 15, unplanned: 5  },
  { week: "W3",  planned: 11, unplanned: 2  },
  { week: "W4",  planned: 18, unplanned: 7  },
  { week: "W5",  planned: 14, unplanned: 4  },
  { week: "W6",  planned: 20, unplanned: 6  },
  { week: "W7",  planned: 16, unplanned: 3  },
  { week: "W8",  planned: 22, unplanned: 8  },
  { week: "W9",  planned: 19, unplanned: 5  },
  { week: "W10", planned: 25, unplanned: 4  },
  { week: "W11", planned: 21, unplanned: 6  },
  { week: "W12", planned: 28, unplanned: 9  },
];

const equipmentStatusData = [
  { name: "Operational", value: 189, color: C.green },
  { name: "Maintenance",  value: 41,  color: C.amber },
  { name: "Down",         value: 17,  color: C.red   },
];

const upcomingMaintenance = [
  { id: "EQ-0041", asset: "HP Compressor A3",   type: "Rotating",   due: "2025-07-02", priority: "Critical" },
  { id: "EQ-0117", asset: "Flare Stack Unit 2", type: "Process",    due: "2025-07-05", priority: "High"     },
  { id: "EQ-0089", asset: "Cooling Tower CT-1", type: "Utilities",  due: "2025-07-09", priority: "Medium"   },
  { id: "EQ-0203", asset: "Valve Train VT-07",  type: "Instrument", due: "2025-07-14", priority: "Low"      },
  { id: "EQ-0058", asset: "Pump Station PS-4",  type: "Rotating",   due: "2025-07-17", priority: "High"     },
];

const recentAlerts = [
  { time: "09:14",  type: "Pressure Spike",      equipment: "EQ-0041 · HP Compressor A3",   severity: "Critical" },
  { time: "08:52",  type: "Temp Threshold",       equipment: "EQ-0117 · Flare Stack Unit 2", severity: "High"     },
  { time: "08:31",  type: "Vibration Anomaly",    equipment: "EQ-0089 · Cooling Tower CT-1", severity: "Medium"   },
  { time: "07:48",  type: "Flow Rate Deviation",  equipment: "EQ-0022 · Pump Station PS-2",  severity: "High"     },
  { time: "07:15",  type: "Valve Position Error", equipment: "EQ-0203 · Valve Train VT-07",  severity: "Low"      },
];

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard",   key: "dashboard"   },
  { icon: Settings,        label: "Equipment",   key: "equipment"   },
  { icon: ClipboardList,   label: "Work Orders", key: "workorders"  },
  { icon: Search,          label: "Inspect",     key: "inspect"     },
  { icon: CheckSquare,     label: "Comply",      key: "comply"      },
  { icon: AlertTriangle,   label: "Incidents",   key: "incidents"   },
  { icon: BarChart2,       label: "Analytics",   key: "analytics"   },
  { icon: ThumbsUp,        label: "Approvals",   key: "approvals"   },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function PriorityBadge({ level }) {
  const map = {
    Critical: { bg: "#450a0a", color: C.red,   border: "#7f1d1d" },
    High:     { bg: "#451a03", color: C.amber, border: "#78350f" },
    Medium:   { bg: "#052e16", color: C.green, border: "#14532d" },
    Low:      { bg: "#0c1a2e", color: C.blue,  border: "#1e3a5f" },
  };
  const s = map[level] || map.Low;
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 600,
      letterSpacing: "0.04em", textTransform: "uppercase", fontFamily: "monospace"
    }}>{level}</span>
  );
}

function SeverityDot({ level }) {
  const colors = { Critical: C.red, High: C.amber, Medium: C.amber, Low: C.blue };
  return <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: colors[level] || C.muted, marginRight: 6 }} />;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 14px" }}>
      <p style={{ color: C.muted, fontSize: 12, margin: "0 0 6px", fontFamily: "monospace" }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color, fontSize: 13, margin: "2px 0", fontFamily: "monospace" }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

// ─── PAGE 1: Login ────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 1200);
  };

  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      backgroundImage: `radial-gradient(ellipse 80% 60% at 50% -20%, rgba(14,165,233,0.08) 0%, transparent 60%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter', system-ui, sans-serif"
    }}>
      {/* Grid pattern overlay */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        backgroundImage: `linear-gradient(${C.border}18 1px, transparent 1px), linear-gradient(90deg, ${C.border}18 1px, transparent 1px)`,
        backgroundSize: "40px 40px"
      }} />

      <div style={{
        width: 420, background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 12, padding: "40px 36px", position: "relative",
        boxShadow: `0 0 0 1px ${C.border}, 0 24px 64px rgba(0,0,0,0.6)`
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <svg width="52" height="58" viewBox="0 0 52 58" fill="none">
              <path d="M26 2L50 16V42L26 56L2 42V16L26 2Z" fill={`${C.blue}18`} stroke={C.blue} strokeWidth="1.5"/>
              <path d="M26 10L20 22H32L26 10Z" fill="none" stroke={C.blue} strokeWidth="1.2"/>
              <rect x="20" y="22" width="12" height="16" rx="1" fill="none" stroke={C.blue} strokeWidth="1.2"/>
              <path d="M23 30h6M23 34h6" stroke={C.blue} strokeWidth="1" strokeLinecap="round"/>
              <circle cx="26" cy="27" r="2" fill={C.blue} fillOpacity="0.8"/>
            </svg>
          </div>
          <h1 style={{ color: C.text, fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>
            Safe<span style={{ color: C.blue }}>Ops</span>
          </h1>
          <p style={{ color: C.subtle, fontSize: 12, margin: "6px 0 0", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "monospace" }}>
            Equipment &amp; Safety Intelligence
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: C.border, marginBottom: 28 }} />

        <p style={{ color: C.muted, fontSize: 13, marginBottom: 24 }}>Sign in to your workspace</p>

        {/* Email */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ color: C.muted, fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Email Address</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="operator@ncdmb.gov.ng"
            style={{
              width: "100%", background: C.elevated, border: `1px solid ${C.border}`,
              borderRadius: 6, padding: "10px 14px", color: C.text, fontSize: 14,
              outline: "none", boxSizing: "border-box", fontFamily: "inherit",
              transition: "border-color 0.15s"
            }}
            onFocus={e => e.target.style.borderColor = C.blue}
            onBlur={e => e.target.style.borderColor = C.border}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ color: C.muted, fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Password</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: "100%", background: C.elevated, border: `1px solid ${C.border}`,
                borderRadius: 6, padding: "10px 42px 10px 14px", color: C.text, fontSize: 14,
                outline: "none", boxSizing: "border-box", fontFamily: "inherit",
                transition: "border-color 0.15s"
              }}
              onFocus={e => e.target.style.borderColor = C.blue}
              onBlur={e => e.target.style.borderColor = C.border}
            />
            <button
              onClick={() => setShowPw(!showPw)}
              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.subtle, padding: 0, display: "flex" }}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Remember + Forgot */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: C.muted, fontSize: 13 }}>
            <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
              style={{ accentColor: C.blue, width: 14, height: 14 }}
            />
            Remember me
          </label>
          <button style={{ background: "none", border: "none", color: C.blue, fontSize: 13, cursor: "pointer", padding: 0 }}>
            Forgot Password?
          </button>
        </div>

        {/* Sign In Button */}
        <button
          onClick={handleSubmit}
          style={{
            width: "100%", background: C.blue, border: "none", borderRadius: 6,
            padding: "11px 0", color: "#fff", fontSize: 14, fontWeight: 600,
            cursor: "pointer", letterSpacing: "0.03em", transition: "opacity 0.15s, transform 0.1s",
            fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8
          }}
          onMouseEnter={e => { e.target.style.opacity = "0.9"; e.target.style.transform = "scale(1.01)"; }}
          onMouseLeave={e => { e.target.style.opacity = "1"; e.target.style.transform = "scale(1)"; }}
        >
          {loading ? <><RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> Authenticating...</> : "Sign In"}
        </button>

        <p style={{ color: C.subtle, fontSize: 11, textAlign: "center", marginTop: 20, letterSpacing: "0.04em" }}>
          NCDMB SafeOps v2.4 · Restricted Access
        </p>
      </div>

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}

// ─── PAGE 2 & 3: App Shell + Dashboard ───────────────────────────────────────
function AppShell({ onLogout }) {
  const [active, setActive]         = useState("dashboard");
  const [sidebarOpen, setSidebar]   = useState(true);
  const [now, setNow]               = useState(new Date());
  const [pulse, setPulse]           = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dropdownOpen, setDropdown] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    const p = setInterval(() => setPulse(x => !x), 800);
    return () => { clearInterval(t); clearInterval(p); };
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const dateStr = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div style={{ display: "flex", height: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, sans-serif", overflow: "hidden" }}>

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside style={{
        width: sidebarOpen ? 240 : 0, minWidth: sidebarOpen ? 240 : 0,
        background: C.surface, borderRight: `1px solid ${C.border}`,
        display: "flex", flexDirection: "column", transition: "width 0.2s, min-width 0.2s",
        overflow: "hidden", flexShrink: 0
      }}>
        {/* Branding */}
        <div style={{ padding: "20px 20px 16px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="28" height="32" viewBox="0 0 52 58" fill="none" style={{ flexShrink: 0 }}>
              <path d="M26 2L50 16V42L26 56L2 42V16L26 2Z" fill={`${C.blue}18`} stroke={C.blue} strokeWidth="2"/>
              <path d="M26 10L20 22H32L26 10Z" fill="none" stroke={C.blue} strokeWidth="1.5"/>
              <rect x="20" y="22" width="12" height="16" rx="1" fill="none" stroke={C.blue} strokeWidth="1.5"/>
              <circle cx="26" cy="27" r="2" fill={C.blue}/>
            </svg>
            <div>
              <p style={{ color: C.text, fontSize: 16, fontWeight: 700, margin: 0, letterSpacing: "-0.01em" }}>
                Safe<span style={{ color: C.blue }}>Ops</span>
              </p>
              <p style={{ color: C.subtle, fontSize: 9, margin: 0, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "monospace" }}>NCDMB Platform</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 0", overflowY: "auto" }}>
          <p style={{ color: C.subtle, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", padding: "0 20px", marginBottom: 8, fontFamily: "monospace" }}>Operations</p>
          {navItems.map(({ icon: Icon, label, key }) => {
            const isActive = active === key;
            return (
              <button
                key={key}
                onClick={() => setActive(key)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 12,
                  padding: "9px 20px", background: isActive ? `${C.blue}14` : "none",
                  borderLeft: isActive ? `2px solid ${C.blue}` : "2px solid transparent",
                  border: "none", cursor: "pointer", color: isActive ? C.blue : C.muted,
                  fontSize: 13, fontWeight: isActive ? 600 : 400, textAlign: "left",
                  transition: "background 0.15s, color 0.15s", fontFamily: "inherit",
                  whiteSpace: "nowrap"
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = `${C.border}40`; e.currentTarget.style.color = C.text; } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.muted; } }}
              >
                <Icon size={16} style={{ flexShrink: 0 }} />
                {label}
                {key === "approvals" && (
                  <span style={{ marginLeft: "auto", background: C.amber, color: "#000", borderRadius: 10, padding: "1px 6px", fontSize: 10, fontWeight: 700 }}>4</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User footer */}
        <div style={{ padding: "12px 20px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${C.blue}22`, border: `1px solid ${C.blue}44`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <User size={14} color={C.blue} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: C.text, fontSize: 12, fontWeight: 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Usman Ibrahim</p>
              <p style={{ color: C.subtle, fontSize: 10, margin: 0, fontFamily: "monospace" }}>Plant Manager</p>
            </div>
            <button onClick={onLogout} style={{ background: "none", border: "none", cursor: "pointer", color: C.subtle, padding: 4 }}
              title="Sign out">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Top Navbar */}
        <header style={{
          height: 56, background: C.surface, borderBottom: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", padding: "0 20px", gap: 16, flexShrink: 0
        }}>
          <button
            onClick={() => setSidebar(!sidebarOpen)}
            style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, display: "flex", padding: 4 }}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* Search */}
          <div style={{ flex: 1, maxWidth: 400, position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.subtle }} />
            <input
              placeholder="Search equipment, work orders..."
              style={{
                width: "100%", background: C.elevated, border: `1px solid ${C.border}`,
                borderRadius: 6, padding: "7px 14px 7px 34px", color: C.text, fontSize: 13,
                outline: "none", boxSizing: "border-box", fontFamily: "inherit",
                transition: "border-color 0.15s"
              }}
              onFocus={e => e.target.style.borderColor = C.blue}
              onBlur={e => e.target.style.borderColor = C.border}
            />
          </div>

          <div style={{ flex: 1 }} />

          {/* Notification Bell */}
          <div style={{ position: "relative" }}>
            <button style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px 10px", cursor: "pointer", color: C.muted, display: "flex" }}>
              <Bell size={16} />
            </button>
            <span style={{
              position: "absolute", top: -4, right: -4,
              background: C.red, color: "#fff", borderRadius: 10,
              fontSize: 10, fontWeight: 700, padding: "1px 5px", minWidth: 16, textAlign: "center",
              border: `1.5px solid ${C.surface}`, fontFamily: "monospace"
            }}>3</span>
          </div>

          {/* Profile */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setDropdown(!dropdownOpen)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                background: C.elevated, border: `1px solid ${C.border}`,
                borderRadius: 6, padding: "5px 12px", cursor: "pointer", color: C.text, fontSize: 13
              }}
            >
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: `${C.blue}22`, border: `1px solid ${C.blue}44`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <User size={12} color={C.blue} />
              </div>
              <span style={{ fontFamily: "inherit" }}>UI Ibrahim</span>
              <ChevronDown size={12} color={C.subtle} />
            </button>
            {dropdownOpen && (
              <div style={{
                position: "absolute", right: 0, top: "calc(100% + 6px)",
                background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 8,
                minWidth: 180, zIndex: 50, overflow: "hidden"
              }}>
                {["Profile Settings", "Notification Prefs", "Help & Support"].map(item => (
                  <button key={item} onClick={() => setDropdown(false)} style={{
                    width: "100%", display: "block", background: "none", border: "none",
                    color: C.muted, fontSize: 13, padding: "9px 16px", cursor: "pointer",
                    textAlign: "left", fontFamily: "inherit",
                    transition: "background 0.1s, color 0.1s"
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = C.surface; e.currentTarget.style.color = C.text; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.muted; }}
                  >{item}</button>
                ))}
                <div style={{ height: 1, background: C.border, margin: "4px 0" }} />
                <button onClick={onLogout} style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 8,
                  background: "none", border: "none", color: C.red, fontSize: 13,
                  padding: "9px 16px", cursor: "pointer", textAlign: "left", fontFamily: "inherit"
                }}>
                  <LogOut size={13} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* ── Dashboard Content ───────────────────────────────────── */}
        <main style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Header Row */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <h1 style={{ color: C.text, fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>Overview Dashboard</h1>
              <p style={{ color: C.subtle, fontSize: 12, margin: "4px 0 0", fontFamily: "monospace", letterSpacing: "0.04em" }}>{dateStr.toUpperCase()}</p>
            </div>
            <button
              onClick={handleRefresh}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6,
                padding: "8px 14px", color: C.muted, fontSize: 13, cursor: "pointer",
                fontFamily: "inherit", transition: "border-color 0.15s, color 0.15s, transform 0.1s"
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.color = C.blue; e.currentTarget.style.transform = "scale(1.02)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; e.currentTarget.style.transform = "scale(1)"; }}
            >
              <RefreshCw size={13} style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {/* ── KPI Cards ──────────────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {[
              {
                label: "Total Equipment", value: "247", sub: "+3 this month",
                icon: <Settings size={18} color={C.blue} />, accent: C.blue,
                tag: "EQ-FLEET-001"
              },
              {
                label: "Active Work Orders", value: "18", sub: "6 due today",
                icon: <ClipboardList size={18} color={C.amber} />, accent: C.amber,
                tag: "WO-ACTIVE"
              },
              {
                label: "Compliance Rate", value: "94.2%", sub: "▲ 1.8% vs last week",
                icon: <CheckSquare size={18} color={C.green} />, accent: C.green,
                tag: "HSE-SCORE"
              },
              {
                label: "Critical Alerts", value: "7", sub: "3 unacknowledged",
                icon: <AlertTriangle size={18} color={C.red} />, accent: C.red,
                tag: "ALT-CRIT", pulsing: true
              },
            ].map(({ label, value, sub, icon, accent, tag, pulsing }) => (
              <div
                key={label}
                style={{
                  background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
                  padding: "18px 20px", cursor: "default",
                  transition: "transform 0.15s, border-color 0.15s, box-shadow 0.15s",
                  borderTop: `2px solid ${accent}`,
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.025)"; e.currentTarget.style.borderTopColor = accent; e.currentTarget.style.boxShadow = `0 0 0 1px ${accent}22`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <p style={{ color: C.muted, fontSize: 11, margin: 0, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {pulsing && (
                      <span style={{
                        width: 8, height: 8, borderRadius: "50%", background: C.red, display: "inline-block",
                        boxShadow: pulse ? `0 0 0 4px ${C.red}40` : "none",
                        transition: "box-shadow 0.4s"
                      }} />
                    )}
                    {icon}
                  </div>
                </div>
                <p style={{ color: C.text, fontSize: 32, fontWeight: 700, margin: "0 0 6px", letterSpacing: "-0.03em", fontFamily: "monospace" }}>{value}</p>
                <p style={{ color: C.subtle, fontSize: 11, margin: "0 0 10px", fontFamily: "monospace" }}>{sub}</p>
                <p style={{ color: `${accent}88`, fontSize: 9, margin: 0, fontFamily: "monospace", letterSpacing: "0.08em" }}>{tag}</p>
              </div>
            ))}
          </div>

          {/* ── Charts Row ─────────────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 16 }}>
            {/* Donut Chart */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "20px 20px 12px" }}>
              <div style={{ marginBottom: 16 }}>
                <p style={{ color: C.text, fontSize: 13, fontWeight: 600, margin: 0 }}>Equipment Status Distribution</p>
                <p style={{ color: C.subtle, fontSize: 11, margin: "3px 0 0", fontFamily: "monospace" }}>247 units · live snapshot</p>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={equipmentStatusData}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={88}
                    paddingAngle={3} dataKey="value"
                    strokeWidth={0}
                  >
                    {equipmentStatusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 6, fontFamily: "monospace", fontSize: 12 }}
                    itemStyle={{ color: C.text }}
                    labelStyle={{ color: C.muted }}
                  />
                  <Legend
                    formatter={(value, entry) => (
                      <span style={{ color: C.muted, fontSize: 12 }}>{value} <strong style={{ color: C.text }}>{entry.payload.value}</strong></span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Line Chart */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "20px 20px 12px" }}>
              <div style={{ marginBottom: 16 }}>
                <p style={{ color: C.text, fontSize: 13, fontWeight: 600, margin: 0 }}>Maintenance Trend</p>
                <p style={{ color: C.subtle, fontSize: 11, margin: "3px 0 0", fontFamily: "monospace" }}>Planned vs Unplanned · last 12 weeks</p>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={maintenanceTrendData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke={`${C.border}80`} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="week" tick={{ fill: C.subtle, fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: C.subtle, fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="planned" stroke={C.blue} strokeWidth={2} dot={false} name="Planned" />
                  <Line type="monotone" dataKey="unplanned" stroke={C.amber} strokeWidth={2} dot={false} strokeDasharray="4 3" name="Unplanned" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── Tables Row ─────────────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Upcoming Maintenance */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={{ color: C.text, fontSize: 13, fontWeight: 600, margin: 0 }}>Upcoming Maintenance</p>
                  <p style={{ color: C.subtle, fontSize: 11, margin: "2px 0 0", fontFamily: "monospace" }}>Next 30 days · {upcomingMaintenance.length} items</p>
                </div>
                <Wrench size={15} color={C.subtle} />
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    {["Asset", "Type", "Due Date", "Priority"].map(h => (
                      <th key={h} style={{ color: C.subtle, fontWeight: 500, padding: "8px 12px", textAlign: "left", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {upcomingMaintenance.map((row, i) => (
                    <tr key={i} style={{ borderBottom: i < upcomingMaintenance.length - 1 ? `1px solid ${C.border}40` : "none", transition: "background 0.1s" }}
                      onMouseEnter={e => e.currentTarget.style.background = `${C.border}20`}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <td style={{ padding: "9px 12px" }}>
                        <p style={{ color: C.text, margin: 0, fontSize: 12, fontWeight: 500 }}>{row.asset}</p>
                        <p style={{ color: C.subtle, margin: 0, fontSize: 10, fontFamily: "monospace" }}>{row.id}</p>
                      </td>
                      <td style={{ padding: "9px 12px", color: C.muted, fontFamily: "monospace", fontSize: 11 }}>{row.type}</td>
                      <td style={{ padding: "9px 12px", color: C.muted, fontFamily: "monospace", fontSize: 11 }}>{row.due}</td>
                      <td style={{ padding: "9px 12px" }}><PriorityBadge level={row.priority} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Recent Alerts */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={{ color: C.text, fontSize: 13, fontWeight: 600, margin: 0 }}>Recent Alerts</p>
                  <p style={{ color: C.subtle, fontSize: 11, margin: "2px 0 0", fontFamily: "monospace" }}>Today · {recentAlerts.length} events</p>
                </div>
                <Activity size={15} color={C.subtle} />
              </div>
              <div style={{ padding: "8px 0" }}>
                {recentAlerts.map((alert, i) => (
                  <div key={i}
                    style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 16px", transition: "background 0.1s", cursor: "default" }}
                    onMouseEnter={e => e.currentTarget.style.background = `${C.border}20`}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <div style={{ paddingTop: 3 }}>
                      <SeverityDot level={alert.severity} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                        <p style={{ color: C.text, fontSize: 12, fontWeight: 600, margin: 0 }}>{alert.type}</p>
                        <PriorityBadge level={alert.severity} />
                      </div>
                      <p style={{ color: C.subtle, fontSize: 11, margin: 0, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{alert.equipment}</p>
                    </div>
                    <p style={{ color: C.subtle, fontSize: 10, margin: 0, fontFamily: "monospace", flexShrink: 0 }}>{alert.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </main>
      </div>

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        * { scrollbar-width: thin; scrollbar-color: #374151 transparent; }
        *::-webkit-scrollbar { width: 4px; }
        *::-webkit-scrollbar-thumb { background: #374151; border-radius: 4px; }
        *::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function SafeOps() {
  const [page, setPage] = useState("login");

  return page === "login"
    ? <LoginPage onLogin={() => setPage("app")} />
    : <AppShell onLogout={() => setPage("login")} />;
}
