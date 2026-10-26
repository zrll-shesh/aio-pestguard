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
import { useBahasa } from "@/components/i18n/PenyediaBahasa";

function persen(nilai: number, digit = 0) {
  return `${(nilai * 100).toFixed(digit)}%`;
}

const LEBAR = 420;
const TINGGI = 170;
const TEPI = { kiri: 30, kanan: 10, atas: 10, bawah: 24 };

function GrafikSapuanAmbang({ ambang }: { ambang: number }) {
  const { p } = useBahasa();
  const lebarArea = LEBAR - TEPI.kiri - TEPI.kanan;
  const tinggiArea = TINGGI - TEPI.atas - TEPI.bawah;
  const x = (nilai: number) => TEPI.kiri + ((nilai - 0.05) / (0.9 - 0.05)) * lebarArea;
  const y = (nilai: number) => TEPI.atas + (1 - nilai) * tinggiArea;
  const garis = (kunci: "presisi" | "recall" | "f1") =>
    TABEL_SAPUAN_AMBANG.map((b, i) => `${i === 0 ? "M" : "L"}${x(b.ambang).toFixed(1)},${y(b[kunci]).toFixed(1)}`).join(" ");
  const ambangTerjepit = Math.min(0.9, Math.max(0.05, ambang));

  return (
    <svg viewBox={`0 0 ${LEBAR} ${TINGGI}`} className="h-auto w-full" role="img" aria-label={p({ id: "Grafik presisi, recall, dan F1 terhadap ambang keyakinan", en: "Precision, recall and F1 by confidence threshold", ko: "신뢰도 임계값별 정밀도, 재현율, F1 그래프" })}>
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
  const { p } = useBahasa();
  const binTerpakai = new Set(
    wawasan.daftarDeteksi.map((d) => TABEL_KALIBRASI.findIndex((b) => d.skor >= b.bawah && d.skor < b.atas)).map((i) => (i === -1 ? TABEL_KALIBRASI.length - 1 : i))
  );
  return (
    <div>
      <div className="flex h-24 items-end gap-1" role="img" aria-label={p({ id: "Diagram kalibrasi keyakinan model", en: "Model confidence calibration chart", ko: "모델 신뢰도 보정 도표" })}>
        {TABEL_KALIBRASI.map((bin, i) => (
          <div key={bin.bawah} className="flex h-full flex-1 flex-col justify-end" title={`${Math.round(bin.bawah * 100)}-${Math.round(bin.atas * 100)}%: ${persen(bin.akurasi)} (n=${bin.jumlah})`}>
            <div
              className={gabungkanNamaKelas("rounded-t-[4px]", binTerpakai.has(i) ? "bg-pestguardHijauUtama" : "bg-pestguardHijauLembut")}
              style={{ height: `${Math.max(3, bin.akurasi * 100)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-pestguardAbuTeks">
        <span>{p({ id: "keyakinan 0%", en: "confidence 0%", ko: "신뢰도 0%" })}</span>
        <span>100%</span>
      </div>
      <p className="mt-2 text-[12px] leading-relaxed text-pestguardAbuTeks">
        {p({
          id: `Tinggi bilah adalah persentase deteksi yang benar pada tiap rentang keyakinan di data uji. Bilah gelap berisi deteksi gambar ini. Skor model cukup selaras dengan kenyataan (ECE ${NILAI_ECE}), kecuali rentang 90% ke atas yang hanya punya 4 sampel.`,
          en: `Bar height is the share of correct detections in each confidence range of the test data. Dark bars contain this image's detections. Model scores match reality well (ECE ${NILAI_ECE}), except the 90%+ range, which has only 4 samples.`,
          ko: `막대 높이는 시험 데이터의 신뢰도 구간별 정답 비율입니다. 진한 막대에 이 사진의 탐지가 있습니다. 모델 점수는 실제와 잘 맞지만(ECE ${NILAI_ECE}), 표본이 4개뿐인 90% 이상 구간은 예외입니다.`,
        })}
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
  teruji_baik: { teks: { id: "Teruji baik", en: "Well tested", ko: "검증 양호" }, kelas: "bg-pestguardHijauLembut text-pestguardHijauUtama" },
  perlu_verifikasi: { teks: { id: "Perlu dicek", en: "Needs checking", ko: "확인 필요" }, kelas: "bg-amber-50 text-pestguardKuningPeringatan" },
  belum_teruji: { teks: { id: "Belum teruji", en: "Not yet tested", ko: "미검증" }, kelas: "bg-gray-100 text-pestguardAbuTeks" },
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
  const { p, tk } = useBahasa();
  const t = wawasan.tradeOffAmbang;
  return (
    <section className="min-w-0 space-y-5 rounded-pestguardKartu border border-pestguardAbuGaris bg-white p-5 shadow-pestguardKartu sm:p-[22px]">
      <header>
        <h2 className="font-pestguardDisplay text-[17px] font-semibold text-pestguardHijauTua">{p({ id: "Seberapa bisa dipercaya hasil ini", en: "How reliable is this result", ko: "이 결과는 얼마나 믿을 만한가" })}</h2>
        <p className="mt-1 text-[13px] leading-relaxed text-pestguardAbuTeks">{p({ id: "Dihitung dari hasil evaluasi asli notebook pada 110 gambar uji, lalu dicocokkan dengan gambar ini.", en: "Based on the notebook evaluation on 110 test images, matched to this image.", ko: "노트북의 시험 이미지 110장 평가 결과를 이 사진에 맞춰 계산했습니다." })}</p>
      </header>

      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-[13.5px] font-semibold text-pestguardTeksUtama">{p({ id: "Tarik ulur ambang", en: "Threshold trade-off at", ko: "임계값 절충" })} {persen(ambang)}</h3>
          <div className="flex gap-3 text-[11px] text-pestguardAbuTeks">
            <span className="inline-flex items-center gap-1"><i className="h-0.5 w-3 bg-pestguardHijauTua" />{p({ id: "presisi", en: "precision", ko: "정밀도" })}</span>
            <span className="inline-flex items-center gap-1"><i className="h-0.5 w-3 bg-[#4fae6d]" />{p({ id: "recall", en: "recall", ko: "재현율" })}</span>
            <span className="inline-flex items-center gap-1"><i className="h-0.5 w-3 bg-pestguardKuningPeringatan" />F1</span>
          </div>
        </div>
        <GrafikSapuanAmbang ambang={ambang} />
        <div className="mt-2 grid grid-cols-3 gap-2">
          {[
            {
              label: p({ id: "Presisi", en: "Precision", ko: "정밀도" }),
              nilai: t.presisi,
              arti: p({ id: `${Math.round(t.presisi * 10)} dari 10 tanda memang hama itu`, en: `${Math.round(t.presisi * 10)} of 10 marks are truly that pest`, ko: `표시 10개 중 ${Math.round(t.presisi * 10)}개가 실제 그 해충` }),
            },
            {
              label: p({ id: "Recall", en: "Recall", ko: "재현율" }),
              nilai: t.recall,
              arti: p({ id: `${Math.round(t.recall * 10)} dari 10 hama ditemukan`, en: `${Math.round(t.recall * 10)} of 10 pests are found`, ko: `해충 10마리 중 ${Math.round(t.recall * 10)}마리 발견` }),
            },
            { label: "F1", nilai: t.f1, arti: p({ id: "keseimbangan keduanya", en: "balance of both", ko: "두 지표의 균형" }) },
          ].map((item) => (
            <div key={item.label} className="rounded-[10px] border border-pestguardAbuGaris bg-pestguardHijauPudar px-3 py-2">
              <p className="text-[11px] text-pestguardAbuTeks">{item.label}</p>
              <p className="font-pestguardDisplay text-lg font-semibold text-pestguardHijauTua">{persen(item.nilai)}</p>
              <p className="text-[11px] leading-snug text-pestguardAbuTeks">{item.arti}</p>
            </div>
          ))}
        </div>
        {Math.abs(t.ambang - ambang) > 0.024 && (
          <p className="mt-1.5 text-[11px] text-pestguardAbuTeks">{p({ id: "Angka memakai titik uji terdekat", en: "Using the nearest tested point", ko: "가장 가까운 시험 지점 사용" })} ({persen(t.ambang)}).</p>
        )}
      </div>

      <div>
        <h3 className="mb-2 text-[13.5px] font-semibold text-pestguardTeksUtama">{p({ id: "Kalibrasi keyakinan", en: "Confidence calibration", ko: "신뢰도 보정" })}</h3>
        <BilahKalibrasi wawasan={wawasan} />
      </div>

      {wawasan.ringkasanPerKelas.length > 0 && (
        <div>
          <h3 className="mb-2 text-[13.5px] font-semibold text-pestguardTeksUtama">{p({ id: "Rekam jejak per jenis hama", en: "Track record per pest type", ko: "해충 종류별 기록" })}</h3>
          <ul className="space-y-2">
            {wawasan.ringkasanPerKelas.map((r) => {
              const label = LABEL_KEANDALAN[r.statusKeandalan];
              return (
                <li key={r.kelas.classId} className="rounded-[10px] border border-pestguardAbuGaris p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[13px] font-semibold text-pestguardTeksUtama">{tk(r.kelas.namaIndonesia)}</span>
                    <span className={gabungkanNamaKelas("rounded-full px-2 py-0.5 text-[10.5px] font-bold", label.kelas)}>{p(label.teks)}</span>
                  </div>
                  <p className="mt-1 text-[12px] leading-relaxed text-pestguardAbuTeks">{r.penjelasanKeandalan}</p>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div>
        <h3 className="mb-2 text-[13.5px] font-semibold text-pestguardTeksUtama">{p({ id: "Kualitas gambar dibanding data latih", en: "Image quality vs training data", ko: "학습 데이터 대비 이미지 품질" })}</h3>
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
                <span className="font-semibold text-pestguardTeksUtama">{p({ id: "Ukuran objek.", en: "Object size.", ko: "객체 크기." })}</span> {wawasan.catatanUkuranObjek}
              </span>
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}
