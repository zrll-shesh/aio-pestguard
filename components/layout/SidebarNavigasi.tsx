"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenCheck, History, LayoutDashboard, ShieldCheck } from "lucide-react";
import { gabungkanNamaKelas } from "@/lib/utils";

interface ItemMenuNavigasi {
  labelMenu: string;
  keterangan: string;
  alamatTujuan: string;
  IkonMenu: typeof LayoutDashboard;
}

const DAFTAR_ITEM_MENU: ItemMenuNavigasi[] = [
  { labelMenu: "Beranda Lahan", keterangan: "Kondisi hama hari ini", alamatTujuan: "/", IkonMenu: LayoutDashboard },
  { labelMenu: "Riwayat Sesi", keterangan: "Foto dan hasil sebelumnya", alamatTujuan: "/riwayat", IkonMenu: History },
  { labelMenu: "Cara Kerja Sistem", keterangan: "Panduan dan arti istilah", alamatTujuan: "/panduan", IkonMenu: BookOpenCheck },
];

export default function SidebarNavigasi() {
  const alamatSaatIni = usePathname();

  const apakahMenuAktif = (alamatTujuan: string): boolean =>
    alamatTujuan === "/" ? alamatSaatIni === "/" : alamatSaatIni.startsWith(alamatTujuan);

  return (
    <>
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-pestguardHijauTua text-white lg:flex">
        <div className="flex items-center gap-3 px-6 py-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
            <ShieldCheck className="h-6 w-6 text-pestguardHijauMuda" aria-hidden />
          </span>
          <div>
            <p className="font-pestguardDisplay text-lg leading-tight tracking-wide">AIO PESTGUARD</p>
            <p className="text-xs text-white/60">Penjaga hama lahan Anda</p>
          </div>
        </div>

        <nav className="mt-2 flex-1 space-y-1 px-3" aria-label="Menu utama">
          {DAFTAR_ITEM_MENU.map(({ labelMenu, keterangan, alamatTujuan, IkonMenu }) => {
            const menuAktif = apakahMenuAktif(alamatTujuan);
            return (
              <Link
                key={alamatTujuan}
                href={alamatTujuan}
                className={gabungkanNamaKelas(
                  "flex items-center gap-3 rounded-xl px-3 py-3 transition",
                  menuAktif ? "bg-white text-pestguardHijauTua" : "text-white/80 hover:bg-white/10"
                )}
                aria-current={menuAktif ? "page" : undefined}
              >
                <IkonMenu className="h-5 w-5 shrink-0" aria-hidden />
                <span className="leading-tight">
                  <span className="block text-sm font-semibold">{labelMenu}</span>
                  <span className={gabungkanNamaKelas("block text-xs", menuAktif ? "text-pestguardAbuTeks" : "text-white/50")}>
                    {keterangan}
                  </span>
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="m-4 rounded-xl bg-white/10 p-4 text-xs leading-relaxed text-white/80">
          <p className="mb-1 font-semibold text-white">Mode simulasi</p>
          Angka dan foto pada tampilan ini adalah contoh. Model deteksi asli akan disambungkan pada tahap akhir.
        </div>
      </aside>

      {/* Navigasi bawah untuk layar kecil */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 flex border-t border-pestguardAbuGaris bg-white lg:hidden"
        aria-label="Menu utama"
      >
        {DAFTAR_ITEM_MENU.map(({ labelMenu, alamatTujuan, IkonMenu }) => {
          const menuAktif = apakahMenuAktif(alamatTujuan);
          return (
            <Link
              key={alamatTujuan}
              href={alamatTujuan}
              className={gabungkanNamaKelas(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
                menuAktif ? "text-pestguardHijauUtama" : "text-pestguardAbuTeks"
              )}
            >
              <IkonMenu className="h-5 w-5" aria-hidden />
              {labelMenu}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
