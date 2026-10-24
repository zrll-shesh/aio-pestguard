"use client";

import { AlertTriangle, BadgeCheck, CircleHelp, Gauge, Layers, ScanSearch, Target, Timer, XCircle } from "lucide-react";
import type { DeteksiTerolah, WawasanPrediksi } from "@/lib/model/wawasanPrediksi";
import type { KonfigurasiModel } from "@/lib/model/konfigurasiModel";
import { WARNA_KOMODITAS } from "@/lib/model/kelasHama";
import { LencanaKeyakinan } from "@/components/ui/LencanaStatus";
import TombolSalinDanUnduh from "@/components/ui/TombolSalinDanUnduh";
import { gabungkanNamaKelas } from "@/lib/utils";
import { WARNA_KOTAK } from "./PenampilDeteksi";

function persen(nilai: number, digit = 0) {
  return `${(nilai * 100).toFixed(digit)}%`;
}

const GAYA_KEPADATAN = {
  tinggi: { label: "Kepadatan tinggi", kelas: "bg-red-50 text-pestguardMerahPeringatan border-red-200" },
  sedang: { label: "Kepadatan sedang", kelas: "bg-amber-50 text-pestguardKuningPeringatan border-amber-200" },
  rendah: { label: "Kepadatan rendah", kelas: "bg-pestguardHijauLembut text-pestguardHijauUtama border-green-200" },
  nihil: { label: "Tidak ada deteksi", kelas: "bg-white/10 text-white border-white/25" },
} as const;

const GAYA_COCOK = {
  benar: { Ikon: BadgeCheck, kelas: "bg-pestguardHijauMuda/20 text-pestguardHijauMuda" },
  sebagian: { Ikon: CircleHelp, kelas: "bg-amber-300/15 text-amber-200" },
  salah: { Ikon: XCircle, kelas: "bg-rose-300/15 text-rose-200" },
  tidak_terdeteksi: { Ikon: XCircle, kelas: "bg-rose-300/15 text-rose-200" },
  tidak_diketahui: { Ikon: CircleHelp, kelas: "" },
} as const;

