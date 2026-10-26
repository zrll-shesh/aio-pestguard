"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { JenisKomoditas } from "@/lib/types";
import {
  KUNCI_PENYIMPANAN_BAHASA,
  formatAngka,
  formatTanggal,
  namaKomoditas,
  pilihTeks,
  terjemahKadar,
  terjemahKonten,
  type Bahasa,
  type Teks3,
} from "@/lib/i18n/bahasa";

interface NilaiKonteksBahasa {
  bahasa: Bahasa;
  setBahasa: (bahasa: Bahasa) => void;
  /** pilih teks antarmuka { id, en, ko } */
  p: (teks: Teks3) => string;
  /** terjemahkan isi data berbahasa Indonesia */
  tk: (teksIndonesia: string) => string;
  komoditas: (komoditas: JenisKomoditas) => string;
  kadar: (kadar: string) => string;
  angka: (nilai: number, digit?: number) => string;
  tanggal: (iso: string, opsi?: Intl.DateTimeFormatOptions) => string;
}

const KonteksBahasa = createContext<NilaiKonteksBahasa | null>(null);

function bacaBahasaTersimpan(): Bahasa | null {
  try {
    const nilai = window.localStorage.getItem(KUNCI_PENYIMPANAN_BAHASA);
    return nilai === "id" || nilai === "en" || nilai === "ko" ? nilai : null;
  } catch {
    return null;
  }
}

export function PenyediaBahasa({ children }: { children: ReactNode }) {
  // Render pertama selalu Indonesia agar cocok dengan HTML dari server, lalu diganti
  // ke pilihan tersimpan setelah halaman aktif di browser.
  const [bahasa, setBahasaState] = useState<Bahasa>("id");

  useEffect(() => {
    const tersimpan = bacaBahasaTersimpan();
    if (tersimpan) setBahasaState(tersimpan);
  }, []);

  useEffect(() => {
    document.documentElement.lang = bahasa;
  }, [bahasa]);

  const setBahasa = useCallback((baru: Bahasa) => {
    setBahasaState(baru);
    try {
      window.localStorage.setItem(KUNCI_PENYIMPANAN_BAHASA, baru);
    } catch {
      // mode privat: pilihan hanya berlaku di sesi ini
    }
  }, []);

  const nilai = useMemo<NilaiKonteksBahasa>(
    () => ({
      bahasa,
      setBahasa,
      p: (teks) => pilihTeks(bahasa, teks),
      tk: (teks) => terjemahKonten(bahasa, teks),
      komoditas: (k) => namaKomoditas(bahasa, k),
      kadar: (k) => terjemahKadar(bahasa, k),
      angka: (n, d = 0) => formatAngka(bahasa, n, d),
      tanggal: (iso, opsi) => formatTanggal(bahasa, iso, opsi),
    }),
    [bahasa, setBahasa]
  );

  return <KonteksBahasa.Provider value={nilai}>{children}</KonteksBahasa.Provider>;
}

export function useBahasa(): NilaiKonteksBahasa {
  const nilai = useContext(KonteksBahasa);
  if (!nilai) throw new Error("useBahasa harus dipakai di dalam PenyediaBahasa");
  return nilai;
}
