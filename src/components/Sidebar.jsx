import { Mic2, History, User, LogOut } from "lucide-react";

export default function Sidebar({
  activePage = "analyse",
  onNavigate,
  user,
  onLogout,
  isOpen,
  onClose,
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
    <>
      <aside
        className={`w-[240px] h-screen fixed left-0 top-0 bg-[#0f0f0f] border-r border-[#222] text-white flex flex-col justify-between box-border transition-transform duration-300 ease-in-out z-[45] md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          className="sidebar-close absolute top-3 right-3 bg-transparent text-white text-[1.2rem] border-none cursor-pointer p-2 md:hidden"
          onClick={onClose}
        >
          ×
        </button>

        <div>
          <div className="p-[28px_24px] border-b border-[#1c1c1c]">
            <div className="text-[28px] font-bold tracking-[0.5px]">
              SER
            </div>

            <div className="mt-1.5 text-[13px] text-[#9ca3af] leading-[1.5]">
              Speech Emotion Recognition
            </div>
          </div>

          <div className="pt-4.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activePage === item.key;

              return (
                <div
                  key={item.key}
                  onClick={() => {
                    onNavigate?.(item.key);
                    onClose?.();
                  }}
                  className={`flex items-center gap-3 p-[14px_22px] cursor-pointer select-none transition-all duration-200 border-l-3 ${
                    active
                      ? "border-l-[#6366f1] bg-[#1a1a1a]"
                      : "border-l-transparent bg-transparent hover:bg-[#171717]"
                  }`}
                >
                  <Icon size={19} />

                  <span
                    className={`text-[15px] ${
                      active ? "font-semibold" : "font-medium"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-[#1c1c1c] p-4.5">
          <div className="flex items-center gap-3">
            {user?.picture ? (
              <img
                src={user.picture}
                alt="Profile"
                className="w-9 h-9 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#222] flex items-center justify-center shrink-0">
                <User
                  size={18}
                  color="#cfcfcf"
                />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div
                title={userName}
                className="text-sm font-semibold whitespace-nowrap overflow-hidden text-ellipsis"
              >
                {userName}
              </div>

              <div className="inline-block mt-1 padding-[2px_8px] px-2 py-0.5 rounded-full text-[11px] bg-[#1c1c1c] text-[#bdbdbd]">
                {userType}
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="mt-4.5 w-full flex items-center justify-center gap-2 bg-transparent border border-[#2a2a2a] text-[#cfcfcf] p-[10px_12px] rounded-log rounded-grow rounded-md cursor-pointer transition-all duration-200 text-sm hover:bg-[#2b1616] hover:text-[#ef4444]"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}