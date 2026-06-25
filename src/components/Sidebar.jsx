import { Mic2, History, User, LogOut } from "lucide-react";

export default function Sidebar({
  activePage = "analyse",
  onNavigate,
  user,
  onLogout,
}) {
  const navItems = [
    {
      key: "analyse",
      label: "Analyse",
      icon: Mic2,
    },
    {
      key: "history",
      label: "History",
      icon: History,
    },
  ];

  const userName = user?.name || "Guest";
  const userType =
    user?.user_type === "google" ? "Google" : "Guest";

  return (
    <aside
      style={{
        width: 240,
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        background: "#0f0f0f",
        borderRight: "1px solid #222",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
      }}
    >
      <div>
        <div
          style={{
            padding: "28px 24px",
            borderBottom: "1px solid #1c1c1c",
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: "0.5px",
            }}
          >
            SER
          </div>

          <div
            style={{
              marginTop: 6,
              fontSize: 13,
              color: "#9ca3af",
              lineHeight: 1.5,
            }}
          >
            Speech Emotion Recognition
          </div>
        </div>

        <div
          style={{
            paddingTop: 18,
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activePage === item.key;

            return (
              <div
                key={item.key}
                onClick={() => onNavigate?.(item.key)}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "#171717";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 22px",
                  cursor: "pointer",
                  userSelect: "none",
                  transition: "all 0.2s ease",
                  borderLeft: active
                    ? "3px solid #6366f1"
                    : "3px solid transparent",
                  background: active ? "#1a1a1a" : "transparent",
                }}
              >
                <Icon size={19} />

                <span
                  style={{
                    fontSize: 15,
                    fontWeight: active ? 600 : 500,
                  }}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div
        style={{
          borderTop: "1px solid #1c1c1c",
          padding: 18,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          {user?.picture ? (
            <img
              src={user.picture}
              alt="Profile"
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "#222",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <User size={18} color="#cfcfcf" />
            </div>
          )}

          <div
            style={{
              minWidth: 0,
              flex: 1,
            }}
          >
            <div
              title={userName}
              style={{
                fontSize: 14,
                fontWeight: 600,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {userName}
            </div>

            <div
              style={{
                display: "inline-block",
                marginTop: 4,
                padding: "2px 8px",
                borderRadius: 999,
                fontSize: 11,
                background: "#1c1c1c",
                color: "#bdbdbd",
              }}
            >
              {userType}
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#2b1616";
            e.currentTarget.style.color = "#ef4444";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#cfcfcf";
          }}
          style={{
            marginTop: 18,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            background: "transparent",
            border: "1px solid #2a2a2a",
            color: "#cfcfcf",
            padding: "10px 12px",
            borderRadius: 8,
            cursor: "pointer",
            transition: "all 0.2s ease",
            fontSize: 14,
          }}
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
