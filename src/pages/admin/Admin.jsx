import { useState } from "react";
import BarberManager from "./BarberManager";
import AppointmentManager from "./AppointmentManager";

export default function Admin() {
  const [tab, setTab] = useState("appointments");

  const menuItems = [
    { id: "appointments", label: "Lịch hẹn", icon: "📅" },
    { id: "barbers", label: "Thợ cắt tóc", icon: "✂️" },
  ];

  return (
    <div className="min-h-screen pt-20 bg-zinc-950 text-white flex">
      {/* SIDEBAR */}
      <aside className="w-56 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-[#d4a441]">Dashboard</h2>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                ${
                  tab === item.id
                    ? "bg-[#d4a441] text-black shadow-lg"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 overflow-auto">
        {tab === "barbers" && <BarberManager />}
        {tab === "appointments" && <AppointmentManager />}
      </main>
    </div>
  );
}
