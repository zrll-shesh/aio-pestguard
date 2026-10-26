"use client";

import Link from "next/link";
import { Camera, ClipboardCheck, Cpu, Lightbulb, Sprout } from "lucide-react";
import KartuDasar from "@/components/ui/KartuDasar";
import { DAFTAR_TAHAP_PROYEK } from "@/lib/mockData";
import { DAFTAR_MODEL } from "@/lib/model/konfigurasiModel";
import type { Teks3 } from "@/lib/i18n/bahasa";
import { gabungkanNamaKelas } from "@/lib/utils";
import { useBahasa } from "@/components/i18n/PenyediaBahasa";

const DAFTAR_ALUR_SISTEM: Array<{ IkonAlur: typeof Camera; judul: Teks3; isi: Teks3 }> = [
  {
    IkonAlur: Camera,
    judul: { id: "1. Foto perangkap", en: "1. Trap photo", ko: "1. 트랩 사진" },
    isi: { id: "Perangkap di lahan memotret hama yang menempel secara berkala.", en: "Traps in the field regularly photograph the pests they catch.", ko: "밭의 트랩이 붙은 해충을 정기적으로 촬영합니다." },
  },
  {
    IkonAlur: Cpu,
    judul: { id: "2. Sistem mengenali hama", en: "2. The system identifies pests", ko: "2. 시스템이 해충 인식" },
    isi: { id: "Model kecerdasan buatan menandai setiap hama dengan kotak dan menyebut jenisnya.", en: "The AI model marks each pest with a box and names its type.", ko: "인공지능 모델이 해충마다 상자를 그리고 종류를 알려 줍니다." },
  },
  {
    IkonAlur: Sprout,
    judul: { id: "3. Dihitung per lahan", en: "3. Counted per field", ko: "3. 농지별 집계" },
    isi: { id: "Jumlah hama dijumlahkan per hari dan dibandingkan dengan batas aman lahan.", en: "Pests are totalled per day and compared with the field's safe limit.", ko: "해충 수를 날마다 합산해 농지의 안전 기준과 비교합니다." },
  },
  {
    IkonAlur: Lightbulb,
    judul: { id: "4. Wawasan dan saran", en: "4. Insight and advice", ko: "4. 인사이트와 안내" },
    isi: { id: "Sistem menyusun kalimat sederhana, perkiraan fase hama, cara alami, dan pilihan obat dari referensi.", en: "The system writes plain sentences, life-stage estimates, natural methods, and chemical options from the reference.", ko: "쉬운 문장, 발육 단계 추정, 친환경 방법, 참고 자료의 약제 선택지를 알려 줍니다." },
  },
  {
    IkonAlur: ClipboardCheck,
    judul: { id: "5. Petani bertindak", en: "5. Farmers act", ko: "5. 농민의 조치" },
    isi: { id: "Petani memeriksa lahan, mengendalikan bila perlu, lalu melihat hasilnya di foto berikutnya.", en: "Farmers check the field, take control measures if needed, then see the effect in the next photo.", ko: "밭을 확인하고 필요하면 방제한 뒤, 다음 사진에서 결과를 봅니다." },
  },
];

