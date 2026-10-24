"use client";

import { Loader2, Scale, Users } from "lucide-react";
import { DAFTAR_MODEL, HASIL_ENSEMBLE } from "@/lib/model/konfigurasiModel";
import { ambilKelasHama } from "@/lib/model/kelasHama";
import { hitungIouKotak, type DeteksiMentah } from "@/lib/model/pascaproses";
import { gabungkanNamaKelas } from "@/lib/utils";

export type HasilSatuModel =
  | { status: "menunggu" }
  | { status: "berjalan" }
  | { status: "selesai"; deteksi: DeteksiMentah[]; inferensiMs: number }
  | { status: "galat"; pesan: string };

interface Kelompok {
  classId: number;
  anggota: Array<{ idModel: string; skor: number; kotak: [number, number, number, number] }>;
}

/** Mengelompokkan deteksi lintas model: kelas sama dan IoU minimal 0,55 (sama seperti WBF di notebook) */
function kelompokkanKesepakatan(hasil: Record<string, HasilSatuModel>, ambang: number): Kelompok[] {
  const daftarKelompok: Kelompok[] = [];
  for (const model of DAFTAR_MODEL) {
    const h = hasil[model.idModel];
    if (h?.status !== "selesai") continue;
    for (const d of h.deteksi.filter((x) => x.skor >= ambang)) {
      const cocok = daftarKelompok.find(
        (k) => k.classId === d.classId && !k.anggota.some((a) => a.idModel === model.idModel) && hitungIouKotak(k.anggota[0].kotak, d.kotak) >= 0.55
      );
      if (cocok) cocok.anggota.push({ idModel: model.idModel, skor: d.skor, kotak: d.kotak });
      else daftarKelompok.push({ classId: d.classId, anggota: [{ idModel: model.idModel, skor: d.skor, kotak: d.kotak }] });
    }
  }
  return daftarKelompok;
}

