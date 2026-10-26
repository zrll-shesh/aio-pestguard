"use client";

import { useState } from "react";
import { Ban, FlaskConical, Info, Leaf, ShieldAlert, TriangleAlert } from "lucide-react";
import { ringkasPengendalian, type JenisCaraAlami } from "@/lib/model/referensiPestisida";
import type { JenisKomoditas } from "@/lib/types";
import type { Teks3 } from "@/lib/i18n/bahasa";
import { gabungkanNamaKelas } from "@/lib/utils";
import { useBahasa } from "@/components/i18n/PenyediaBahasa";

const TIPS_AMAN_PESTISIDA: Teks3[] = [
  {
    id: "Baca label dan ikuti dosisnya. Dosis lebih tinggi tidak membuat lebih ampuh, justru mempercepat hama kebal.",
    en: "Read the label and follow the dose. A higher dose is not stronger; it only makes pests resistant faster.",
    ko: "라벨을 읽고 용량을 지키세요. 더 많이 쓴다고 효과가 커지지 않고 오히려 저항성만 빨리 생깁니다.",
  },
  {
    id: "Pakai masker, sarung tangan, baju lengan panjang, dan sepatu bot saat mencampur dan menyemprot.",
    en: "Wear a mask, gloves, long sleeves, and boots when mixing and spraying.",
    ko: "섞거나 뿌릴 때는 마스크, 장갑, 긴소매 옷, 장화를 착용하세요.",
  },
  {
    id: "Semprot pagi atau sore, jangan saat angin kencang atau akan hujan.",
    en: "Spray in the morning or evening, not in strong wind or before rain.",
    ko: "아침이나 저녁에 뿌리고, 바람이 세거나 비가 오기 전에는 피하세요.",
  },
  {
    id: "Perhatikan masa tunggu panen yang tertulis di label.",
    en: "Respect the pre-harvest interval written on the label.",
    ko: "라벨에 적힌 수확 전 사용 금지 기간을 지키세요.",
  },
];

export const LABEL_JENIS_ALAMI_3: Record<JenisCaraAlami, Teks3> = {
  nabati: { id: "Pestisida nabati", en: "Botanical", ko: "식물성 농약" },
  hayati: { id: "Pengendalian hayati", en: "Biological control", ko: "생물적 방제" },
  mekanis: { id: "Cara mekanis", en: "Mechanical", ko: "물리적 방제" },
};

const BATAS_TAMPIL_KIMIA = 4;
const AWALAN_TANPA_NABATI = "Belum ditemukan sumber pestisida nabati";

