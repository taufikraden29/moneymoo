import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../services/authService";

export default function MobileNav({ 
  activeSection, 
  setActiveSection, 
  setAddModalOpen,
  setShowFilters,
  setShowCalculator
}) {
  const navigate = useNavigate();
  
  const navItems = [
    { id: "overview", icon: "📊", label: "Overview" },
    { id: "accounts", icon: "💳", label: "Akun" },
    {
      id: "utang",
      icon: "💸",
      label: "Hutang",
      action: () => navigate("/utang"),
    },
    {
      id: "add",
      icon: "➕",
      label: "Tambah",
      action: () => setAddModalOpen(true),
      primary: true,
    },
    { id: "transactions", icon: "📋", label: "Transaksi" },
    {
      id: "filters",
      icon: "🔍",
      label: "Filter",
      action: () => setShowFilters(prev => !prev),
    },
    {
      id: "logout",
      icon: "🚪",
      label: "Logout",
      action: async () => {
        try {
          await logoutUser();
          navigate("/", { replace: true });
        } catch (error) {
          console.error("Logout error:", error);
        }
      },
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden safe-area-inset-bottom">
      <div className="flex justify-around items-center p-2">
        {navItems.map((item) => {
          if (item.action) {
            return (
              <button
                key={item.id}
                onClick={item.action}
                className={`flex flex-col items-center p-3 rounded-lg transition-colors min-w-0 flex-1 mx-1 ${
                  item.primary
                    ? "bg-blue-600 text-white"
                    : activeSection === item.id
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-xs mt-1 truncate w-full text-center">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex flex-col items-center p-3 rounded-lg transition-colors min-w-0 flex-1 ${
                activeSection === item.id
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs mt-1 truncate w-full text-center">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}