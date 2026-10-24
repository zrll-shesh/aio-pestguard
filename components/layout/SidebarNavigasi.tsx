"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, BookOpenCheck, History, LayoutDashboard, ScanSearch, ShieldCheck } from "lucide-react";
import { gabungkanNamaKelas } from "@/lib/utils";

interface ItemMenuNavigasi {
  labelMenu: string;
  labelPendek: string;
  keterangan: string;
  alamatTujuan: string;
  IkonMenu: typeof LayoutDashboard;
  penanda?: string;
}

const DAFTAR_ITEM_MENU: ItemMenuNavigasi[] = [
  { labelMenu: "Beranda Lahan", labelPendek: "Beranda", keterangan: "Kondisi hama hari ini", alamatTujuan: "/", IkonMenu: LayoutDashboard },
  { labelMenu: "Cek Hama dari Foto", labelPendek: "Cek Foto", keterangan: "Model asli, langsung jalan", alamatTujuan: "/deteksi", IkonMenu: ScanSearch, penanda: "Baru" },
  { labelMenu: "Kamus Hama", labelPendek: "Kamus", keterangan: "24 hama, ciri dan cara atasi", alamatTujuan: "/hama", IkonMenu: BookOpen },
  { labelMenu: "Riwayat Sesi", labelPendek: "Riwayat", keterangan: "Foto dan hasil sebelumnya", alamatTujuan: "/riwayat", IkonMenu: History },
  { labelMenu: "Cara Kerja Sistem", labelPendek: "Panduan", keterangan: "Model, istilah, batasan", alamatTujuan: "/panduan", IkonMenu: BookOpenCheck },
];

export default function SidebarNavigasi() {
  const alamatSaatIni = usePathname();

  const apakahMenuAktif = (alamatTujuan: string): boolean =>
    alamatTujuan === "/" ? alamatSaatIni === "/" : alamatSaatIni.startsWith(alamatTujuan);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] flex-col overflow-y-auto bg-pestguardHijauTua px-3.5 py-6 text-white lg:flex">
        <div className="flex items-center gap-3 px-2.5 pb-7">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-pestguardHijauSedang to-pestguardHijauUtama">
            <ShieldCheck className="h-5 w-5 text-white" aria-hidden />
          </span>
          <div>
            <p className="font-pestguardDisplay text-[15px] font-bold tracking-wide">AIO PESTGUARD</p>
            <p className="text-[11px] text-white/55">Sistem deteksi hama AIGRA</p>
          </div>
        </div>

        <p className="px-3 pb-2 text-[11px] font-semibold text-white/45">Menu</p>
        <nav className="flex-1 space-y-0.5" aria-label="Menu utama">
          {DAFTAR_ITEM_MENU.map(({ labelMenu, keterangan, alamatTujuan, IkonMenu, penanda }) => {
            const menuAktif = apakahMenuAktif(alamatTujuan);
            return (
              <Link
                key={alamatTujuan}
                href={alamatTujuan}
                className={gabungkanNamaKelas(
                  "group flex items-center gap-3 rounded-[10px] px-3 py-2.5 transition-colors",
                  menuAktif
                    ? "bg-white/[0.09] text-white shadow-[inset_3px_0_0_#8fd19e]"
                    : "text-white/70 hover:bg-white/[0.05] hover:text-white"
                )}
                aria-current={menuAktif ? "page" : undefined}
              >
                <IkonMenu className={gabungkanNamaKelas("h-[18px] w-[18px] shrink-0", menuAktif && "text-pestguardHijauMuda")} aria-hidden />
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block text-sm font-semibold">{labelMenu}</span>
                  <span className="block text-[11.5px] text-white/45">{keterangan}</span>
                </span>
                {penanda && (
                  <span className="rounded-full bg-pestguardHijauMuda/15 px-2 py-0.5 text-[10px] font-bold text-pestguardHijauMuda">
                    {penanda}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 flex gap-2.5 border-t border-white/10 px-3 pt-4 text-[11.5px] leading-relaxed text-white/55">
          <span className="mt-1.5 h-[7px] w-[7px] shrink-0 rounded-full bg-pestguardHijauMuda shadow-[0_0_0_4px_rgba(143,209,158,0.15)]" aria-hidden />
          <p>
            <span className="font-semibold text-white/85">Beranda dan Riwayat</span> memakai data contoh.{" "}
            <span className="font-semibold text-white/85">Cek Hama dari Foto</span> menjalankan model asli di browser Anda.
          </p>
        </div>
      </aside>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 flex border-t border-pestguardAbuGaris bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
        aria-label="Menu utama"
      >
        {DAFTAR_ITEM_MENU.map(({ labelPendek, alamatTujuan, IkonMenu }) => {
          const menuAktif = apakahMenuAktif(alamatTujuan);
          return (
            <Link
              key={alamatTujuan}
              href={alamatTujuan}
              aria-current={menuAktif ? "page" : undefined}
              className={gabungkanNamaKelas(
                "flex min-w-0 flex-1 flex-col items-center gap-1 py-2.5 text-[10.5px] font-semibold",
                menuAktif ? "text-pestguardHijauUtama" : "text-pestguardAbuTeks"
              )}
            >
              <IkonMenu className="h-5 w-5" aria-hidden />
              {labelPendek}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
