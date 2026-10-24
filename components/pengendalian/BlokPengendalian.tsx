"use client";

import { useState } from "react";
import { Ban, FlaskConical, Info, Leaf, ShieldAlert, TriangleAlert } from "lucide-react";
import { LABEL_JENIS_ALAMI, ringkasPengendalian } from "@/lib/model/referensiPestisida";
import { gabungkanNamaKelas } from "@/lib/utils";

const TIPS_AMAN_PESTISIDA = [
  "Baca label dan ikuti dosisnya. Dosis lebih tinggi tidak membuat lebih ampuh, justru mempercepat hama kebal.",
  "Pakai masker, sarung tangan, baju lengan panjang, dan sepatu bot saat mencampur dan menyemprot.",
  "Semprot pagi atau sore, jangan saat angin kencang atau akan hujan.",
  "Perhatikan masa tunggu panen yang tertulis di label.",
];

const BATAS_TAMPIL_KIMIA = 4;

/** Blok pengendalian lengkap untuk satu kelas hama: alami dulu, kimia bila terpaksa, larangan, dan catatan data */
export default function BlokPengendalian({ classId, namaKomoditas }: { classId: number; namaKomoditas: string }) {
  const { referensi, kimiaBoleh, kimiaTerlarang, alami } = ringkasPengendalian(classId);
  const [tampilSemua, setTampilSemua] = useState(false);
  const kimiaTampil = tampilSemua ? kimiaBoleh : kimiaBoleh.slice(0, BATAS_TAMPIL_KIMIA);

  return (
    <div className="space-y-4">
      {/* ---------- Alami dan organik ---------- */}
      <div className="rounded-2xl border border-pestguardHijauMuda/60 bg-pestguardHijauLembut/40 p-4">
        <h4 className="flex flex-wrap items-center gap-2 text-[15px] font-semibold text-pestguardHijauTua">
          <Leaf className="h-[18px] w-[18px]" aria-hidden /> Cara alami dan organik
          <span className="rounded-full bg-pestguardHijauUtama px-2 py-0.5 text-[11px] font-bold text-white">coba lebih dulu</span>
        </h4>
        {alami.length === 0 ? (
          <p className="mt-2 text-[13.5px] leading-relaxed text-pestguardAbuTeks">
            Belum ditemukan pestisida nabati yang terverifikasi untuk hama ini. Andalkan cara tanpa obat: kebersihan lahan, pengolahan tanah, dan menjaga musuh alami.
          </p>
        ) : (
          <ul className="mt-3 grid gap-2 md:grid-cols-2">
            {alami.map((cara) => (
              <li key={cara.nama} className="rounded-xl border border-pestguardAbuGaris bg-white p-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full bg-pestguardHijauLembut px-2 py-0.5 text-[11px] font-bold text-pestguardHijauUtama">{LABEL_JENIS_ALAMI[cara.jenis]}</span>
                  <span
                    className={gabungkanNamaKelas(
                      "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                      cara.diujiPadaHamaIni ? "bg-pestguardHijauPudar text-pestguardHijauSedang" : "bg-amber-50 text-pestguardKuningPeringatan"
                    )}
                  >
                    {cara.diujiPadaHamaIni ? "diuji pada hama ini" : "diuji pada hama kerabat"}
                  </span>
                </div>
                <p className="mt-1.5 text-[14px] font-semibold text-pestguardTeksUtama">{cara.nama}</p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-pestguardAbuTeks">{cara.keterangan}</p>
                <p className="mt-1 text-[11.5px] text-pestguardAbuTeks">Sumber: {cara.sumber}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ---------- Kimia ---------- */}
      <div className="rounded-2xl border border-pestguardAbuGaris p-4">
        <h4 className="flex flex-wrap items-center gap-2 text-[15px] font-semibold text-pestguardHijauTua">
          <FlaskConical className="h-[18px] w-[18px]" aria-hidden /> Obat kimia
          <span className="rounded-full bg-pestguardHijauPudar px-2 py-0.5 text-[11px] font-semibold text-pestguardAbuTeks">bila hama tetap banyak</span>
        </h4>
        {kimiaBoleh.length === 0 ? (
          <p className="mt-2 text-[13.5px] leading-relaxed text-pestguardAbuTeks">
            Belum ada pilihan obat kimia yang boleh dipakai di referensi. Tanyakan ke penyuluh pertanian (PPL) setempat.
          </p>
        ) : (
          <>
            <p className="mt-1 text-[13px] text-pestguardAbuTeks">Ganti-ganti bahan aktif antar penyemprotan supaya hama tidak kebal.</p>
            <ul className="mt-3 grid gap-2 md:grid-cols-2">
              {kimiaTampil.map((b) => (
                <li key={b.bahanAktif + b.contohProduk} className="rounded-xl border border-pestguardAbuGaris p-3">
                  <p className="text-[14px] font-semibold text-pestguardTeksUtama">{b.bahanAktif}</p>
                  <p className="mt-0.5 text-[12.5px] text-pestguardAbuTeks">Kadar: {b.kadar}</p>
                  {b.contohProduk !== "-" && <p className="text-[12.5px] text-pestguardAbuTeks">Contoh produk: {b.contohProduk}</p>}
                  <p className="mt-1 text-[11.5px] text-pestguardAbuTeks">Sumber: {b.sumber}</p>
                </li>
              ))}
            </ul>
            {kimiaBoleh.length > BATAS_TAMPIL_KIMIA && (
              <button
                type="button"
                onClick={() => setTampilSemua((v) => !v)}
                className="mt-2 min-h-[40px] text-[13px] font-semibold text-pestguardHijauUtama hover:underline"
              >
                {tampilSemua ? "Tampilkan lebih sedikit" : `Lihat semua ${kimiaBoleh.length} pilihan`}
              </button>
            )}
            <ul className="mt-3 space-y-1.5 rounded-xl bg-amber-50 p-3">
              {TIPS_AMAN_PESTISIDA.map((tip) => (
                <li key={tip} className="flex gap-2 text-[13px] leading-relaxed text-amber-900">
                  <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                  {tip}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* ---------- Larangan ---------- */}
      {kimiaTerlarang.length > 0 && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <h4 className="flex flex-wrap items-center gap-2 text-[15px] font-semibold text-pestguardMerahPeringatan">
            <Ban className="h-[18px] w-[18px]" aria-hidden /> Jangan dipakai di {namaKomoditas.toLowerCase()}
          </h4>
          <p className="mt-1 text-[13px] leading-relaxed text-red-900">
            Bahan berikut tercantum di sumber pengendalian hama ini, tetapi masuk daftar bahan aktif yang dilarang untuk {namaKomoditas.toLowerCase()}.
          </p>
          <ul className="mt-2 space-y-1.5">
            {kimiaTerlarang.map((b) => (
              <li key={b.bahanAktif + b.kadar} className="text-[13.5px] leading-relaxed text-red-900">
                <span className="font-semibold">{b.bahanAktif}</span>
                {b.contohProduk !== "-" && ` (${b.contohProduk})`}. {b.larangan?.catatan}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ---------- Kekebalan ---------- */}
      {referensi.bahanTercatatKebal.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <h4 className="flex flex-wrap items-center gap-2 text-[15px] font-semibold text-pestguardKuningPeringatan">
            <TriangleAlert className="h-[18px] w-[18px]" aria-hidden /> Hama ini pernah tercatat kebal terhadap
          </h4>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {referensi.bahanTercatatKebal.map((nama) => (
              <span key={nama} className="rounded-full border border-amber-200 bg-white px-2.5 py-1 text-[12px] font-semibold text-amber-900">
                {nama}
              </span>
            ))}
          </div>
          <p className="mt-2 text-[12.5px] leading-relaxed text-amber-900">Sumber: pesticideresistance.org. Bahan ini kemungkinan kurang ampuh untuk hama ini.</p>
        </div>
      )}

      {/* ---------- Catatan data ---------- */}
      {referensi.catatanData.filter((c) => !c.startsWith("Belum ditemukan sumber pestisida nabati")).length > 0 && (
        <ul className="space-y-1.5">
          {referensi.catatanData
            .filter((c) => !c.startsWith("Belum ditemukan sumber pestisida nabati"))
            .map((catatan) => (
              <li key={catatan} className="flex gap-2 text-[12.5px] leading-relaxed text-pestguardAbuTeks">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                {catatan}
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
