"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Clock3, MapPin, ScanSearch, Search, Users } from "lucide-react";
import {
  DAFTAR_KELAS_HAMA,
  WARNA_KOMODITAS,
  ambilPanduanKelompok,
  tentukanStatusKeandalan,
} from "@/lib/model/kelasHama";
import { ambilRekomendasiPestisida } from "@/lib/insightEngine";
import { gabungkanNamaKelas } from "@/lib/utils";

const PILIHAN_KOMODITAS = ["Semua", "Padi", "Jagung", "Bawang"] as const;

const LABEL_KEANDALAN = {
  teruji_baik: { teks: "Sistem sudah mahir", kelas: "bg-pestguardHijauLembut text-pestguardHijauUtama" },
  perlu_verifikasi: { teks: "Sistem kadang keliru", kelas: "bg-amber-50 text-pestguardKuningPeringatan" },
  belum_teruji: { teks: "Belum diuji", kelas: "bg-gray-100 text-pestguardAbuTeks" },
} as const;

export default function KamusHama() {
  const [kataCari, setKataCari] = useState("");
  const [komoditas, setKomoditas] = useState<(typeof PILIHAN_KOMODITAS)[number]>("Semua");
  const [terbuka, setTerbuka] = useState<number | null>(null);

  const daftar = useMemo(() => {
    const kunci = kataCari.trim().toLowerCase();
    return DAFTAR_KELAS_HAMA.filter(
      (k) =>
        (komoditas === "Semua" || k.komoditas === komoditas) &&
        (!kunci || [k.namaIndonesia, k.namaIlmiah, k.namaIp102, k.kelompok, k.gejala].some((t) => t.toLowerCase().includes(kunci)))
    );
  }, [kataCari, komoditas]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-pestguardKartu border border-pestguardAbuGaris bg-white p-4 shadow-pestguardKartu sm:flex-row sm:items-center">
        <label className="flex min-h-[46px] flex-1 items-center gap-2 rounded-xl border border-pestguardAbuGaris px-3 focus-within:border-pestguardHijauSedang">
          <Search className="h-4 w-4 text-pestguardAbuTeks" aria-hidden />
          <span className="sr-only">Cari hama</span>
          <input
            value={kataCari}
            onChange={(e) => setKataCari(e.target.value)}
            placeholder="Cari nama hama atau gejala, misalnya: daun menggulung"
            className="w-full bg-transparent text-[15px] outline-none placeholder:text-pestguardAbuTeks/70"
          />
        </label>
        <div className="grid grid-cols-4 gap-1 rounded-xl bg-pestguardHijauPudar p-1 sm:flex" role="tablist" aria-label="Saring komoditas">
          {PILIHAN_KOMODITAS.map((p) => (
            <button
              key={p}
              type="button"
              role="tab"
              aria-selected={komoditas === p}
              onClick={() => setKomoditas(p)}
              className={gabungkanNamaKelas(
                "min-h-[40px] whitespace-nowrap rounded-lg px-2 text-[14px] font-semibold sm:px-4",
                komoditas === p ? "bg-white text-pestguardHijauTua shadow-sm" : "text-pestguardAbuTeks"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <p className="text-[13.5px] text-pestguardAbuTeks">{daftar.length} jenis hama ditampilkan. Ketuk kartu untuk melihat cara memeriksa dan mengendalikannya.</p>

      {daftar.length === 0 && (
        <div className="rounded-pestguardKartu border border-dashed border-pestguardAbuGaris bg-white p-6 text-center text-[14px] text-pestguardAbuTeks">
          Tidak ada hama yang cocok. Coba kata lain, misalnya &quot;batang&quot;, &quot;daun&quot;, atau &quot;akar&quot;.
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {daftar.map((kelas) => {
          const panduan = ambilPanduanKelompok(kelas);
          const keandalan = LABEL_KEANDALAN[tentukanStatusKeandalan(kelas)];
          const pestisida = ambilRekomendasiPestisida(kelas.namaIp102);
          const buka = terbuka === kelas.classId;
          return (
            <article key={kelas.classId} className={gabungkanNamaKelas("rounded-pestguardKartu border bg-white shadow-pestguardKartu", buka ? "border-pestguardHijauSedang md:col-span-2 xl:col-span-3" : "border-pestguardAbuGaris")}>
              <button type="button" onClick={() => setTerbuka(buka ? null : kelas.classId)} aria-expanded={buka} className="flex w-full items-start gap-3 p-4 text-left">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-pestguardHijauLembut text-xl" aria-hidden>
                  {panduan.ikonEmoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-pestguardDisplay text-[16px] font-semibold text-pestguardHijauTua">{kelas.namaIndonesia}</span>
                  <span className="block text-[12.5px] italic text-pestguardAbuTeks">{kelas.namaIlmiah}</span>
                  <span className="mt-2 flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full border border-pestguardAbuGaris px-2 py-0.5 text-[11.5px] font-semibold">
                      <span className="h-2 w-2 rounded-full" style={{ background: WARNA_KOMODITAS[kelas.komoditas] }} aria-hidden />
                      {kelas.komoditas}
                    </span>
                    <span className={gabungkanNamaKelas("rounded-full px-2 py-0.5 text-[11.5px] font-semibold", keandalan.kelas)}>{keandalan.teks}</span>
                  </span>
                  {!buka && <span className="mt-2 line-clamp-2 block text-[13.5px] leading-relaxed text-pestguardAbuTeks">{kelas.gejala}</span>}
                </span>
                <ChevronDown className={gabungkanNamaKelas("mt-1 h-5 w-5 shrink-0 text-pestguardAbuTeks transition-transform", buka && "rotate-180")} aria-hidden />
              </button>
              {buka && (
                <div className="space-y-4 border-t border-pestguardAbuGaris p-4 sm:p-5">
                  <p className="text-[15px] leading-relaxed text-pestguardTeksUtama">{kelas.gejala}</p>
                  <div className="grid gap-3 md:grid-cols-3">
                    {[
                      { Ikon: MapPin, judul: "Di mana mencarinya", isi: panduan.tempatPeriksa },
                      { Ikon: Clock3, judul: "Kapan memeriksa", isi: panduan.waktuPeriksa },
                      { Ikon: Users, judul: "Teman petani (musuh alami)", isi: panduan.musuhAlami },
                    ].map(({ Ikon, judul, isi }) => (
                      <div key={judul} className="rounded-xl bg-pestguardHijauPudar p-3">
                        <p className="flex items-center gap-1.5 text-[13px] font-semibold text-pestguardHijauTua">
                          <Ikon className="h-4 w-4" aria-hidden /> {judul}
                        </p>
                        <p className="mt-1 text-[13.5px] leading-relaxed text-pestguardAbuTeks">{isi}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="text-[14px] font-semibold text-pestguardHijauTua">Cara mengendalikan tanpa obat</h3>
                      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[14px] leading-relaxed text-pestguardTeksUtama">
                        {kelas.pengendalian.map((p) => (
                          <li key={p}>{p}</li>
                        ))}
                      </ul>
                      <p className="mt-2 text-[13.5px] text-pestguardAbuTeks">
                        <span className="font-semibold text-pestguardTeksUtama">Kapan harus bertindak: </span>
                        {panduan.tandaHarusBertindak}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-[14px] font-semibold text-pestguardHijauTua">Pilihan obat (referensi AIGRA)</h3>
                      {pestisida.length ? (
                        <ul className="mt-2 space-y-1.5 text-[13.5px]">
                          {pestisida.map((p) => (
                            <li key={p.bahan_aktif} className="rounded-lg border border-pestguardAbuGaris px-3 py-2">
                              <span className="font-semibold">{p.bahan_aktif}</span> <span className="text-pestguardAbuTeks">({p.contoh_produk})</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-[13.5px] leading-relaxed text-pestguardAbuTeks">Belum ada di referensi sistem. Tanyakan ke penyuluh pertanian (PPL).</p>
                      )}
                      <p className="mt-3 text-[12.5px] leading-relaxed text-pestguardAbuTeks">Kemampuan sistem mengenali hama ini: {keandalan.teks.toLowerCase()}.</p>
                    </div>
                  </div>
                  <Link href="/deteksi" className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-pestguardHijauUtama px-4 text-[14px] font-semibold text-white hover:bg-pestguardHijauTua">
                    <ScanSearch className="h-4 w-4" aria-hidden /> Cek foto hama sekarang
                  </Link>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