export default function PanelBandingModel({
  hasilPerModel,
  ambang,
  sedangBerjalan,
  saatJalankan,
  terkunci,
}: {
  hasilPerModel: Record<string, HasilSatuModel>;
  ambang: number;
  sedangBerjalan: boolean;
  saatJalankan: () => void;
  terkunci: boolean;
}) {
  const jumlahSelesai = DAFTAR_MODEL.filter((m) => hasilPerModel[m.idModel]?.status === "selesai").length;
  const kelompok = jumlahSelesai >= 2 ? kelompokkanKesepakatan(hasilPerModel, ambang) : [];
  const ringkasanKesepakatan = new Map<number, { semua: number; sebagian: number }>();
  for (const k of kelompok) {
    const r = ringkasanKesepakatan.get(k.classId) ?? { semua: 0, sebagian: 0 };
    if (k.anggota.length === jumlahSelesai) r.semua += 1;
    else r.sebagian += 1;
    ringkasanKesepakatan.set(k.classId, r);
  }
  const totalSepakat = kelompok.filter((k) => k.anggota.length === jumlahSelesai).length;

  return (
    <section className="rounded-pestguardKartu border border-pestguardAbuGaris bg-white p-5 shadow-pestguardKartu sm:p-[22px]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-2xl">
          <h2 className="flex items-center gap-2 font-pestguardDisplay text-[17px] font-semibold text-pestguardHijauTua">
            <Scale className="h-[18px] w-[18px]" aria-hidden /> Minta pendapat kedua dan ketiga
          </h2>
          <p className="mt-1 text-[13.5px] leading-relaxed text-pestguardAbuTeks">
            Jalankan ketiga model pada foto yang sama. Temuan yang disepakati semua model jauh lebih bisa dipercaya. Di notebook, menggabungkan 3 model menaikkan F1 dari{" "}
            {HASIL_ENSEMBLE.f1ModelTunggal.toFixed(3)} ke {HASIL_ENSEMBLE.f1.toFixed(3)}.
          </p>
        </div>
        <button
          type="button"
          onClick={saatJalankan}
          disabled={terkunci || sedangBerjalan || jumlahSelesai === DAFTAR_MODEL.length}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-pestguardHijauUtama px-4 py-2 text-sm font-semibold text-white hover:bg-pestguardHijauTua disabled:opacity-50"
        >
          {sedangBerjalan ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Users className="h-4 w-4" aria-hidden />}
          {sedangBerjalan ? "Menjalankan..." : jumlahSelesai === DAFTAR_MODEL.length ? "Sudah dibandingkan" : jumlahSelesai > 0 ? `Bandingkan dengan ${DAFTAR_MODEL.length - jumlahSelesai} model lain` : "Bandingkan 3 model"}
        </button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-pestguardAbuGaris">
        <table className="w-full min-w-[520px] text-left text-[13px]">
          <thead className="bg-pestguardHijauPudar text-[11.5px] text-pestguardAbuTeks">
            <tr>
              <th className="px-3 py-2 font-semibold">Model</th>
              <th className="px-3 py-2 font-semibold">Temuan</th>
              <th className="px-3 py-2 font-semibold">Hama terbanyak</th>
              <th className="px-3 py-2 text-right font-semibold">Keyakinan rata-rata</th>
              <th className="px-3 py-2 text-right font-semibold">Waktu</th>
            </tr>
          </thead>
          <tbody>
            {DAFTAR_MODEL.map((model) => {
              const h = hasilPerModel[model.idModel] ?? { status: "menunggu" };
              const lolos = h.status === "selesai" ? h.deteksi.filter((d) => d.skor >= ambang) : [];
              const hitung = new Map<number, number>();
              lolos.forEach((d) => hitung.set(d.classId, (hitung.get(d.classId) ?? 0) + 1));
              const teratas = Array.from(hitung.entries()).sort((a, b) => b[1] - a[1])[0];
              return (
                <tr key={model.idModel} className="border-t border-pestguardAbuGaris">
                  <td className="px-3 py-2.5 font-semibold text-pestguardTeksUtama">{model.namaTampilan}</td>
                  {h.status === "selesai" ? (
                    <>
                      <td className="px-3 py-2.5">{lolos.length}</td>
                      <td className="px-3 py-2.5">{teratas ? `${ambilKelasHama(teratas[0])?.namaIndonesia} (${teratas[1]})` : "tidak ada"}</td>
                      <td className="px-3 py-2.5 text-right">{lolos.length ? `${Math.round((lolos.reduce((j, d) => j + d.skor, 0) / lolos.length) * 100)}%` : "-"}</td>
                      <td className="px-3 py-2.5 text-right">{Math.round(h.inferensiMs)} ms</td>
                    </>
                  ) : (
                    <td colSpan={4} className={gabungkanNamaKelas("px-3 py-2.5", h.status === "galat" ? "text-pestguardMerahPeringatan" : "text-pestguardAbuTeks")}>
                      {h.status === "berjalan" ? "sedang berjalan..." : h.status === "galat" ? h.pesan : "belum dijalankan"}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {jumlahSelesai >= 2 && (
        <div className="mt-4 rounded-xl bg-pestguardHijauPudar p-4">
          <p className="text-[14px] font-semibold text-pestguardHijauTua">
            {kelompok.length === 0
              ? "Semua model sepakat: tidak ada hama di atas ambang."
              : `${totalSepakat} dari ${kelompok.length} temuan disepakati semua ${jumlahSelesai} model.`}
          </p>
          <ul className="mt-2 space-y-1.5">
            {Array.from(ringkasanKesepakatan.entries()).map(([classId, r]) => (
              <li key={classId} className="text-[13.5px] leading-relaxed text-pestguardAbuTeks">
                <span className="font-semibold text-pestguardTeksUtama">{ambilKelasHama(classId)?.namaIndonesia}</span>:{" "}
                {r.semua > 0 && `${r.semua} disepakati semua model`}
                {r.semua > 0 && r.sebagian > 0 && ", "}
                {r.sebagian > 0 && `${r.sebagian} hanya ditemukan sebagian model (perlu dicek)`}
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="mt-3 text-[12px] text-pestguardAbuTeks">Ketiga model total sekitar 270 MB. Di ponsel dengan memori kecil, jalankan satu per satu saja.</p>
    </section>
  );
}
