"use client";

import Link from "next/link";
import { BookOpen, ScanSearch } from "lucide-react";
import { useBahasa } from "@/components/i18n/PenyediaBahasa";

/** Pintu masuk ke fitur yang memakai model asli, ditaruh paling atas di Beranda */
export default function AjakanCekFoto() {
  const { p } = useBahasa();
  return (
    <section className="grid gap-3 rounded-pestguardKartu border border-pestguardAbuGaris bg-white p-4 shadow-pestguardKartu sm:p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-pestguardHijauUtama text-white">
          <ScanSearch className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h2 className="font-pestguardDisplay text-[17px] font-semibold text-pestguardHijauTua">
            {p({ id: "Punya foto hama? Cek langsung di sini", en: "Have a pest photo? Check it here", ko: "해충 사진이 있나요? 여기서 바로 확인하세요" })}
          </h2>
          <p className="mt-0.5 text-[14px] leading-relaxed text-pestguardAbuTeks">
            {p({
              id: "Model pengenal hama asli berjalan di ponsel atau laptop Anda dan memberi jawaban beserta langkah tindakan. Angka lahan di bawah masih data contoh.",
              en: "The real pest recognition model runs on your phone or laptop and gives an answer with next steps. Field numbers below are sample data.",
              ko: "실제 해충 인식 모델이 휴대폰이나 노트북에서 실행되어 답과 할 일을 알려 줍니다. 아래 농지 수치는 예시 데이터입니다.",
            })}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link href="/deteksi" className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-pestguardHijauUtama px-4 text-[14px] font-semibold text-white hover:bg-pestguardHijauTua sm:flex-none">
          <ScanSearch className="h-4 w-4" aria-hidden /> {p({ id: "Cek foto hama", en: "Check a photo", ko: "사진 확인" })}
        </Link>
        <Link href="/hama" className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-pestguardAbuGaris px-4 text-[14px] font-semibold text-pestguardHijauTua hover:bg-pestguardHijauPudar sm:flex-none">
          <BookOpen className="h-4 w-4" aria-hidden /> {p({ id: "Kamus hama", en: "Pest guide", ko: "해충 도감" })}
        </Link>
      </div>
    </section>
  );
}