const DAFTAR_ISTILAH: Array<{ istilah: Teks3; arti: Teks3 }> = [
  {
    istilah: { id: "Keyakinan (confidence)", en: "Confidence", ko: "신뢰도 (confidence)" },
    arti: { id: "Seberapa yakin sistem bahwa yang ditandai benar hama tersebut. Di bawah 50 persen, mohon dicek langsung.", en: "How sure the system is that the marked object really is that pest. Below 50 percent, please check in person.", ko: "표시한 것이 정말 그 해충이라고 시스템이 얼마나 확신하는지입니다. 50% 미만이면 직접 확인하세요." },
  },
  {
    istilah: { id: "Batas aman mingguan", en: "Weekly safe limit", ko: "주간 안전 기준" },
    arti: { id: "Jumlah hama per minggu yang masih bisa ditoleransi lahan. Bila terlewati, risiko menjadi tinggi.", en: "The number of pests per week a field can still tolerate. Above it, the risk becomes high.", ko: "농지가 견딜 수 있는 주간 해충 수입니다. 넘으면 위험이 높아집니다." },
  },
  {
    istilah: { id: "Fase atau stadium", en: "Life stage", ko: "발육 단계" },
    arti: { id: "Tahap hidup hama, dari telur, anakan (nimfa atau larva), sampai dewasa. Hama paling merusak pada fase tertentu.", en: "A pest's stage of life, from egg to young (nymph or larva) to adult. Pests do the most damage at certain stages.", ko: "알, 어린 시기(약충·유충), 성충으로 이어지는 단계입니다. 특정 단계에서 피해가 가장 큽니다." },
  },
  {
    istilah: { id: "Oviposisi", en: "Oviposition", ko: "산란" },
    arti: { id: "Masa hama dewasa mulai bertelur. Pengendalian sebelum masa ini mencegah ledakan populasi.", en: "When adult pests start laying eggs. Control before this point prevents population outbreaks.", ko: "성충이 알을 낳기 시작하는 때입니다. 그 전에 방제하면 대발생을 막을 수 있습니다." },
  },
  {
    istilah: { id: "Bahan aktif", en: "Active ingredient", ko: "유효성분" },
    arti: { id: "Zat di dalam obat yang membunuh hama. Pakai bahan aktif berbeda secara bergantian agar hama tidak kebal.", en: "The substance in a pesticide that kills pests. Alternate different ones so pests do not become resistant.", ko: "농약 속에서 해충을 죽이는 성분입니다. 저항성이 생기지 않게 다른 성분을 번갈아 쓰세요." },
  },
  {
    istilah: { id: "Pestisida nabati", en: "Botanical pesticide", ko: "식물성 농약" },
    arti: { id: "Pengendali hama dari bahan tumbuhan, misalnya ekstrak daun mimba. Lebih aman untuk musuh alami dan tidak meninggalkan residu kimia.", en: "Pest control made from plants, such as neem leaf extract. Safer for natural enemies and leaves no chemical residue.", ko: "님 잎 추출물처럼 식물로 만든 방제제입니다. 천적에게 더 안전하고 화학 잔류물이 없습니다." },
  },
];

const DAFTAR_STATUS_LABEL = {
  selesai: { label: { id: "Sudah jalan", en: "Done", ko: "완료" }, kelas: "bg-pestguardHijauLembut text-pestguardHijauUtama" },
  berjalan: { label: { id: "Sedang dibuat", en: "In progress", ko: "진행 중" }, kelas: "bg-amber-50 text-pestguardKuningPeringatan" },
  rencana: { label: { id: "Rencana", en: "Planned", ko: "계획" }, kelas: "bg-gray-100 text-pestguardAbuTeks" },
} as const;

