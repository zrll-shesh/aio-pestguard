"use client";

import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import type { WawasanPrediksi } from "@/lib/model/wawasanPrediksi";
import type { HasilAnalisisCitra } from "@/lib/model/analisisCitra";
import {
  AMBANG_KEYAKINAN_DEFAULT,
  NILAI_ECE,
  TABEL_KALIBRASI,
  TABEL_SAPUAN_AMBANG,
} from "@/lib/model/konfigurasiModel";
import { gabungkanNamaKelas } from "@/lib/utils";

function persen(nilai: number, digit = 0) {
  return `${(nilai * 100).toFixed(digit)}%`;
}

const LEBAR = 420;
const TINGGI = 170;
const TEPI = { kiri: 30, kanan: 10, atas: 10, bawah: 24 };

function GrafikSapuanAmbang({ ambang }: { ambang: number }) {
  const lebarArea = LEBAR - TEPI.kiri - TEPI.kanan;
  const tinggiArea = TINGGI - TEPI.atas - TEPI.bawah;
  const x = (nilai: number) => TEPI.kiri + ((nilai - 0.05) / (0.9 - 0.05)) * lebarArea;
  const y = (nilai: number) => TEPI.atas + (1 - nilai) * tinggiArea;
  const garis = (kunci: "presisi" | "recall" | "f1") =>
    TABEL_SAPUAN_AMBANG.map((b, i) => `${i === 0 ? "M" : "L"}${x(b.ambang).toFixed(1)},${y(b[kunci]).toFixed(1)}`).join(" ");
  const ambangTerjepit = Math.min(0.9, Math.max(0.05, ambang));

  return (
    <svg viewBox={`0 0 ${LEBAR} ${TINGGI}`} className="h-auto w-full" role="img" aria-label="Grafik presisi, recall, dan F1 terhadap ambang keyakinan">
      {[0, 0.25, 0.5, 0.75, 1].map((nilai) => (
        <g key={nilai}>
          <line x1={TEPI.kiri} x2={LEBAR - TEPI.kanan} y1={y(nilai)} y2={y(nilai)} stroke="#e3f1e7" />
          <text x={TEPI.kiri - 6} y={y(nilai) + 3.5} textAnchor="end" fontSize="9.5" fill="#56685d">
            {Math.round(nilai * 100)}
          </text>
        </g>
      ))}
      {[0.1, 0.3, 0.5, 0.7, 0.9].map((nilai) => (
        <text key={nilai} x={x(nilai)} y={TINGGI - 8} textAnchor="middle" fontSize="9.5" fill="#56685d">
          {Math.round(nilai * 100)}%
        </text>
      ))}
      <line x1={x(AMBANG_KEYAKINAN_DEFAULT)} x2={x(AMBANG_KEYAKINAN_DEFAULT)} y1={TEPI.atas} y2={TINGGI - TEPI.bawah} stroke="#8fbf9c" strokeDasharray="3 3" />
      <path d={garis("presisi")} fill="none" stroke="#0c3a29" strokeWidth="2" />
      <path d={garis("recall")} fill="none" stroke="#4fae6d" strokeWidth="2" />
      <path d={garis("f1")} fill="none" stroke="#a86f00" strokeWidth="2" strokeDasharray="5 3" />
      <line x1={x(ambangTerjepit)} x2={x(ambangTerjepit)} y1={TEPI.atas} y2={TINGGI - TEPI.bawah} stroke="#14703f" strokeWidth="2" />
      <circle cx={x(ambangTerjepit)} cy={TEPI.atas} r="4" fill="#14703f" />
    </svg>
  );
}

