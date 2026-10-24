"use client";

import { ChevronDown, FileJson, Wrench } from "lucide-react";
import type { WawasanPrediksi } from "@/lib/model/wawasanPrediksi";
import type { HasilAnalisisCitra } from "@/lib/model/analisisCitra";
import type { KonfigurasiModel } from "@/lib/model/konfigurasiModel";
import type { InfoLetterbox } from "@/lib/model/pascaproses";
import { unduhTeksSebagaiFile } from "@/lib/utils";
import { KartuAngkaPrediksi } from "./PanelHasil";
import PanelKepercayaan from "./PanelKepercayaan";

export interface InfoTeknisJalan {
  mesin: string;
  sumberRuntime: string;
  multiThread: boolean;
  jumlahThread: number;
  modelDariCache: boolean;
  waktu: { praprosesMs: number; inferensiMs: number; pascaprosesMs: number };
  waktuMuatModelMs: number;
  bentukKeluaran: number[];
  jumlahKelasModel: number;
  infoLetterbox: InfoLetterbox;
}

export default function PanelTeknis({
  wawasan,
  ambang,
  analisisCitra,
  model,
  info,
  jsonRespons,
  namaBerkasJson,
}: {
  wawasan: WawasanPrediksi;
  ambang: number;
  analisisCitra: HasilAnalisisCitra | null;
  model: KonfigurasiModel;
  info: InfoTeknisJalan;
  jsonRespons: string;
  namaBerkasJson: string;
}) {
  const baris: Array<[string, string]> = [
    ["Model", `${model.namaTampilan} (${model.namaBerkas}), ${model.jumlahParameterJuta} juta parameter, ${model.gflops} GFLOPs`],
    ["Mesin", `${info.mesin.toUpperCase()}, ${info.multiThread ? `${info.jumlahThread} thread` : "1 thread (halaman tidak cross-origin isolated)"}, runtime ${info.sumberRuntime}`],
    ["Model dimuat", `${info.modelDariCache ? "dari cache browser" : "diunduh dari server"}, ${Math.round(info.waktuMuatModelMs)} ms`],
    ["Waktu", `praproses ${Math.round(info.waktu.praprosesMs)} ms, inferensi ${Math.round(info.waktu.inferensiMs)} ms, pascaproses ${Math.round(info.waktu.pascaprosesMs)} ms`],
    ["Masukan", `[1, 3, 640, 640] float32 RGB 0..1, letterbox skala ${info.infoLetterbox.skala.toFixed(4)}, pad kiri ${info.infoLetterbox.padKiri}, pad atas ${info.infoLetterbox.padAtas}`],
    ["Keluaran", `[${info.bentukKeluaran.join(", ")}], ${info.jumlahKelasModel} kelas${info.jumlahKelasModel !== 24 ? " (PERINGATAN: sistem mengharapkan 24 kelas)" : ""}`],
    ["Pascaproses", `NMS per kelas IoU 0,7, kandidat minimal 5%, ambang tampil ${Math.round(ambang * 100)}%, maksimal 300 deteksi`],
    ["Evaluasi notebook", `mAP50 ${model.metrikUji.map50}, mAP50-95 ${model.metrikUji.map50Sampai95}, presisi ${model.metrikUji.presisi}, recall ${model.metrikUji.recall} (110 gambar uji)`],
  ];

  return (
    <details className="group rounded-pestguardKartu border border-pestguardAbuGaris bg-white shadow-pestguardKartu">
      <summary className="flex min-h-[56px] cursor-pointer list-none items-center gap-3 px-5 py-4 sm:px-[22px] [&::-webkit-details-marker]:hidden">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-pestguardHijauPudar text-pestguardHijauUtama">
          <Wrench className="h-[18px] w-[18px]" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-pestguardDisplay text-[16px] font-semibold text-pestguardHijauTua">Detail untuk tim teknis dan PPL</span>
          <span className="block text-[12.5px] text-pestguardAbuTeks">Angka evaluasi, kurva presisi dan recall, kalibrasi, waktu proses, dan JSON format POST /detect</span>
        </span>
        <ChevronDown className="h-5 w-5 shrink-0 text-pestguardAbuTeks transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="space-y-4 border-t border-pestguardAbuGaris p-4 sm:p-[22px]">
        <KartuAngkaPrediksi wawasan={wawasan} waktuInferensiMs={info.waktu.inferensiMs} modelGpuMs={model.kecepatanGpuT4Ms} />
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <PanelKepercayaan wawasan={wawasan} ambang={ambang} analisisCitra={analisisCitra} />
          <div className="min-w-0 space-y-4">
            <div className="rounded-pestguardKartu border border-pestguardAbuGaris p-4">
              <h3 className="text-[14px] font-semibold text-pestguardHijauTua">Jejak proses</h3>
              <dl className="mt-2 divide-y divide-pestguardAbuGaris">
                {baris.map(([k, v]) => (
                  <div key={k} className="grid gap-1 py-2 sm:grid-cols-[120px_minmax(0,1fr)]">
                    <dt className="text-[12px] font-semibold text-pestguardAbuTeks">{k}</dt>
                    <dd className="break-words font-pestguardMono text-[12px] text-pestguardTeksUtama">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="rounded-pestguardKartu border border-pestguardAbuGaris p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-[14px] font-semibold text-pestguardHijauTua">Respons JSON (kontrak POST /detect)</h3>
                <button
                  type="button"
                  onClick={() => unduhTeksSebagaiFile(jsonRespons, namaBerkasJson, "application/json")}
                  className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-pestguardAbuGaris px-3 text-[12.5px] font-semibold text-pestguardHijauTua hover:bg-pestguardHijauPudar"
                >
                  <FileJson className="h-4 w-4" aria-hidden /> Unduh JSON
                </button>
              </div>
              <pre className="mt-2 max-h-72 overflow-auto rounded-lg bg-pestguardNampan p-3 font-pestguardMono text-[11px] leading-relaxed text-pestguardHijauMuda">{jsonRespons}</pre>
            </div>
          </div>
        </div>
      </div>
    </details>
  );
}