const HAL_PERLU_DIKETAHUI: Teks3[] = [
  {
    id: "Halaman Beranda dan Riwayat masih memakai data contoh, termasuk lokasi lahan di peta. Halaman Cek Hama dari Foto memakai model asli.",
    en: "Home and History still use sample data, including the field locations on the map. Check Pests by Photo uses the real model.",
    ko: "홈과 기록은 지도 위 농지 위치를 포함해 예시 데이터를 씁니다. '사진으로 해충 확인'은 실제 모델을 씁니다.",
  },
  {
    id: "Model dilatih dengan foto close-up dari dataset IP102. Foto dari perangkap di lahan bisa lebih jauh dan lebih kecil, sehingga hasilnya perlu diuji ulang di lapangan.",
    en: "The model was trained on close-up photos from the IP102 dataset. Field trap photos may be more distant and smaller, so results need re-testing in the field.",
    ko: "모델은 IP102 데이터셋의 근접 사진으로 학습했습니다. 현장 트랩 사진은 더 멀고 작을 수 있어 현장 재검증이 필요합니다.",
  },
  {
    id: "Hasil model ONNX sedikit berbeda dari versi PyTorch saat divalidasi di notebook (selisih keyakinan rata-rata sekitar 2 poin persen, selisih jumlah deteksi 0,1 per gambar).",
    en: "ONNX model results differ slightly from the PyTorch version in notebook validation (about 2 percentage points of confidence on average, 0.1 detections per image).",
    ko: "노트북 검증에서 ONNX 결과는 PyTorch와 약간 다릅니다(평균 신뢰도 약 2%p, 이미지당 탐지 수 0.1개 차이).",
  },
  {
    id: "Ada 7 jenis hama yang tidak punya contoh di data uji, jadi kemampuan sistem untuk jenis itu belum terukur. Ini ditandai “Belum diuji” di Kamus Hama.",
    en: "7 pest types have no examples in the test data, so the system's skill on them is unmeasured. They are marked “Not yet tested” in the Pest Guide.",
    ko: "시험 데이터에 사례가 없는 해충 7종은 정확도를 측정하지 못했습니다. 해충 도감에 '미검증'으로 표시됩니다.",
  },
  {
    id: "Perkiraan fase hama dan waktu bertelur memakai data literatur dan belum dikalibrasi dengan ukuran asli dari foto.",
    en: "Life-stage and egg-laying estimates use literature data and are not yet calibrated against real sizes from photos.",
    ko: "발육 단계와 산란 시기 추정은 문헌 자료를 쓰며, 사진 속 실제 크기로 보정되지 않았습니다.",
  },
  {
    id: "Untuk bawang, model baru mengenali kelompok hama secara umum sehingga keyakinannya cenderung lebih rendah. Pengecekan langsung sangat dianjurkan.",
    en: "For shallots, the model only recognises general pest groups, so confidence tends to be lower. Checking in person is strongly recommended.",
    ko: "샬롯의 경우 일반적인 해충 무리만 인식해 신뢰도가 낮은 편입니다. 직접 확인을 강하게 권합니다.",
  },
  {
    id: "Pilihan obat dan cara alami berasal dari referensi tim AIGRA dan bukan pengganti anjuran penyuluh pertanian lapangan.",
    en: "Chemical and natural options come from the AIGRA team reference and do not replace advice from agricultural extension officers.",
    ko: "약제와 친환경 방법은 AIGRA 팀 참고 자료이며 농업 지도사의 안내를 대신하지 않습니다.",
  },
];