function BilahKalibrasi({ wawasan }: { wawasan: WawasanPrediksi }) {
  const binTerpakai = new Set(
    wawasan.daftarDeteksi.map((d) => TABEL_KALIBRASI.findIndex((b) => d.skor >= b.bawah && d.skor < b.atas)).map((i) => (i === -1 ? TABEL_KALIBRASI.length - 1 : i))
  );
  return (
    <div>
      <div className="flex h-24 items-end gap-1" role="img" aria-label="Diagram kalibrasi keyakinan model">
        {TABEL_KALIBRASI.map((bin, i) => (
          <div key={bin.bawah} className="flex h-full flex-1 flex-col justify-end" title={`Keyakinan ${Math.round(bin.bawah * 100)} sampai ${Math.round(bin.atas * 100)}%: benar ${persen(bin.akurasi)} dari ${bin.jumlah} sampel`}>
            <div
              className={gabungkanNamaKelas("rounded-t-[4px]", binTerpakai.has(i) ? "bg-pestguardHijauUtama" : "bg-pestguardHijauLembut")}
              style={{ height: `${Math.max(3, bin.akurasi * 100)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-pestguardAbuTeks">
        <span>keyakinan 0%</span>
        <span>100%</span>
      </div>
      <p className="mt-2 text-[12px] leading-relaxed text-pestguardAbuTeks">
        Tinggi bilah adalah persentase deteksi yang benar pada tiap rentang keyakinan di data uji. Bilah gelap berisi deteksi gambar ini. Skor model cukup selaras dengan
        kenyataan (ECE {NILAI_ECE}), kecuali rentang 90% ke atas yang hanya punya 4 sampel.
      </p>
    </div>
  );
}

const IKON_TINGKAT = {
  baik: { Ikon: CheckCircle2, warna: "text-pestguardHijauUtama" },
  perhatian: { Ikon: AlertTriangle, warna: "text-pestguardKuningPeringatan" },
  info: { Ikon: Info, warna: "text-pestguardAbuTeks" },
} as const;

const LABEL_KEANDALAN = {
  teruji_baik: { teks: "Teruji baik", kelas: "bg-pestguardHijauLembut text-pestguardHijauUtama" },
  perlu_verifikasi: { teks: "Perlu dicek", kelas: "bg-amber-50 text-pestguardKuningPeringatan" },
  belum_teruji: { teks: "Belum teruji", kelas: "bg-gray-100 text-pestguardAbuTeks" },
} as const;

export default function PanelKepercayaan({
  wawasan,
  ambang,
  analisisCitra,
}: {
  wawasan: WawasanPrediksi;
  ambang: number;
  analisisCitra: HasilAnalisisCitra | null;
}) {
  const t = wawasan.tradeOffAmbang;
  return (
    <section className="min-w-0 space-y-5 rounded-pestguardKartu border border-pestguardAbuGaris bg-white p-5 shadow-pestguardKartu sm:p-[22px]">
      <header>
        <h2 className="font-pestguardDisplay text-[17px] font-semibold text-pestguardHijauTua">Seberapa bisa dipercaya hasil ini</h2>
        <p className="mt-1 text-[13px] leading-relaxed text-pestguardAbuTeks">Dihitung dari hasil evaluasi asli notebook pada 110 gambar uji, lalu dicocokkan dengan gambar ini.</p>
      </header>

      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-[13.5px] font-semibold text-pestguardTeksUtama">Tarik ulur ambang {persen(ambang)}</h3>
          <div className="flex gap-3 text-[11px] text-pestguardAbuTeks">
            <span className="inline-flex items-center gap-1"><i className="h-0.5 w-3 bg-pestguardHijauTua" />presisi</span>
            <span className="inline-flex items-center gap-1"><i className="h-0.5 w-3 bg-[#4fae6d]" />recall</span>
            <span className="inline-flex items-center gap-1"><i className="h-0.5 w-3 bg-pestguardKuningPeringatan" />F1</span>
          </div>
        </div>
        <GrafikSapuanAmbang ambang={ambang} />
        <div className="mt-2 grid grid-cols-3 gap-2">
          {[
            { label: "Presisi", nilai: t.presisi, arti: `${Math.round(t.presisi * 10)} dari 10 tanda memang hama itu` },
            { label: "Recall", nilai: t.recall, arti: `${Math.round(t.recall * 10)} dari 10 hama ditemukan` },
            { label: "F1", nilai: t.f1, arti: "keseimbangan keduanya" },
          ].map((item) => (
            <div key={item.label} className="rounded-[10px] border border-pestguardAbuGaris bg-pestguardHijauPudar px-3 py-2">
              <p className="text-[11px] text-pestguardAbuTeks">{item.label}</p>
              <p className="font-pestguardDisplay text-lg font-semibold text-pestguardHijauTua">{persen(item.nilai)}</p>
              <p className="text-[11px] leading-snug text-pestguardAbuTeks">{item.arti}</p>
            </div>
          ))}
        </div>
        {Math.abs(t.ambang - ambang) > 0.024 && (
          <p className="mt-1.5 text-[11px] text-pestguardAbuTeks">Angka memakai titik uji terdekat ({persen(t.ambang)}).</p>
        )}
      </div>

      <div>
        <h3 className="mb-2 text-[13.5px] font-semibold text-pestguardTeksUtama">Kalibrasi keyakinan</h3>
        <BilahKalibrasi wawasan={wawasan} />
      </div>

      {wawasan.ringkasanPerKelas.length > 0 && (
        <div>
          <h3 className="mb-2 text-[13.5px] font-semibold text-pestguardTeksUtama">Rekam jejak per jenis hama</h3>
          <ul className="space-y-2">
            {wawasan.ringkasanPerKelas.map((r) => {
              const label = LABEL_KEANDALAN[r.statusKeandalan];
              return (
                <li key={r.kelas.classId} className="rounded-[10px] border border-pestguardAbuGaris p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[13px] font-semibold text-pestguardTeksUtama">{r.kelas.namaIndonesia}</span>
                    <span className={gabungkanNamaKelas("rounded-full px-2 py-0.5 text-[10.5px] font-bold", label.kelas)}>{label.teks}</span>
                  </div>
                  <p className="mt-1 text-[12px] leading-relaxed text-pestguardAbuTeks">{r.penjelasanKeandalan}</p>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div>
        <h3 className="mb-2 text-[13.5px] font-semibold text-pestguardTeksUtama">Kualitas gambar dibanding data latih</h3>
        <ul className="space-y-2">
          {(analisisCitra?.daftarCatatan ?? []).map((catatan) => {
            const { Ikon, warna } = IKON_TINGKAT[catatan.tingkat];
            return (
              <li key={catatan.judul} className="flex gap-2.5 text-[12.5px] leading-relaxed">
                <Ikon className={gabungkanNamaKelas("mt-0.5 h-4 w-4 shrink-0", warna)} aria-hidden />
                <span className="text-pestguardAbuTeks">
                  <span className="font-semibold text-pestguardTeksUtama">
                    {catatan.judul} <span className="font-normal text-pestguardAbuTeks">({catatan.nilai})</span>.
                  </span>{" "}
                  {catatan.penjelasan}
                </span>
              </li>
            );
          })}
          {wawasan.catatanUkuranObjek && (
            <li className="flex gap-2.5 text-[12.5px] leading-relaxed">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-pestguardAbuTeks" aria-hidden />
              <span className="text-pestguardAbuTeks">
                <span className="font-semibold text-pestguardTeksUtama">Ukuran objek.</span> {wawasan.catatanUkuranObjek}
              </span>
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}
