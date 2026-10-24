"use client";

import { Ban, ChevronDown } from "lucide-react";
import { DAFTAR_LARANGAN, REFERENSI_ULAT_BAWANG } from "@/lib/model/referensiPestisida";

/** Kartu ringkas 12 bahan aktif terlarang. Tertutup secara bawaan supaya tidak menutupi kamus. */
export function InfoLarangan() {
  return (
    <details className="group rounded-pestguardKartu border border-red-200 bg-white shadow-pestguardKartu">
      <summary className="flex min-h-[56px] cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-50 text-pestguardMerahPeringatan">
          <Ban className="h-5 w-5" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-pestguardDisplay text-[15.5px] font-semibold text-pestguardMerahPeringatan">12 bahan aktif yang dilarang untuk padi</span>
          <span className="block text-[12.5px] text-pestguardAbuTeks">Selalu cek bahan aktif di label sebelum membeli obat untuk padi.</span>
        </span>
        <ChevronDown className="h-5 w-5 shrink-0 text-pestguardAbuTeks transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="border-t border-red-100 p-4">
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {DAFTAR_LARANGAN.map((aturan) => (
            <li key={aturan.nama} className={aturan.lingkup === "semua" ? "rounded-xl bg-red-100 p-3 sm:col-span-2 lg:col-span-3" : "rounded-xl bg-red-50 p-3"}>
              <p className="text-[14px] font-semibold text-red-900">
                {aturan.nama}
                {aturan.lingkup === "semua" && <span className="ml-2 rounded-full bg-pestguardMerahPeringatan px-2 py-0.5 text-[11px] text-white">semua tanaman</span>}
              </p>
              <p className="mt-0.5 text-[12.5px] leading-relaxed text-red-900/80">{aturan.catatan}</p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[12px] leading-relaxed text-pestguardAbuTeks">
          Sumber: Tabloid Sinar Tani, berdasarkan pemaparan Prof. Dadang (Guru Besar Proteksi Tanaman IPB). Untuk komoditas selain padi, sebagian bahan ini masih boleh dipakai sesuai label.
        </p>
      </div>
    </details>
  );
}

/** Referensi ulat bawang (Spodoptera exigua) yang belum termasuk 24 kelas model */
export function ReferensiUlatBawang() {
  const ref = REFERENSI_ULAT_BAWANG;
  return (
    <details className="group rounded-pestguardKartu border border-pestguardAbuGaris bg-white shadow-pestguardKartu">
      <summary className="flex min-h-[56px] cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-pestguardHijauLembut text-xl" aria-hidden>
          🧅
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-pestguardDisplay text-[15.5px] font-semibold text-pestguardHijauTua">Referensi tambahan: ulat bawang (Spodoptera exigua)</span>
          <span className="block text-[12.5px] text-pestguardAbuTeks">Belum dikenali model. {ref.kimia.length} bahan aktif dari Kementan (2012) dan cara alami.</span>
        </span>
        <ChevronDown className="h-5 w-5 shrink-0 text-pestguardAbuTeks transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="space-y-4 border-t border-pestguardAbuGaris p-4">
        <p className="text-[13px] leading-relaxed text-pestguardAbuTeks">{ref.catatanData.join(" ")}</p>
        <div className="rounded-xl bg-pestguardHijauLembut/50 p-3">
          <p className="text-[14px] font-semibold text-pestguardHijauTua">Cara alami</p>
          {ref.alami.map((a) => (
            <p key={a.nama} className="mt-1 text-[13.5px] leading-relaxed text-pestguardTeksUtama">
              {a.nama}. {a.keterangan} <span className="text-pestguardAbuTeks">Sumber: {a.sumber}.</span>
            </p>
          ))}
        </div>
        <div className="overflow-x-auto rounded-xl border border-pestguardAbuGaris">
          <table className="w-full min-w-[520px] text-left text-[13px]">
            <thead className="bg-pestguardHijauPudar text-[12px] text-pestguardAbuTeks">
              <tr>
                <th className="px-3 py-2 font-semibold">Bahan aktif</th>
                <th className="px-3 py-2 font-semibold">Kadar</th>
                <th className="px-3 py-2 font-semibold">Contoh produk</th>
              </tr>
            </thead>
            <tbody>
              {ref.kimia.map((b) => (
                <tr key={b.bahanAktif} className="border-t border-pestguardAbuGaris">
                  <td className="px-3 py-2 font-semibold text-pestguardTeksUtama">{b.bahanAktif}</td>
                  <td className="px-3 py-2 text-pestguardAbuTeks">{b.kadar}</td>
                  <td className="px-3 py-2 text-pestguardAbuTeks">{b.contohProduk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[12px] text-pestguardAbuTeks">Sumber: Kementan (2012). Gilir bahan aktif dan ikuti dosis label.</p>
      </div>
    </details>
  );
}
