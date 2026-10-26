"use client";

import { Ban, ChevronDown } from "lucide-react";
import { DAFTAR_LARANGAN, REFERENSI_ULAT_BAWANG } from "@/lib/model/referensiPestisida";
import { useBahasa } from "@/components/i18n/PenyediaBahasa";

/** Kartu ringkas 12 bahan aktif terlarang. Tertutup secara bawaan supaya tidak menutupi kamus. */
export function InfoLarangan() {
  const { p, tk } = useBahasa();
  return (
    <details className="group rounded-pestguardKartu border border-red-200 bg-white shadow-pestguardKartu">
      <summary className="flex min-h-[56px] cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-50 text-pestguardMerahPeringatan">
          <Ban className="h-5 w-5" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-pestguardDisplay text-[15.5px] font-semibold text-pestguardMerahPeringatan">{p({ id: "12 bahan aktif yang dilarang untuk padi", en: "12 active ingredients banned for rice", ko: "벼에 금지된 유효성분 12가지" })}</span>
          <span className="block text-[12.5px] text-pestguardAbuTeks">{p({ id: "Selalu cek bahan aktif di label sebelum membeli obat untuk padi.", en: "Always check the active ingredient on the label before buying pesticide for rice.", ko: "벼 농약을 사기 전에 라벨의 유효성분을 꼭 확인하세요." })}</span>
        </span>
        <ChevronDown className="h-5 w-5 shrink-0 text-pestguardAbuTeks transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="border-t border-red-100 p-4">
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {DAFTAR_LARANGAN.map((aturan) => (
            <li key={aturan.nama} className={aturan.lingkup === "semua" ? "rounded-xl bg-red-100 p-3 sm:col-span-2 lg:col-span-3" : "rounded-xl bg-red-50 p-3"}>
              <p className="text-[14px] font-semibold text-red-900">
                {aturan.nama}
                {aturan.lingkup === "semua" && <span className="ml-2 rounded-full bg-pestguardMerahPeringatan px-2 py-0.5 text-[11px] text-white">{p({ id: "semua tanaman", en: "all crops", ko: "모든 작물" })}</span>}
              </p>
              <p className="mt-0.5 text-[12.5px] leading-relaxed text-red-900/80">{tk(aturan.catatan)}</p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[12px] leading-relaxed text-pestguardAbuTeks">
          {p({
            id: "Sumber: Tabloid Sinar Tani, berdasarkan pemaparan Prof. Dadang (Guru Besar Proteksi Tanaman IPB). Untuk komoditas selain padi, sebagian bahan ini masih boleh dipakai sesuai label.",
            en: "Source: Tabloid Sinar Tani, based on a talk by Prof. Dadang (Professor of Plant Protection, IPB). For crops other than rice, some of these may still be used as labelled.",
            ko: "출처: Tabloid Sinar Tani, Dadang 교수(IPB 식물보호학 교수) 발표 기반. 벼 이외 작물에는 일부 성분을 라벨에 따라 아직 쓸 수 있습니다.",
          })}
        </p>
      </div>
    </details>
  );
}

/** Referensi ulat bawang (Spodoptera exigua) yang belum termasuk 24 kelas model */
export function ReferensiUlatBawang() {
  const { p, tk, kadar } = useBahasa();
  const ref = REFERENSI_ULAT_BAWANG;
  return (
    <details className="group rounded-pestguardKartu border border-pestguardAbuGaris bg-white shadow-pestguardKartu">
      <summary className="flex min-h-[56px] cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-pestguardHijauLembut text-xl" aria-hidden>
          🧅
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-pestguardDisplay text-[15.5px] font-semibold text-pestguardHijauTua">{p({ id: "Referensi tambahan: ulat bawang (Spodoptera exigua)", en: "Extra reference: beet armyworm (Spodoptera exigua)", ko: "추가 자료: 파밤나방 (Spodoptera exigua)" })}</span>
          <span className="block text-[12.5px] text-pestguardAbuTeks">{p({ id: `Belum dikenali model. ${ref.kimia.length} bahan aktif dari Kementan (2012) dan cara alami.`, en: `Not recognised by the model yet. ${ref.kimia.length} active ingredients from the Ministry of Agriculture (2012) plus natural methods.`, ko: `모델이 아직 인식하지 못합니다. 농업부(2012) 유효성분 ${ref.kimia.length}개와 친환경 방법.` })}</span>
        </span>
        <ChevronDown className="h-5 w-5 shrink-0 text-pestguardAbuTeks transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="space-y-4 border-t border-pestguardAbuGaris p-4">
        <p className="text-[13px] leading-relaxed text-pestguardAbuTeks">{ref.catatanData.map(tk).join(" ")}</p>
        <div className="rounded-xl bg-pestguardHijauLembut/50 p-3">
          <p className="text-[14px] font-semibold text-pestguardHijauTua">{p({ id: "Cara alami", en: "Natural methods", ko: "친환경 방법" })}</p>
          {ref.alami.map((a) => (
            <p key={a.nama} className="mt-1 text-[13.5px] leading-relaxed text-pestguardTeksUtama">
              {tk(a.nama)}. {tk(a.keterangan)} <span className="text-pestguardAbuTeks">{p({ id: "Sumber", en: "Source", ko: "출처" })}: {a.sumber}.</span>
            </p>
          ))}
        </div>
        <div className="overflow-x-auto rounded-xl border border-pestguardAbuGaris">
          <table className="w-full min-w-[520px] text-left text-[13px]">
            <thead className="bg-pestguardHijauPudar text-[12px] text-pestguardAbuTeks">
              <tr>
                <th className="px-3 py-2 font-semibold">{p({ id: "Bahan aktif", en: "Active ingredient", ko: "유효성분" })}</th>
                <th className="px-3 py-2 font-semibold">{p({ id: "Kadar", en: "Strength", ko: "함량" })}</th>
                <th className="px-3 py-2 font-semibold">{p({ id: "Contoh produk", en: "Example products", ko: "제품 예" })}</th>
              </tr>
            </thead>
            <tbody>
              {ref.kimia.map((b) => (
                <tr key={b.bahanAktif} className="border-t border-pestguardAbuGaris">
                  <td className="px-3 py-2 font-semibold text-pestguardTeksUtama">{b.bahanAktif}</td>
                  <td className="px-3 py-2 text-pestguardAbuTeks">{kadar(b.kadar)}</td>
                  <td className="px-3 py-2 text-pestguardAbuTeks">{b.contohProduk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[12px] text-pestguardAbuTeks">{p({ id: "Sumber: Kementan (2012). Gilir bahan aktif dan ikuti dosis label.", en: "Source: Ministry of Agriculture (2012). Rotate active ingredients and follow label doses.", ko: "출처: 인도네시아 농업부(2012). 유효성분을 바꿔 가며 라벨 용량을 지키세요." })}</p>
      </div>
    </details>
  );
}
