"use client";

import { CheckCircle2, CircleDashed, HardDriveDownload, XCircle } from "lucide-react";
import { DAFTAR_MODEL, type KonfigurasiModel } from "@/lib/model/konfigurasiModel";
import type { StatusBerkasModel } from "@/lib/model/inferensiOnnx";
import { gabungkanNamaKelas } from "@/lib/utils";
import { useBahasa } from "@/components/i18n/PenyediaBahasa";

interface PropsPemilihModel {
  idModelTerpilih: string;
  saatModelDipilih: (idModel: KonfigurasiModel["idModel"]) => void;
  statusBerkasPerModel: Record<string, StatusBerkasModel | null>;
  terkunci: boolean;
}

function teksUkuran(model: KonfigurasiModel, status: StatusBerkasModel | null) {
  if (status?.ukuranByte) return `${(status.ukuranByte / 1_048_576).toFixed(1)} MB`;
  if (model.perkiraanUkuranOnnxMb) return `${model.perkiraanUkuranOnnxMb} MB`;
  return "? MB";
}

function StatusBerkas({ status }: { status: StatusBerkasModel | null }) {
  const { p } = useBahasa();
  if (!status) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-pestguardAbuTeks">
        <CircleDashed className="h-3 w-3 animate-spin" aria-hidden /> {p({ id: "memeriksa", en: "checking", ko: "확인 중" })}
      </span>
    );
  }
  if (!status.tersedia) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-pestguardMerahPeringatan">
        <XCircle className="h-3 w-3" aria-hidden /> {p({ id: "berkas belum ada", en: "file missing", ko: "파일 없음" })}
      </span>
    );
  }
  if (status.sudahDiCache) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-pestguardHijauUtama">
        <CheckCircle2 className="h-3 w-3" aria-hidden /> {p({ id: "tersimpan di browser", en: "saved in browser", ko: "브라우저에 저장됨" })}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-pestguardAbuTeks">
      <HardDriveDownload className="h-3 w-3" aria-hidden /> {p({ id: "diunduh sekali saat dipakai", en: "downloads once when used", ko: "처음 사용 시 한 번 내려받음" })}
    </span>
  );
}

export default function PemilihModel({ idModelTerpilih, saatModelDipilih, statusBerkasPerModel, terkunci }: PropsPemilihModel) {
  const { p, tk } = useBahasa();
  return (
    <div role="radiogroup" aria-label={p({ id: "Model deteksi", en: "Detection model", ko: "탐지 모델" })} className="space-y-2">
      {DAFTAR_MODEL.map((model) => {
        const terpilih = model.idModel === idModelTerpilih;
        const status = statusBerkasPerModel[model.idModel] ?? null;
        return (
          <button
            key={model.idModel}
            type="button"
            role="radio"
            aria-checked={terpilih}
            disabled={terkunci}
            onClick={() => saatModelDipilih(model.idModel)}
            className={gabungkanNamaKelas(
              "w-full rounded-xl border p-3 text-left transition-colors disabled:cursor-not-allowed",
              terpilih ? "border-pestguardHijauUtama bg-pestguardHijauLembut/60" : "border-pestguardAbuGaris hover:border-pestguardHijauMuda"
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={gabungkanNamaKelas(
                  "grid h-4 w-4 shrink-0 place-items-center rounded-full border-2",
                  terpilih ? "border-pestguardHijauUtama" : "border-pestguardAbuGaris"
                )}
                aria-hidden
              >
                {terpilih && <span className="h-1.5 w-1.5 rounded-full bg-pestguardHijauUtama" />}
              </span>
              <span className="font-pestguardDisplay text-[15px] font-semibold text-pestguardHijauTua">{model.namaTampilan}</span>
              <span
                className={gabungkanNamaKelas(
                  "rounded-full px-2 py-0.5 text-[10.5px] font-bold",
                  model.adalahDefault ? "bg-pestguardHijauUtama text-white" : "bg-pestguardHijauPudar text-pestguardAbuTeks"
                )}
              >
                {tk(model.peran)}
              </span>
              <span className="ml-auto font-pestguardDisplay text-sm font-semibold text-pestguardHijauUtama">
                {(model.metrikUji.map50 * 100).toFixed(1)}
                <span className="ml-0.5 text-[10.5px] font-medium text-pestguardAbuTeks">mAP50</span>
              </span>
            </div>
            <p className="mt-1.5 pl-6 text-[12px] leading-snug text-pestguardAbuTeks">{tk(model.ringkasan)}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 pl-6 text-[11px] text-pestguardAbuTeks">
              <span>{teksUkuran(model, status)}</span>
              <span>{model.gflops} GFLOPs</span>
              <StatusBerkas status={status} />
            </div>
          </button>
        );
      })}
    </div>
  );
}
