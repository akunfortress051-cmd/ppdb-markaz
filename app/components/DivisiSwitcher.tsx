"use client";

import { useDivisi } from "@/app/providers/DivisiProvider";
import { useSession } from "next-auth/react";

export default function DivisiSwitcher() {
  const { activeDivisi, setActiveDivisi, availableDivisi, isLoading } = useDivisi();
  const { data: session } = useSession();

  // If user is locked to a divisi, do not show switcher
  const userDivisiId = (session?.user as any)?.divisiId;
  if (userDivisiId) return null;

  if (isLoading || availableDivisi.length === 0) return null;

  return (
    <div className="flex items-center gap-2 mr-4 bg-dark-900 border border-gold-500/20 rounded-xl p-1">
      {availableDivisi.map((divisi) => (
        <button
          key={divisi.id}
          onClick={() => setActiveDivisi(divisi)}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeDivisi?.id === divisi.id
              ? `bg-${divisi.warna}-500/20 text-${divisi.warna}-500 border border-${divisi.warna}-500/30`
              : "text-gray-500 hover:text-gray-300 hover:bg-dark-800 border border-transparent"
          }`}
          style={
            activeDivisi?.id === divisi.id && !['gold', 'gray', 'emerald', 'blue', 'red'].includes(divisi.warna)
              ? { backgroundColor: `${divisi.warna}33`, color: divisi.warna, borderColor: `${divisi.warna}55` }
              : {}
          }
        >
          {divisi.nama}
        </button>
      ))}
    </div>
  );
}