/** Blok pengendalian lengkap untuk satu kelas hama: alami dulu, kimia bila terpaksa, larangan, catatan data */
export default function BlokPengendalian({ classId, namaKomoditas }: { classId: number; namaKomoditas: JenisKomoditas }) {
  const { p, tk, kadar, komoditas } = useBahasa();
  const { referensi, kimiaBoleh, kimiaTerlarang, alami } = ringkasPengendalian(classId);
  const [tampilSemua, setTampilSemua] = useState(false);
  const kimiaTampil = tampilSemua ? kimiaBoleh : kimiaBoleh.slice(0, BATAS_TAMPIL_KIMIA);
  const namaTanaman = komoditas(namaKomoditas);
  const catatanLain = referensi.catatanData.filter((c) => !c.startsWith(AWALAN_TANPA_NABATI));

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-pestguardHijauMuda/60 bg-pestguardHijauLembut/40 p-4">
        <h4 className="flex flex-wrap items-center gap-2 text-[15px] font-semibold text-pestguardHijauTua">
          <Leaf className="h-[18px] w-[18px]" aria-hidden /> {p({ id: "Cara alami dan organik", en: "Natural and organic methods", ko: "친환경·유기 방법" })}
          <span className="rounded-full bg-pestguardHijauUtama px-2 py-0.5 text-[11px] font-bold text-white">{p({ id: "coba lebih dulu", en: "try first", ko: "먼저 시도" })}</span>
        </h4>
        {alami.length === 0 ? (
          <p className="mt-2 text-[13.5px] leading-relaxed text-pestguardAbuTeks">
            {p({
              id: "Belum ditemukan pestisida nabati yang terverifikasi untuk hama ini. Andalkan cara tanpa obat: kebersihan lahan, pengolahan tanah, dan menjaga musuh alami.",
              en: "No verified botanical pesticide has been found for this pest yet. Rely on non-chemical methods: field hygiene, tillage, and protecting natural enemies.",
              ko: "이 해충에 대해 검증된 식물성 농약이 아직 없습니다. 밭 위생, 흙 갈기, 천적 보호 같은 약 없는 방법을 쓰세요.",
            })}
          </p>
        ) : (
          <ul className="mt-3 grid gap-2 md:grid-cols-2">
            {alami.map((cara) => (
              <li key={cara.nama} className="rounded-xl border border-pestguardAbuGaris bg-white p-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full bg-pestguardHijauLembut px-2 py-0.5 text-[11px] font-bold text-pestguardHijauUtama">{p(LABEL_JENIS_ALAMI_3[cara.jenis])}</span>
                  <span
                    className={gabungkanNamaKelas(
                      "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                      cara.diujiPadaHamaIni ? "bg-pestguardHijauPudar text-pestguardHijauSedang" : "bg-amber-50 text-pestguardKuningPeringatan"
                    )}
                  >
                    {cara.diujiPadaHamaIni
                      ? p({ id: "diuji pada hama ini", en: "tested on this pest", ko: "이 해충에서 시험됨" })
                      : p({ id: "diuji pada hama kerabat", en: "tested on a related pest", ko: "근연 해충에서 시험됨" })}
                  </span>
                </div>
                <p className="mt-1.5 text-[14px] font-semibold text-pestguardTeksUtama">{tk(cara.nama)}</p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-pestguardAbuTeks">{tk(cara.keterangan)}</p>
                <p className="mt-1 text-[11.5px] text-pestguardAbuTeks">
                  {p({ id: "Sumber", en: "Source", ko: "출처" })}: {cara.sumber}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-pestguardAbuGaris p-4">
        <h4 className="flex flex-wrap items-center gap-2 text-[15px] font-semibold text-pestguardHijauTua">
          <FlaskConical className="h-[18px] w-[18px]" aria-hidden /> {p({ id: "Obat kimia", en: "Chemical pesticides", ko: "화학 농약" })}
          <span className="rounded-full bg-pestguardHijauPudar px-2 py-0.5 text-[11px] font-semibold text-pestguardAbuTeks">
            {p({ id: "bila hama tetap banyak", en: "only if pests stay numerous", ko: "해충이 계속 많을 때만" })}
          </span>
        </h4>
        {kimiaBoleh.length === 0 ? (
          <p className="mt-2 text-[13.5px] leading-relaxed text-pestguardAbuTeks">
            {p({
              id: "Belum ada pilihan obat kimia yang boleh dipakai di referensi. Tanyakan ke penyuluh pertanian (PPL) setempat.",
              en: "No permitted chemical option is in the reference yet. Ask your local agricultural extension officer.",
              ko: "참고 자료에 사용 가능한 화학 약제가 아직 없습니다. 지역 농업 지도사에게 문의하세요.",
            })}
          </p>
        ) : (
          <>
            <p className="mt-1 text-[13px] text-pestguardAbuTeks">
              {p({ id: "Ganti-ganti bahan aktif antar penyemprotan supaya hama tidak kebal.", en: "Switch active ingredients between sprays so pests do not become resistant.", ko: "저항성이 생기지 않게 살포마다 유효성분을 바꾸세요." })}
            </p>
            <ul className="mt-3 grid gap-2 md:grid-cols-2">
              {kimiaTampil.map((b) => (
                <li key={b.bahanAktif + b.contohProduk} className="rounded-xl border border-pestguardAbuGaris p-3">
                  <p className="text-[14px] font-semibold text-pestguardTeksUtama">{b.bahanAktif}</p>
                  <p className="mt-0.5 text-[12.5px] text-pestguardAbuTeks">
                    {p({ id: "Kadar", en: "Strength", ko: "함량" })}: {kadar(b.kadar)}
                  </p>
                  {b.contohProduk !== "-" && (
                    <p className="text-[12.5px] text-pestguardAbuTeks">
                      {p({ id: "Contoh produk", en: "Example products", ko: "제품 예" })}: {b.contohProduk}
                    </p>
                  )}
                  <p className="mt-1 text-[11.5px] text-pestguardAbuTeks">
                    {p({ id: "Sumber", en: "Source", ko: "출처" })}: {b.sumber}
                  </p>
                </li>
              ))}
            </ul>
            {kimiaBoleh.length > BATAS_TAMPIL_KIMIA && (
              <button type="button" onClick={() => setTampilSemua((v) => !v)} className="mt-2 min-h-[40px] text-[13px] font-semibold text-pestguardHijauUtama hover:underline">
                {tampilSemua
                  ? p({ id: "Tampilkan lebih sedikit", en: "Show less", ko: "접기" })
                  : p({ id: `Lihat semua ${kimiaBoleh.length} pilihan`, en: `See all ${kimiaBoleh.length} options`, ko: `${kimiaBoleh.length}개 모두 보기` })}
              </button>
            )}
            <ul className="mt-3 space-y-1.5 rounded-xl bg-amber-50 p-3">
              {TIPS_AMAN_PESTISIDA.map((tip) => (
                <li key={tip.id} className="flex gap-2 text-[13px] leading-relaxed text-amber-900">
                  <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                  {p(tip)}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {kimiaTerlarang.length > 0 && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <h4 className="flex items-center gap-2 text-[15px] font-semibold text-pestguardMerahPeringatan">
            <Ban className="h-[18px] w-[18px]" aria-hidden /> {p({ id: `Jangan dipakai di ${namaTanaman.toLowerCase()}`, en: `Do not use on ${namaTanaman.toLowerCase()}`, ko: `${namaTanaman}에 사용 금지` })}
          </h4>
          <p className="mt-1 text-[13px] leading-relaxed text-red-900">
            {p({
              id: `Bahan berikut tercantum di sumber pengendalian hama ini, tetapi masuk daftar bahan aktif yang dilarang untuk ${namaTanaman.toLowerCase()}.`,
              en: `These appear in the control sources for this pest, but they are on the list of active ingredients banned for ${namaTanaman.toLowerCase()}.`,
              ko: `아래 성분은 이 해충의 방제 자료에 나오지만 ${namaTanaman}에 금지된 유효성분 목록에 있습니다.`,
            })}
          </p>
          <ul className="mt-2 space-y-1.5">
            {kimiaTerlarang.map((b) => (
              <li key={b.bahanAktif + b.kadar} className="text-[13.5px] leading-relaxed text-red-900">
                <span className="font-semibold">{b.bahanAktif}</span>
                {b.contohProduk !== "-" && ` (${b.contohProduk})`}. {b.larangan ? tk(b.larangan.catatan) : ""}
              </li>
            ))}
          </ul>
        </div>
      )}

      {referensi.bahanTercatatKebal.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <h4 className="flex items-center gap-2 text-[15px] font-semibold text-pestguardKuningPeringatan">
            <TriangleAlert className="h-[18px] w-[18px]" aria-hidden /> {p({ id: "Hama ini pernah tercatat kebal terhadap", en: "This pest has been recorded as resistant to", ko: "이 해충은 다음 성분에 저항성 기록이 있습니다" })}
          </h4>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {referensi.bahanTercatatKebal.map((nama) => (
              <span key={nama} className="rounded-full border border-amber-200 bg-white px-2.5 py-1 text-[12px] font-semibold text-amber-900">
                {nama}
              </span>
            ))}
          </div>
          <p className="mt-2 text-[12.5px] leading-relaxed text-amber-900">
            {p({
              id: "Sumber: pesticideresistance.org. Bahan ini kemungkinan kurang ampuh untuk hama ini.",
              en: "Source: pesticideresistance.org. These are likely less effective against this pest.",
              ko: "출처: pesticideresistance.org. 이 해충에는 효과가 떨어질 가능성이 있습니다.",
            })}
          </p>
        </div>
      )}

      {catatanLain.length > 0 && (
        <ul className="space-y-1.5">
          {catatanLain.map((catatan) => (
            <li key={catatan} className="flex gap-2 text-[12.5px] leading-relaxed text-pestguardAbuTeks">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              {tk(catatan)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
