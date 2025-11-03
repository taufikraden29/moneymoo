import { useNavigate } from "react-router-dom";

export default function MobileNav({ 
  activeSection, 
  setActiveSection, 
  setAddModalOpen,
  setShowFilters
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
                className={`flex flex-col items-center p-2 rounded-lg transition-colors min-w-0 flex-1 mx-1 ${
                  item.primary
                    ? "bg-blue-600 text-white"
                    : activeSection === item.id
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600"
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
              className={`flex flex-col items-center p-2 rounded-lg transition-colors min-w-0 flex-1 ${
                activeSection === item.id
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600"
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