"use client";

import { ChevronDown, FileJson, Wrench } from "lucide-react";
import type { WawasanPrediksi } from "@/lib/model/wawasanPrediksi";
import type { HasilAnalisisCitra } from "@/lib/model/analisisCitra";
import type { KonfigurasiModel } from "@/lib/model/konfigurasiModel";
import type { InfoLetterbox } from "@/lib/model/pascaproses";
import { unduhTeksSebagaiFile } from "@/lib/utils";
import { useBahasa } from "@/components/i18n/PenyediaBahasa";
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
  const { p } = useBahasa();
  const t = (id: string, en: string, ko: string) => p({ id, en, ko });
  const baris: Array<[string, string]> = [
    [t("Model", "Model", "모델"), `${model.namaTampilan} (${model.namaBerkas}), ${model.jumlahParameterJuta}M ${t("parameter", "parameters", "파라미터")}, ${model.gflops} GFLOPs`],
    [
      t("Mesin", "Engine", "엔진"),
      `${info.mesin.toUpperCase()}, ${info.multiThread ? `${info.jumlahThread} thread` : t("1 thread (halaman tidak cross-origin isolated)", "1 thread (page not cross-origin isolated)", "1 스레드(교차 출처 격리 아님)")}, runtime ${info.sumberRuntime}`,
    ],
    [t("Model dimuat", "Model loaded", "모델 로드"), `${info.modelDariCache ? t("dari cache browser", "from browser cache", "브라우저 캐시에서") : t("diunduh dari server", "downloaded from server", "서버에서 내려받음")}, ${Math.round(info.waktuMuatModelMs)} ms`],
    [
      t("Waktu", "Timing", "시간"),
      `${t("praproses", "preprocess", "전처리")} ${Math.round(info.waktu.praprosesMs)} ms, ${t("inferensi", "inference", "추론")} ${Math.round(info.waktu.inferensiMs)} ms, ${t("pascaproses", "postprocess", "후처리")} ${Math.round(info.waktu.pascaprosesMs)} ms`,
    ],
    [t("Masukan", "Input", "입력"), `[1, 3, 640, 640] float32 RGB 0..1, letterbox ${t("skala", "scale", "배율")} ${info.infoLetterbox.skala.toFixed(4)}, pad ${info.infoLetterbox.padKiri}/${info.infoLetterbox.padAtas}`],
    [
      t("Keluaran", "Output", "출력"),
      `[${info.bentukKeluaran.join(", ")}], ${info.jumlahKelasModel} ${t("kelas", "classes", "종류")}${info.jumlahKelasModel !== 24 ? t(" (PERINGATAN: sistem mengharapkan 24 kelas)", " (WARNING: the system expects 24 classes)", " (경고: 시스템은 24종을 기대합니다)") : ""}`,
    ],
    [t("Pascaproses", "Post-processing", "후처리"), `NMS IoU 0.7, ${t("kandidat minimal", "min candidate", "최소 후보")} 5%, ${t("ambang tampil", "display threshold", "표시 임계값")} ${Math.round(ambang * 100)}%, max 300`],
    [
      t("Evaluasi notebook", "Notebook evaluation", "노트북 평가"),
      `mAP50 ${model.metrikUji.map50}, mAP50-95 ${model.metrikUji.map50Sampai95}, ${t("presisi", "precision", "정밀도")} ${model.metrikUji.presisi}, recall ${model.metrikUji.recall} (${t("110 gambar uji", "110 test images", "시험 이미지 110장")})`,
    ],
  ];

  return (
    <details className="group rounded-pestguardKartu border border-pestguardAbuGaris bg-white shadow-pestguardKartu">
      <summary className="flex min-h-[56px] cursor-pointer list-none items-center gap-3 px-5 py-4 sm:px-[22px] [&::-webkit-details-marker]:hidden">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-pestguardHijauPudar text-pestguardHijauUtama">
          <Wrench className="h-[18px] w-[18px]" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-pestguardDisplay text-[16px] font-semibold text-pestguardHijauTua">{p({ id: "Detail untuk tim teknis dan PPL", en: "Details for the technical team and extension officers", ko: "기술팀·농업 지도사용 상세 정보" })}</span>
          <span className="block text-[12.5px] text-pestguardAbuTeks">{p({ id: "Angka evaluasi, kurva presisi dan recall, kalibrasi, waktu proses, dan JSON format POST /detect", en: "Evaluation numbers, precision and recall curves, calibration, timing, and POST /detect JSON", ko: "평가 수치, 정밀도·재현율 곡선, 보정, 처리 시간, POST /detect 형식 JSON" })}</span>
        </span>
        <ChevronDown className="h-5 w-5 shrink-0 text-pestguardAbuTeks transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="space-y-4 border-t border-pestguardAbuGaris p-4 sm:p-[22px]">
        <KartuAngkaPrediksi wawasan={wawasan} waktuInferensiMs={info.waktu.inferensiMs} modelGpuMs={model.kecepatanGpuT4Ms} />
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <PanelKepercayaan wawasan={wawasan} ambang={ambang} analisisCitra={analisisCitra} />
          <div className="min-w-0 space-y-4">
            <div className="rounded-pestguardKartu border border-pestguardAbuGaris p-4">
              <h3 className="text-[14px] font-semibold text-pestguardHijauTua">{p({ id: "Jejak proses", en: "Process trace", ko: "처리 과정" })}</h3>
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
                <h3 className="text-[14px] font-semibold text-pestguardHijauTua">{p({ id: "Respons JSON (kontrak POST /detect)", en: "JSON response (POST /detect contract)", ko: "JSON 응답 (POST /detect 형식)" })}</h3>
                <button
                  type="button"
                  onClick={() => unduhTeksSebagaiFile(jsonRespons, namaBerkasJson, "application/json")}
                  className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-pestguardAbuGaris px-3 text-[12.5px] font-semibold text-pestguardHijauTua hover:bg-pestguardHijauPudar"
                >
                  <FileJson className="h-4 w-4" aria-hidden /> {p({ id: "Unduh JSON", en: "Download JSON", ko: "JSON 내려받기" })}
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
