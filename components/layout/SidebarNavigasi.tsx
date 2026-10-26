"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, BookOpenCheck, History, LayoutDashboard, ScanSearch, ShieldCheck } from "lucide-react";
import { gabungkanNamaKelas } from "@/lib/utils";
import type { Teks3 } from "@/lib/i18n/bahasa";
import { useBahasa } from "@/components/i18n/PenyediaBahasa";
import PemilihBahasa from "@/components/i18n/PemilihBahasa";

interface ItemMenuNavigasi {
  labelMenu: Teks3;
  labelPendek: Teks3;
  keterangan: Teks3;
  alamatTujuan: string;
  IkonMenu: typeof LayoutDashboard;
  penanda?: Teks3;
}

const DAFTAR_ITEM_MENU: ItemMenuNavigasi[] = [
  {
    labelMenu: { id: "Beranda Lahan", en: "Field Overview", ko: "농지 현황" },
    labelPendek: { id: "Beranda", en: "Home", ko: "홈" },
    keterangan: { id: "Peta dan kondisi hama", en: "Map and pest status", ko: "지도와 해충 현황" },
    alamatTujuan: "/",
    IkonMenu: LayoutDashboard,
  },
  {
    labelMenu: { id: "Cek Hama dari Foto", en: "Check Pests by Photo", ko: "사진으로 해충 확인" },
    labelPendek: { id: "Cek Foto", en: "Check", ko: "사진 확인" },
    keterangan: { id: "Model asli, langsung jalan", en: "Real model, runs instantly", ko: "실제 모델 바로 실행" },
    alamatTujuan: "/deteksi",
    IkonMenu: ScanSearch,
    penanda: { id: "Baru", en: "New", ko: "새 기능" },
  },
  {
    labelMenu: { id: "Kamus Hama", en: "Pest Guide", ko: "해충 도감" },
    labelPendek: { id: "Kamus", en: "Guide", ko: "도감" },
    keterangan: { id: "24 hama, ciri dan cara atasi", en: "24 pests, signs and control", ko: "24종 해충, 특징과 방제" },
    alamatTujuan: "/hama",
    IkonMenu: BookOpen,
  },
  {
    labelMenu: { id: "Riwayat Sesi", en: "Session History", ko: "촬영 기록" },
    labelPendek: { id: "Riwayat", en: "History", ko: "기록" },
    keterangan: { id: "Foto dan hasil sebelumnya", en: "Past photos and results", ko: "이전 사진과 결과" },
    alamatTujuan: "/riwayat",
    IkonMenu: History,
  },
  {
    labelMenu: { id: "Cara Kerja Sistem", en: "How It Works", ko: "시스템 안내" },
    labelPendek: { id: "Panduan", en: "About", ko: "안내" },
    keterangan: { id: "Model, istilah, batasan", en: "Models, terms, limits", ko: "모델, 용어, 한계" },
    alamatTujuan: "/panduan",
    IkonMenu: BookOpenCheck,
  },
];

export default function SidebarNavigasi() {
  const alamatSaatIni = usePathname();
  const { p } = useBahasa();

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
            <p className="text-[11px] text-white/55">{p({ id: "Sistem deteksi hama AIGRA", en: "AIGRA pest detection", ko: "AIGRA 해충 탐지 시스템" })}</p>
          </div>
        </div>

        <p className="px-3 pb-2 text-[11px] font-semibold text-white/45">{p({ id: "Menu", en: "Menu", ko: "메뉴" })}</p>
        <nav className="flex-1 space-y-0.5" aria-label={p({ id: "Menu utama", en: "Main menu", ko: "주 메뉴" })}>
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
                  <span className="block text-sm font-semibold">{p(labelMenu)}</span>
                  <span className="block text-[11.5px] text-white/45">{p(keterangan)}</span>
                </span>
                {penanda && (
                  <span className="rounded-full bg-pestguardHijauMuda/15 px-2 py-0.5 text-[10px] font-bold text-pestguardHijauMuda">
                    {p(penanda)}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 space-y-3 border-t border-white/10 px-3 pt-4">
          <PemilihBahasa varian="gelap" />
          <div className="flex gap-2.5 text-[11.5px] leading-relaxed text-white/55">
            <span className="mt-1.5 h-[7px] w-[7px] shrink-0 rounded-full bg-pestguardHijauMuda shadow-[0_0_0_4px_rgba(143,209,158,0.15)]" aria-hidden />
            <p>
              {p({
                id: "Beranda dan Riwayat memakai data contoh. Cek Hama dari Foto menjalankan model asli di browser Anda.",
                en: "Home and History use sample data. Check Pests by Photo runs the real model in your browser.",
                ko: "홈과 기록은 예시 데이터를 씁니다. '사진으로 해충 확인'은 실제 모델을 브라우저에서 실행합니다.",
              })}
            </p>
          </div>
        </div>
      </aside>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 flex border-t border-pestguardAbuGaris bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
        aria-label={p({ id: "Menu utama", en: "Main menu", ko: "주 메뉴" })}
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
              <span className="max-w-full truncate px-0.5">{p(labelPendek)}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