export default function IsiPanduan() {
  const { p, tk, angka } = useBahasa();
  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div>
        <h1 className="font-pestguardDisplay text-[28px] font-semibold text-pestguardHijauTua sm:text-3xl">{p({ id: "Cara Kerja Sistem", en: "How It Works", ko: "시스템 안내" })}</h1>
        <p className="mt-1 max-w-2xl text-[15px] leading-relaxed text-pestguardAbuTeks">
          {p({
            id: "Penjelasan singkat bagaimana AIO PESTGUARD bekerja, apa arti istilahnya, dan bagian mana yang sudah jalan atau masih direncanakan.",
            en: "A short explanation of how AIO PESTGUARD works, what the terms mean, and which parts are running or still planned.",
            ko: "AIO PESTGUARD의 작동 방식, 용어의 뜻, 완료된 부분과 계획 중인 부분을 간단히 설명합니다.",
          })}
        </p>
      </div>

      <KartuDasar judulKartu={p({ id: "Dari foto sampai tindakan", en: "From photo to action", ko: "사진에서 조치까지" })}>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {DAFTAR_ALUR_SISTEM.map(({ IkonAlur, judul, isi }) => (
            <li key={judul.id} className="rounded-xl border border-pestguardAbuGaris bg-pestguardHijauPudar p-4">
              <IkonAlur className="h-6 w-6 text-pestguardHijauUtama" aria-hidden />
              <p className="mt-2 text-sm font-semibold text-pestguardHijauTua">{p(judul)}</p>
              <p className="mt-1 text-sm leading-relaxed text-pestguardAbuTeks">{p(isi)}</p>
            </li>
          ))}
        </ol>
      </KartuDasar>

      <KartuDasar judulKartu={p({ id: "Arti istilah di layar", en: "Terms on screen", ko: "화면 속 용어" })}>
        <dl className="grid gap-4 sm:grid-cols-2">
          {DAFTAR_ISTILAH.map(({ istilah, arti }) => (
            <div key={istilah.id}>
              <dt className="text-sm font-semibold text-pestguardHijauTua">{p(istilah)}</dt>
              <dd className="mt-0.5 text-sm leading-relaxed text-pestguardAbuTeks">{p(arti)}</dd>
            </div>
          ))}
        </dl>
      </KartuDasar>

      <KartuDasar
        judulKartu={p({ id: "Seberapa jeli model pengenal hama", en: "How sharp is the pest model", ko: "해충 인식 모델은 얼마나 정확한가" })}
        keteranganKartu={p({
          id: "Hasil uji asli dari notebook pada 110 gambar uji (144 hama). Ketiga model bisa dicoba di halaman Cek Hama dari Foto.",
          en: "Real test results from the notebook on 110 test images (144 pests). All three models can be tried on the Check Pests by Photo page.",
          ko: "노트북의 시험 이미지 110장(해충 144마리) 실제 결과입니다. 세 모델 모두 '사진으로 해충 확인'에서 써 볼 수 있습니다.",
        })}
      >
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          {[
            {
              angka: p({ id: "85 dari 100", en: "85 of 100", ko: "100마리 중 85" }),
              arti: p({ id: "hama di foto berhasil ditemukan oleh model utama YOLO11l", en: "pests in photos are found by the main model YOLO11l", ko: "사진 속 해충을 주 모델 YOLO11l이 찾아냄" }),
            },
            {
              angka: p({ id: "8 dari 10", en: "8 of 10", ko: "10개 중 8" }),
              arti: p({ id: "tanda pada keyakinan 35% ke atas memang hama yang benar", en: "marks at 35%+ confidence are the correct pest", ko: "신뢰도 35% 이상 표시가 실제로 맞음" }),
            },
            {
              angka: p({ id: "97 dari 100", en: "97 of 100", ko: "100개 중 97" }),
              arti: p({ id: "temuan dengan keyakinan 80 sampai 90% terbukti benar", en: "findings at 80-90% confidence proved correct", ko: "신뢰도 80~90% 발견이 맞았음" }),
            },
          ].map((item) => (
            <div key={item.angka} className="rounded-xl bg-pestguardHijauPudar p-4">
              <p className="font-pestguardDisplay text-2xl font-semibold text-pestguardHijauTua">{item.angka}</p>
              <p className="mt-1 text-sm leading-relaxed text-pestguardAbuTeks">{item.arti}</p>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto rounded-xl border border-pestguardAbuGaris">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-pestguardHijauPudar">
              <tr className="text-[12px] text-pestguardAbuTeks">
                <th className="px-3 py-2 font-semibold">{p({ id: "Model", en: "Model", ko: "모델" })}</th>
                <th className="px-3 py-2 text-right font-semibold">mAP50</th>
                <th className="px-3 py-2 text-right font-semibold">mAP50-95</th>
                <th className="px-3 py-2 text-right font-semibold">{p({ id: "Presisi", en: "Precision", ko: "정밀도" })}</th>
                <th className="px-3 py-2 text-right font-semibold">{p({ id: "Recall", en: "Recall", ko: "재현율" })}</th>
                <th className="px-3 py-2 text-right font-semibold">{p({ id: "F1 di ambang 35% (rentang 95%)", en: "F1 at 35% threshold (95% CI)", ko: "35% 임계값 F1 (95% 구간)" })}</th>
                <th className="px-3 py-2 text-right font-semibold">{p({ id: "Parameter", en: "Parameters", ko: "파라미터" })}</th>
              </tr>
            </thead>
            <tbody>
              {DAFTAR_MODEL.map((model) => (
                <tr key={model.idModel} className={gabungkanNamaKelas("border-t border-pestguardAbuGaris", model.adalahDefault && "bg-pestguardHijauLembut/60 font-semibold")}>
                  <td className="px-3 py-2.5">
                    {model.namaTampilan}
                    {model.adalahDefault && <span className="ml-2 rounded-full bg-pestguardHijauUtama px-2 py-0.5 text-[10px] text-white">{p({ id: "Dipakai", en: "In use", ko: "사용 중" })}</span>}
                  </td>
                  <td className="px-3 py-2.5 text-right">{angka(model.metrikUji.map50, 3)}</td>
                  <td className="px-3 py-2.5 text-right">{angka(model.metrikUji.map50Sampai95, 3)}</td>
                  <td className="px-3 py-2.5 text-right">{angka(model.metrikUji.presisi, 3)}</td>
                  <td className="px-3 py-2.5 text-right">{angka(model.metrikUji.recall, 3)}</td>
                  <td className="px-3 py-2.5 text-right">
                    {angka(model.f1Bootstrap.titik, 3)} ({angka(model.f1Bootstrap.bawah, 2)}–{angka(model.f1Bootstrap.atas, 2)})
                  </td>
                  <td className="px-3 py-2.5 text-right">{angka(model.jumlahParameterJuta, 2)} M</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-pestguardAbuTeks">
          {p({
            id: "Rentang F1 ketiga model saling tumpang tindih, jadi perbedaannya belum tentu berarti dengan data uji sekecil ini. YOLO11l dipilih karena paling jeli menemukan hama (recall tertinggi), yang penting agar serangan tidak terlewat.",
            en: "The three models' F1 ranges overlap, so the differences may not be meaningful with such a small test set. YOLO11l was chosen because it finds the most pests (highest recall), which matters so outbreaks are not missed.",
            ko: "세 모델의 F1 구간이 겹치므로 이렇게 작은 시험 데이터에서는 차이가 의미 없을 수 있습니다. YOLO11l은 해충을 가장 많이 찾아내(재현율 최고) 피해를 놓치지 않기 위해 선택되었습니다.",
          })}
        </p>
        <Link href="/deteksi" className="mt-3 inline-flex min-h-[44px] items-center rounded-xl bg-pestguardHijauUtama px-4 text-sm font-semibold text-white hover:bg-pestguardHijauTua">
          {p({ id: "Coba modelnya sekarang", en: "Try the model now", ko: "지금 모델 써 보기" })}
        </Link>
      </KartuDasar>

      <KartuDasar judulKartu={p({ id: "Sudah sampai mana pengerjaan", en: "Project progress", ko: "진행 상황" })}>
        <ul className="space-y-3">
          {DAFTAR_TAHAP_PROYEK.map((tahap) => {
            const gaya = DAFTAR_STATUS_LABEL[tahap.status];
            return (
              <li key={tahap.namaTahap} className="rounded-xl border border-pestguardAbuGaris p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-pestguardTeksUtama">{tk(tahap.namaTahap)}</span>
                  <span className={gabungkanNamaKelas("rounded-full px-2.5 py-0.5 text-xs font-semibold", gaya.kelas)}>{p(gaya.label)}</span>
                </div>
                <p className="mt-1 text-sm text-pestguardTeksUtama">{tk(tahap.penjelasanUntukPetani)}</p>
                <p className="mt-1 text-xs text-pestguardAbuTeks">
                  {p({ id: "Teknis", en: "Technical", ko: "기술" })}: {tk(tahap.penjelasanTeknis)}
                </p>
              </li>
            );
          })}
        </ul>
      </KartuDasar>

      <KartuDasar judulKartu={p({ id: "Hal yang perlu diketahui", en: "Good to know", ko: "알아 두실 점" })}>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-pestguardTeksUtama">
          {HAL_PERLU_DIKETAHUI.map((hal) => (
            <li key={hal.id}>{p(hal)}</li>
          ))}
        </ul>
      </KartuDasar>
    </div>
  );
}
