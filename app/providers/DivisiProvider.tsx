"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSession } from "next-auth/react";

interface Divisi {
  id: string;
  nama: string;
  slug: string;
  warna: string;
}

interface DivisiContextType {
  activeDivisi: Divisi | null;
  setActiveDivisi: (divisi: Divisi | null) => void;
  availableDivisi: Divisi[];
  isLoading: boolean;
}

const DivisiContext = createContext<DivisiContextType>({
  activeDivisi: null,
  setActiveDivisi: () => {},
  availableDivisi: [],
  isLoading: true,
});

export const useDivisi = () => useContext(DivisiContext);

export const DivisiProvider = ({ children }: { children: ReactNode }) => {
  const { data: session } = useSession();
  const [activeDivisi, setActiveDivisi] = useState<Divisi | null>(null);
  const [availableDivisi, setAvailableDivisi] = useState<Divisi[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get Admin's assigned Divisi
  const userDivisiId = (session?.user as any)?.divisiId;

  useEffect(() => {
    // Fetch available divisions
    const fetchDivisi = async () => {
      try {
        const res = await fetch("/api/publik/divisi");
        if (res.ok) {
          const data = await res.json();
          setAvailableDivisi(data);
          
          if (userDivisiId) {
            // If admin is locked to a division, force that division
            const lockedDivisi = data.find((d: Divisi) => d.id === userDivisiId);
            if (lockedDivisi) {
              setActiveDivisi(lockedDivisi);
            }
          } else {
            // Super admin: load from localStorage or default to Reguler
            const savedSlug = localStorage.getItem("superadmin_selected_divisi");
            if (savedSlug) {
              const savedDivisi = data.find((d: Divisi) => d.slug === savedSlug);
              if (savedDivisi) setActiveDivisi(savedDivisi);
              else {
                const reguler = data.find((d: Divisi) => d.slug === "reguler");
                setActiveDivisi(reguler || data[0] || null);
              }
            } else {
              const reguler = data.find((d: Divisi) => d.slug === "reguler");
              setActiveDivisi(reguler || (data.length > 0 ? data[0] : null));
            }
          }
        }
      } catch (error) {
        console.error("Failed to load divisi", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDivisi();
  }, [userDivisiId]);

  // Wrap setActiveDivisi to save to localStorage if superadmin
  const handleSetActiveDivisi = (divisi: Divisi | null) => {
    if (userDivisiId) return; // Prevent changing if locked
    setActiveDivisi(divisi);
    if (divisi) {
      localStorage.setItem("superadmin_selected_divisi", divisi.slug);
    }
  };

  return (
    <DivisiContext.Provider value={{ activeDivisi, setActiveDivisi: handleSetActiveDivisi, availableDivisi, isLoading }}>
      {children}
    </DivisiContext.Provider>
  );
};