export function BannerHasilPrediksi({
  wawasan,
  model,
  namaBerkas,
  teksLaporan,
}: {
  wawasan: WawasanPrediksi;
  model: KonfigurasiModel;
  namaBerkas: string;
  teksLaporan: string;
}) {
  const gayaKepadatan = GAYA_KEPADATAN[wawasan.kepadatan];
  const cocok = wawasan.cocokLabel;
  const gayaCocok = GAYA_COCOK[cocok.hasil];
  return (
    <section className="pestguard-hero pestguard-muncul rounded-[22px] p-6 text-white shadow-pestguardKartuAngkat sm:p-8" aria-live="polite">
      <div className="relative z-[1] grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-pestguardHijauMuda">
              Hasil {model.namaTampilan} untuk {namaBerkas}
            </span>
            <span className={gabungkanNamaKelas("rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", gayaKepadatan.kelas)}>{gayaKepadatan.label}</span>
          </div>
          <h2 className="mt-4 font-pestguardDisplay text-[26px] font-semibold leading-tight sm:text-[31px]">{wawasan.judulHasil}</h2>
          <p className="mt-3 max-w-3xl text-[14.5px] leading-relaxed text-white/75">{wawasan.narasi}</p>
          {cocok.kalimat && (
            <p className={gabungkanNamaKelas("mt-4 inline-flex max-w-3xl items-start gap-2 rounded-xl px-3 py-2 text-[13px] leading-snug", gayaCocok.kelas)}>
              <gayaCocok.Ikon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>
                <span className="font-semibold">Dibanding label asli: </span>
                {cocok.kalimat}
              </span>
            </p>
          )}
          <div className="mt-5">
            <TombolSalinDanUnduh isiTeksWawasan={teksLaporan} namaFileUnduhan={`laporan-deteksi-${namaBerkas.replace(/\.[^.]+$/, "")}-${model.idModel}.txt`} tampilanTerang />
          </div>
        </div>
        <div className="self-start rounded-2xl border border-white/10 bg-white/[0.06] p-5">
          <p className="text-[12px] font-semibold text-white/60">Langkah yang disarankan</p>
          <ol className="mt-3 space-y-2.5">
            {wawasan.langkahTindakan.slice(0, 4).map((langkah, i) => (
              <li key={langkah} className="flex gap-2.5 text-[13px] leading-snug text-white/85">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-pestguardHijauMuda/20 font-pestguardDisplay text-[11px] font-bold text-pestguardHijauMuda">
                  {i + 1}
                </span>
                <span>{langkah}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function KartuAngkaPrediksi({
  wawasan,
  waktuInferensiMs,
  modelGpuMs,
}: {
  wawasan: WawasanPrediksi;
  waktuInferensiMs: number;
  modelGpuMs: number;
}) {
  const daftarKartu = [
    {
      Ikon: ScanSearch,
      judul: "Objek terdeteksi",
      nilai: String(wawasan.jumlahDeteksi),
      keterangan:
        wawasan.ringkasanPerKelas.length > 0
          ? `${wawasan.ringkasanPerKelas.length} jenis hama, ${wawasan.komoditasTerlibat.join(" dan ").toLowerCase()}`
          : wawasan.jumlahKandidatDiBawahAmbang > 0
            ? `${wawasan.jumlahKandidatDiBawahAmbang} kandidat di bawah ambang`
            : "tidak ada kandidat",
    },
    {
      Ikon: Gauge,
      judul: "Keyakinan rata-rata",
      nilai: wawasan.jumlahDeteksi ? persen(wawasan.rataRataSkor) : "-",
      keterangan: wawasan.jumlahDeteksi ? "skor keluaran model" : "belum ada deteksi",
    },
    {
      Ikon: Target,
      judul: "Peluang benar (terkalibrasi)",
      nilai: wawasan.rataRataAkurasiEmpiris !== null ? persen(wawasan.rataRataAkurasiEmpiris) : "-",
      keterangan: "dari diagram kalibrasi data uji",
    },
    {
      Ikon: Timer,
      judul: "Waktu inferensi",
      nilai: `${Math.round(waktuInferensiMs)} ms`,
      keterangan: `di browser Anda, GPU T4 saat uji ${modelGpuMs} ms`,
    },
  ];
  return (
    <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
      {daftarKartu.map(({ Ikon, judul, nilai, keterangan }) => (
        <div key={judul} className="flex flex-col gap-1 rounded-pestguardKartu border border-pestguardAbuGaris bg-white px-[18px] py-4 shadow-pestguardKartu">
          <div className="flex items-center justify-between text-[12px] font-semibold text-pestguardAbuTeks">
            {judul}
            <span className="grid h-[30px] w-[30px] place-items-center rounded-[9px] bg-pestguardHijauLembut text-pestguardHijauUtama">
              <Ikon className="h-4 w-4" aria-hidden />
            </span>
          </div>
          <strong className="font-pestguardDisplay text-[28px] font-semibold text-pestguardHijauTua">{nilai}</strong>
          <small className="text-[12px] leading-snug text-pestguardAbuTeks">{keterangan}</small>
        </div>
      ))}
    </div>
  );
}

function BarisDeteksi({
  deteksi,
  terpilih,
  saatDipilih,
}: {
  deteksi: DeteksiTerolah;
  terpilih: boolean;
  saatDipilih: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={saatDipilih}
        aria-pressed={terpilih}
        className={gabungkanNamaKelas(
          "w-full rounded-xl border p-3 text-left transition-colors",
          terpilih ? "border-pestguardHijauUtama bg-pestguardHijauPudar" : "border-pestguardAbuGaris hover:border-pestguardHijauMuda"
        )}
      >
        <div className="flex items-start gap-3">
          <span
            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg font-pestguardDisplay text-[13px] font-bold text-pestguardNampan"
            style={{ background: WARNA_KOTAK[deteksi.tingkatKeyakinan] }}
          >
            {deteksi.nomor}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-semibold text-pestguardTeksUtama">{deteksi.kelas.namaIndonesia}</span>
              <span className="inline-flex items-center gap-1 text-[11.5px] text-pestguardAbuTeks">
                <span className="h-2 w-2 rounded-full" style={{ background: WARNA_KOMODITAS[deteksi.kelas.komoditas] }} aria-hidden />
                {deteksi.kelas.komoditas}
              </span>
            </div>
            <p className="text-[12px] italic text-pestguardAbuTeks">
              {deteksi.kelas.namaIlmiah} <span className="not-italic">({deteksi.kelas.namaIp102})</span>
            </p>
          </div>
          <div className="text-right">
            <p className="font-pestguardDisplay text-lg font-semibold text-pestguardHijauTua">{persen(deteksi.skor)}</p>
            <LencanaKeyakinan tingkatKeyakinan={deteksi.tingkatKeyakinan} />
          </div>
        </div>

        <div className="mt-3 space-y-1.5 pl-10">
          {[{ kelas: deteksi.kelas, skor: deteksi.skor, utama: true }, ...deteksi.alternatif.map((a) => ({ ...a, utama: false }))].map((baris) => (
            <div key={baris.kelas.classId} className="grid grid-cols-[minmax(0,1fr)_minmax(60px,110px)_40px] items-center gap-2 text-[11.5px]">
              <span className={gabungkanNamaKelas("truncate", baris.utama ? "font-semibold text-pestguardTeksUtama" : "text-pestguardAbuTeks")}>
                {baris.utama ? "Tebakan utama" : baris.kelas.namaIndonesia}
              </span>
              <span className="h-1.5 overflow-hidden rounded-full bg-pestguardHijauLembut" aria-hidden>
                <span
                  className={gabungkanNamaKelas("block h-full rounded-full", baris.utama ? "bg-pestguardHijauUtama" : "bg-pestguardHijauMuda")}
                  style={{ width: `${Math.max(2, baris.skor * 100)}%` }}
                />
              </span>
              <span className="text-right text-pestguardAbuTeks">{persen(baris.skor)}</span>
            </div>
          ))}
        </div>

        <p className="mt-2.5 pl-10 text-[12px] leading-snug text-pestguardAbuTeks">
          Deteksi dengan keyakinan {deteksi.akurasiEmpiris.rentang} benar {persen(deteksi.akurasiEmpiris.akurasi)} di data uji ({deteksi.akurasiEmpiris.jumlahSampel} sampel).
        </p>
        {(deteksi.adaPesaingDekat || deteksi.seringTertukarDengan) && (
          <p className="mt-1.5 flex gap-1.5 pl-10 text-[12px] leading-snug text-pestguardKuningPeringatan">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            {deteksi.adaPesaingDekat
              ? "Skor kelas alternatif cukup dekat. Model ragu di antara keduanya."
              : `Kelas ini tercatat sering tertukar dengan ${deteksi.seringTertukarDengan?.namaIndonesia}.`}
          </p>
        )}
      </button>
    </li>
  );
}

export function DaftarDeteksi({
  wawasan,
  idDeteksiTerpilih,
  saatDeteksiDipilih,
}: {
  wawasan: WawasanPrediksi;
  idDeteksiTerpilih: string | null;
  saatDeteksiDipilih: (id: string | null) => void;
}) {
  return (
    <section className="min-w-0 rounded-pestguardKartu border border-pestguardAbuGaris bg-white p-5 shadow-pestguardKartu sm:p-[22px]">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-pestguardDisplay text-[17px] font-semibold text-pestguardHijauTua">Setiap objek yang ditemukan</h2>
          <p className="mt-1 text-[13px] text-pestguardAbuTeks">Klik untuk menyorot kotaknya. Bilah menunjukkan kelas lain yang ikut dipertimbangkan model.</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-pestguardHijauPudar px-2.5 py-1 text-[11.5px] font-semibold text-pestguardAbuTeks">
          <Layers className="h-3.5 w-3.5" aria-hidden /> {wawasan.jumlahDeteksi} objek
        </span>
      </header>
      {wawasan.daftarDeteksi.length === 0 ? (
        <div className="rounded-xl bg-pestguardHijauPudar p-4 text-[13px] leading-relaxed text-pestguardAbuTeks">
          Tidak ada objek di atas ambang.
          {wawasan.kandidatTerkuatDiBawahAmbang && (
            <>
              {" "}
              Kandidat terkuat: <span className="font-semibold text-pestguardTeksUtama">{wawasan.kandidatTerkuatDiBawahAmbang.kelas.namaIndonesia}</span> dengan
              keyakinan {persen(wawasan.kandidatTerkuatDiBawahAmbang.skor)}. Geser ambang ke bawah untuk melihatnya.
            </>
          )}
        </div>
      ) : (
        <ul className="max-h-[640px] space-y-2 overflow-y-auto pr-1">
          {wawasan.daftarDeteksi.map((deteksi) => (
            <BarisDeteksi
              key={deteksi.idDeteksi}
              deteksi={deteksi}
              terpilih={idDeteksiTerpilih === deteksi.idDeteksi}
              saatDipilih={() => saatDeteksiDipilih(idDeteksiTerpilih === deteksi.idDeteksi ? null : deteksi.idDeteksi)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
