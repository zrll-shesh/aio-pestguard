"use client";

import { ArrowRight, ChevronUp, FlaskConical, Leaf, MapPin, Ban } from "lucide-react";
import type { JawabanPetani } from "@/lib/model/wawasanPetani";
import type { WawasanPrediksi } from "@/lib/model/wawasanPrediksi";
import { ambilPanduanKelompok } from "@/lib/model/kelasHama";
import { gabungkanNamaKelas } from "@/lib/utils";
import { useBahasa } from "@/components/i18n/PenyediaBahasa";
import { GAYA_LAMPU } from "./PanelPetani";

function kalimatPertama(teks: string) {
  const potong = teks.split(/(?<=[.。])\s/)[0];
  return potong.length > 140 ? `${potong.slice(0, 137)}...` : potong;
}

/**
 * Ringkasan bergambar untuk petani: tiga ubin besar (periksa, cara alami, obat bila terpaksa)
 * dan deretan lampu kepercayaan. Narasi lengkap dibuka lewat tombol panah "Lihat detail".
 */
export default function RingkasanVisualFoto({
  wawasan,
  jawaban,
  detailTerbuka,
  saatDetailDiubah,
}: {
  wawasan: WawasanPrediksi;
  jawaban: JawabanPetani;
  detailTerbuka: boolean;
  saatDetailDiubah: (terbuka: boolean) => void;
}) {
  const { p, tk } = useBahasa();
  const utama = wawasan.hamaUtama;
  const panduan = utama ? ambilPanduanKelompok(utama.kelas) : null;
  const alami = utama?.pengendalian.alami[0] ?? null;
  const kimia = utama?.pengendalian.kimiaBoleh[0] ?? null;
  const jumlahTerlarang = utama?.pengendalian.kimiaTerlarang.length ?? 0;

  const ubin = utama
    ? [
        {
          Ikon: MapPin,
          warna: "bg-pestguardHijauUtama text-white",
          judul: p({ id: "1. Periksa di sini", en: "1. Check here", ko: "1. 여기를 확인" }),
          isi: kalimatPertama(tk(panduan!.tempatPeriksa)),
          tambahan: null as string | null,
        },
        {
          Ikon: Leaf,
          warna: "bg-pestguardHijauLembut text-pestguardHijauUtama",
          judul: p({ id: "2. Coba cara alami", en: "2. Try natural first", ko: "2. 친환경 방법 먼저" }),
          isi: alami ? tk(alami.nama) : kalimatPertama(tk(utama.kelas.pengendalian[0])),
          tambahan: alami ? null : p({ id: "tanpa obat", en: "no chemicals", ko: "약 없이" }),
        },
        {
          Ikon: FlaskConical,
          warna: "bg-pestguardHijauPudar text-pestguardHijauSedang",
          judul: p({ id: "3. Obat bila terpaksa", en: "3. Chemical if needed", ko: "3. 필요할 때만 약제" }),
          isi: kimia ? `${kimia.bahanAktif}${kimia.contohProduk !== "-" ? ` (${kimia.contohProduk.split(",")[0]})` : ""}` : p({ id: "Tanyakan ke PPL", en: "Ask an extension officer", ko: "농업 지도사에게 문의" }),
          tambahan:
            jumlahTerlarang > 0
              ? p({ id: `${jumlahTerlarang} bahan dilarang, lihat detail`, en: `${jumlahTerlarang} banned, see details`, ko: `금지 성분 ${jumlahTerlarang}개, 상세 참고` })
              : null,
        },
      ]
    : [];

  return (
    <section className="rounded-pestguardKartu border border-pestguardAbuGaris bg-white p-4 shadow-pestguardKartu sm:p-5">
      {ubin.length > 0 && (
        <div className="grid gap-3 md:grid-cols-3">
          {ubin.map(({ Ikon, warna, judul, isi, tambahan }) => (
            <div key={judul} className="flex gap-3 rounded-2xl border border-pestguardAbuGaris p-3.5">
              <span className={gabungkanNamaKelas("grid h-12 w-12 shrink-0 place-items-center rounded-2xl", warna)}>
                <Ikon className="h-6 w-6" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-pestguardAbuTeks">{judul}</p>
                <p className="mt-0.5 text-[15px] font-semibold leading-snug text-pestguardTeksUtama">{isi}</p>
                {tambahan && (
                  <p className={gabungkanNamaKelas("mt-1 inline-flex items-center gap-1 text-[12px] font-semibold", jumlahTerlarang > 0 && tambahan.includes(String(jumlahTerlarang)) ? "text-pestguardMerahPeringatan" : "text-pestguardAbuTeks")}>
                    {jumlahTerlarang > 0 && tambahan.includes(String(jumlahTerlarang)) && <Ban className="h-3.5 w-3.5" aria-hidden />}
                    {tambahan}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={gabungkanNamaKelas("flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", ubin.length > 0 && "mt-4")}>
        <ul className="flex flex-wrap gap-1.5" aria-label={p({ id: "Ringkasan kepercayaan", en: "Trust summary", ko: "신뢰도 요약" })}>
          {jawaban.daftarCek.map((cek) => {
            const gaya = GAYA_LAMPU[cek.status];
            return (
              <li key={cek.judul} className={gabungkanNamaKelas("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold", gaya.latar)} title={cek.penjelasan}>
                <gaya.Ikon className={gabungkanNamaKelas("h-3.5 w-3.5", gaya.warna)} aria-hidden />
                <span className="text-pestguardTeksUtama">{cek.judul}</span>
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          onClick={() => saatDetailDiubah(!detailTerbuka)}
          aria-expanded={detailTerbuka}
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 self-end rounded-xl bg-pestguardHijauTua px-4 text-[14px] font-semibold text-white hover:bg-pestguardHijauUtama"
        >
          {detailTerbuka ? p({ id: "Tutup detail", en: "Hide details", ko: "상세 닫기" }) : p({ id: "Lihat detail lengkap", en: "See full details", ko: "상세 전체 보기" })}
          {detailTerbuka ? <ChevronUp className="h-4 w-4" aria-hidden /> : <ArrowRight className="h-4 w-4" aria-hidden />}
        </button>
      </div>
    </section>
  );
}
