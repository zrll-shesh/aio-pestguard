"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Camera, ChevronDown, Cpu, History, Loader2, Play, RotateCcw, Trash2 } from "lucide-react";
import type { SampelGambar } from "@/lib/model/sampelGambar";
import {
  AMBANG_KEYAKINAN_DEFAULT,
  DAFTAR_MODEL,
  ambilKonfigurasiModel,
  type KonfigurasiModel,
} from "@/lib/model/konfigurasiModel";
import {
  apakahWebGpuTersedia,
  hapusCacheModel,
  infoLingkunganRuntime,
  jalankanDeteksi,
  muatGambar,
  muatRuntimeOrt,
  periksaBerkasModel,
  siapkanSesiModel,
  type MesinInferensi,
  type StatusBerkasModel,
} from "@/lib/model/inferensiOnnx";
import { saringBerdasarkanAmbang, type DeteksiMentah, type InfoLetterbox } from "@/lib/model/pascaproses";
import { analisisKualitasGambar, type HasilAnalisisCitra } from "@/lib/model/analisisCitra";
import { ambilKelasHama } from "@/lib/model/kelasHama";
import { susunLaporanTeks, susunResponsDeteksi, susunWawasanPrediksi } from "@/lib/model/wawasanPrediksi";
import { susunJawabanPetani } from "@/lib/model/wawasanPetani";
import { gabungkanNamaKelas } from "@/lib/utils";
import { useBahasa } from "@/components/i18n/PenyediaBahasa";
import { pilihTeks, terjemahKonten, type Bahasa, type Teks3 } from "@/lib/i18n/bahasa";
import { susunCatatanKualitas } from "@/lib/model/analisisCitra";
import GaleriSampel from "./GaleriSampel";
import PemilihModel from "./PemilihModel";
import PenampilDeteksi from "./PenampilDeteksi";
import JawabanPetani from "./JawabanPetani";
import RingkasanVisualFoto from "./RingkasanVisualFoto";
import { PanelCekPetani, PanelKenaliHama, PanelLangkahPetani } from "./PanelPetani";
import { DaftarDeteksi } from "./PanelHasil";
import PanelBandingModel, { type HasilSatuModel } from "./PanelBandingModel";
import PanelTeknis, { type InfoTeknisJalan } from "./PanelTeknis";

type Tahap = "diam" | "runtime" | "unduh" | "sesi" | "periksa" | "selesai" | "galat";

interface HasilJalan {
  model: KonfigurasiModel;
  sampel: SampelGambar;
  lebar: number;
  tinggi: number;
  deteksiSemua: DeteksiMentah[];
  analisisCitra: HasilAnalisisCitra | null;
  info: InfoTeknisJalan;
}

interface ItemRiwayat {
  waktu: string;
  namaBerkas: string;
  model: string;
  classIdTeratas: number | null;
  jumlahTeratas: number;
  jumlah: number;
}

const TEKS_TAHAP: Record<Tahap, Teks3> = {
  diam: { id: "", en: "", ko: "" },
  runtime: { id: "Menyiapkan mesin di browser", en: "Preparing the engine", ko: "엔진 준비 중" },
  unduh: { id: "Mengunduh model", en: "Downloading model", ko: "모델 내려받는 중" },
  sesi: { id: "Menyiapkan model", en: "Preparing model", ko: "모델 준비 중" },
  periksa: { id: "Memeriksa foto", en: "Checking photo", ko: "사진 확인 중" },
  selesai: { id: "Selesai", en: "Done", ko: "완료" },
  galat: { id: "Gagal", en: "Failed", ko: "실패" },
};

function terjemahkanGalat(galat: unknown, model: KonfigurasiModel, bahasa: Bahasa): string {
  const pesan = galat instanceof Error ? galat.message : String(galat);
  const t = (id: string, en: string, ko: string) => pilihTeks(bahasa, { id, en, ko });
  if (/tidak ditemukan|belum ada/i.test(pesan))
    return t(
      `Berkas model ${model.namaBerkas} belum ada di folder public/models. Salin berkasnya ke sana, lalu muat ulang halaman.`,
      `Model file ${model.namaBerkas} is not in public/models yet. Copy it there and reload the page.`,
      `모델 파일 ${model.namaBerkas}이(가) public/models 폴더에 없습니다. 파일을 복사한 뒤 새로고침하세요.`
    );
  if (/memory|alloc|out of/i.test(pesan))
    return t(
      "Memori perangkat tidak cukup untuk model ini. Tutup tab lain, atau pilih model YOLO11m yang lebih ringan.",
      "Not enough device memory for this model. Close other tabs or choose the lighter YOLO11m.",
      "이 모델을 실행할 메모리가 부족합니다. 다른 탭을 닫거나 더 가벼운 YOLO11m을 선택하세요."
    );
  if (/webgpu/i.test(pesan))
    return t(
      "Mode cepat (WebGPU) tidak berjalan di perangkat ini. Pilih mode Standar di Pengaturan lanjutan.",
      "Fast mode (WebGPU) does not work on this device. Choose Standard in Advanced settings.",
      "이 기기에서는 빠른 모드(WebGPU)가 작동하지 않습니다. 고급 설정에서 표준 모드를 선택하세요."
    );
  if (/Failed to fetch|NetworkError|network/i.test(pesan))
    return t(
      "Koneksi terputus saat mengunduh model. Periksa internet lalu coba lagi.",
      "The connection dropped while downloading the model. Check your internet and try again.",
      "모델을 내려받는 중 연결이 끊겼습니다. 인터넷을 확인하고 다시 시도하세요."
    );
  return pesan;
}

export default function LabDeteksi({ daftarSampel }: { daftarSampel: SampelGambar[] }) {
  const { bahasa, p, tk } = useBahasa();
  const [idModel, setIdModel] = useState<KonfigurasiModel["idModel"]>(DAFTAR_MODEL.find((m) => m.adalahDefault)?.idModel ?? "yolo11l");
  const [mesin, setMesin] = useState<MesinInferensi>("wasm");
  const [webGpuAda, setWebGpuAda] = useState(false);
  const [statusBerkas, setStatusBerkas] = useState<Record<string, StatusBerkasModel | null>>({});
  const [namaSampel, setNamaSampel] = useState<string | null>(daftarSampel[0]?.namaBerkas ?? null);
  const [ukuranPratinjau, setUkuranPratinjau] = useState<{ lebar: number; tinggi: number } | null>(null);
  const [tahap, setTahap] = useState<Tahap>("diam");
  const [progresUnduh, setProgresUnduh] = useState<{ diterima: number; total: number | null }>({ diterima: 0, total: null });
  const [galat, setGalat] = useState<string | null>(null);
  const [hasil, setHasil] = useState<HasilJalan | null>(null);
  const [ambang, setAmbang] = useState(AMBANG_KEYAKINAN_DEFAULT);
  const [idTerpilih, setIdTerpilih] = useState<string | null>(null);
  const [hasilBanding, setHasilBanding] = useState<Record<string, HasilSatuModel>>({});
  const [bandingBerjalan, setBandingBerjalan] = useState(false);
  const [riwayat, setRiwayat] = useState<ItemRiwayat[]>([]);
  const [detailTerbuka, setDetailTerbuka] = useState(false);
  const refHasil = useRef<HTMLDivElement>(null);

  const model = ambilKonfigurasiModel(idModel);
  const sampel = daftarSampel.find((s) => s.namaBerkas === namaSampel) ?? null;
  const sedangBerjalan = tahap === "runtime" || tahap === "unduh" || tahap === "sesi" || tahap === "periksa";
  const hasilCocokPilihan = hasil && sampel && hasil.sampel.namaBerkas === sampel.namaBerkas;

  const perbaruiStatusBerkas = useCallback(async () => {
    const entri = await Promise.all(DAFTAR_MODEL.map(async (m) => [m.idModel, await periksaBerkasModel(m)] as const));
    setStatusBerkas(Object.fromEntries(entri));
  }, []);

  useEffect(() => {
    setWebGpuAda(apakahWebGpuTersedia());
    void perbaruiStatusBerkas();
    // Muat runtime lebih awal di latar belakang supaya tombol terasa cepat
    void muatRuntimeOrt().catch(() => undefined);
  }, [perbaruiStatusBerkas]);

  useEffect(() => {
    if (!sampel) return;
    let batal = false;
    setUkuranPratinjau(null);
    muatGambar(sampel.alamat)
      .then((g) => !batal && setUkuranPratinjau({ lebar: g.naturalWidth, tinggi: g.naturalHeight }))
      .catch(() => undefined);
    return () => {
      batal = true;
    };
  }, [sampel]);

  const jalankanPrediksi = async () => {
    if (!sampel || sedangBerjalan) return;
    setGalat(null);
    setIdTerpilih(null);
    setDetailTerbuka(false);
    setHasilBanding({});
    setProgresUnduh({ diterima: 0, total: null });
    try {
      const mulaiMuat = performance.now();
      const infoSesi = await siapkanSesiModel(
        model,
        mesin,
        (diterima, total) => setProgresUnduh({ diterima, total }),
        (t) => setTahap(t)
      );
      const waktuMuatModelMs = performance.now() - mulaiMuat;
      setTahap("periksa");
      const gambar = await muatGambar(sampel.alamat);
      const hasilInferensi = await jalankanDeteksi(infoSesi, gambar);
      let analisisCitra: HasilAnalisisCitra | null = null;
      try {
        analisisCitra = analisisKualitasGambar(gambar);
      } catch {
        analisisCitra = null;
      }
      const { multiThread, jumlahThread } = infoLingkunganRuntime();
      const { sumber } = await muatRuntimeOrt();
      const hasilBaru: HasilJalan = {
        model,
        sampel,
        lebar: gambar.naturalWidth,
        tinggi: gambar.naturalHeight,
        deteksiSemua: hasilInferensi.deteksiMentah,
        analisisCitra,
        info: {
          mesin: infoSesi.mesinTerpakai,
          sumberRuntime: sumber === "lokal" ? "lokal (/ort)" : "CDN jsDelivr",
          multiThread,
          jumlahThread,
          modelDariCache: infoSesi.dariCache,
          waktu: hasilInferensi.waktu,
          waktuMuatModelMs,
          bentukKeluaran: hasilInferensi.bentukKeluaran,
          jumlahKelasModel: hasilInferensi.jumlahKelasModel,
          infoLetterbox: hasilInferensi.infoLetterbox as InfoLetterbox,
        },
      };
      setHasil(hasilBaru);
      setHasilBanding({ [model.idModel]: { status: "selesai", deteksi: hasilInferensi.deteksiMentah, inferensiMs: hasilInferensi.waktu.inferensiMs } });
      setTahap("selesai");
      void perbaruiStatusBerkas();

      const lolos = saringBerdasarkanAmbang(hasilInferensi.deteksiMentah, ambang);
      const hitung = new Map<number, number>();
      lolos.forEach((d) => hitung.set(d.classId, (hitung.get(d.classId) ?? 0) + 1));
      const teratas = Array.from(hitung.entries()).sort((a, b) => b[1] - a[1])[0];
      setRiwayat((lama) =>
        [
          {
            waktu: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
            namaBerkas: sampel.namaBerkas,
            model: model.namaTampilan,
            classIdTeratas: teratas ? teratas[0] : null,
            jumlahTeratas: teratas ? teratas[1] : 0,
            jumlah: lolos.length,
          },
          ...lama,
        ].slice(0, 8)
      );
      window.setTimeout(() => refHasil.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    } catch (e) {
      setGalat(terjemahkanGalat(e, model, bahasa));
      setTahap("galat");
      void perbaruiStatusBerkas();
    }
  };

  const jalankanBanding = async () => {
    if (!sampel || bandingBerjalan) return;
    setBandingBerjalan(true);
    const gambar = await muatGambar(sampel.alamat);
    for (const m of DAFTAR_MODEL) {
      if (hasilBanding[m.idModel]?.status === "selesai") continue;
      setHasilBanding((lama) => ({ ...lama, [m.idModel]: { status: "berjalan" } }));
      try {
        const infoSesi = await siapkanSesiModel(m, mesin, () => undefined, () => undefined);
        const h = await jalankanDeteksi(infoSesi, gambar);
        setHasilBanding((lama) => ({ ...lama, [m.idModel]: { status: "selesai", deteksi: h.deteksiMentah, inferensiMs: h.waktu.inferensiMs } }));
      } catch (e) {
        setHasilBanding((lama) => ({ ...lama, [m.idModel]: { status: "galat", pesan: terjemahkanGalat(e, m, bahasa) } }));
      }
    }
    setBandingBerjalan(false);
    void perbaruiStatusBerkas();
  };

  // --- Wawasan dihitung ulang setiap ambang berubah, tanpa inferensi ulang ---
  const turunan = useMemo(() => {
    if (!hasil) return null;
    const labelAsli = hasil.sampel.classIdLabelAsli !== null ? ambilKelasHama(hasil.sampel.classIdLabelAsli) : null;
    const analisisCitra = hasil.analisisCitra ? { ...hasil.analisisCitra, daftarCatatan: susunCatatanKualitas(hasil.analisisCitra, bahasa) } : null;
    const lolos = saringBerdasarkanAmbang(hasil.deteksiSemua, ambang);
    const wawasan = susunWawasanPrediksi({
      deteksiMentahLolos: lolos,
      deteksiMentahSemua: hasil.deteksiSemua,
      ambangKeyakinan: ambang,
      lebarGambar: hasil.lebar,
      tinggiGambar: hasil.tinggi,
      labelAsli,
      analisisCitra,
      bahasa,
    });
    const jawaban = susunJawabanPetani(wawasan, analisisCitra, bahasa);
    const laporan = susunLaporanTeks({
      namaBerkas: hasil.sampel.namaBerkas,
      model: hasil.model,
      ambangKeyakinan: ambang,
      wawasan,
      analisisCitra,
      waktuInferensiMs: hasil.info.waktu.inferensiMs,
      mesin: hasil.info.mesin,
      bahasa,
    });
    const json = JSON.stringify(
      susunResponsDeteksi({ namaBerkas: hasil.sampel.namaBerkas, model: hasil.model, ambangKeyakinan: ambang, daftarDeteksi: wawasan.daftarDeteksi }),
      null,
      2
    );
    return { wawasan, jawaban, laporan, json, analisisCitra };
  }, [hasil, ambang, bahasa]);

  const persenUnduh = progresUnduh.total ? Math.min(100, Math.round((progresUnduh.diterima / progresUnduh.total) * 100)) : null;
  const statusModelAktif = statusBerkas[model.idModel];
  const modelBelumAda = statusModelAktif !== undefined && statusModelAktif !== null && !statusModelAktif.tersedia;
  const dasarNamaBerkas = (hasil?.sampel.namaBerkas ?? "foto").replace(/\.[^.]+$/, "");

  const tombolJalankan = (kelasTambahan?: string) => (
    <button
      type="button"
      onClick={jalankanPrediksi}
      disabled={!sampel || sedangBerjalan}
      className={gabungkanNamaKelas(
        "inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-pestguardHijauUtama px-5 text-[16px] font-bold text-white shadow-[0_10px_24px_rgba(20,112,63,0.28)] transition-colors hover:bg-pestguardHijauTua disabled:cursor-not-allowed disabled:opacity-60",
        kelasTambahan
      )}
    >
      {sedangBerjalan ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : hasilCocokPilihan ? <RotateCcw className="h-5 w-5" aria-hidden /> : <Play className="h-5 w-5" aria-hidden />}
      {sedangBerjalan
        ? `${p(TEKS_TAHAP[tahap])}${tahap === "unduh" && persenUnduh !== null ? ` ${persenUnduh}%` : ""}`
        : hasilCocokPilihan
          ? p({ id: "Jalankan ulang prediksi", en: "Run prediction again", ko: "다시 예측하기" })
          : p({ id: "Jalankan prediksi", en: "Run prediction", ko: "예측 실행" })}
    </button>
  );

  return (
    <div className="mx-auto max-w-[1440px] space-y-5 pb-20 lg:pb-0">
      {/* ---------- Pembuka ---------- */}
      <section className="pestguard-hero rounded-[22px] p-6 text-white shadow-pestguardKartu sm:p-8">
        <div className="relative z-[1] grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[12px] font-semibold text-pestguardHijauMuda">
              <Cpu className="h-3.5 w-3.5" aria-hidden /> {p({ id: "Model asli, berjalan di perangkat Anda", en: "Real model, running on your device", ko: "실제 모델, 내 기기에서 실행" })}
            </p>
            <h1 className="mt-4 font-pestguardDisplay text-[28px] font-semibold leading-[1.15] sm:text-[36px]">{p({ id: "Cek hama dari foto", en: "Check pests from a photo", ko: "사진으로 해충 확인" })}</h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-white/75">
              {p({
                id: "Pilih foto perangkap, tekan tombol, dan sistem akan menunjukkan hama apa yang terlihat, seberapa yakin, serta apa yang sebaiknya Anda lakukan. Foto tidak dikirim ke server mana pun.",
                en: "Pick a trap photo, press the button, and the system shows which pest it sees, how sure it is, and what you should do. Photos are never sent to any server.",
                ko: "트랩 사진을 고르고 버튼을 누르면, 어떤 해충이 보이는지, 얼마나 확실한지, 무엇을 하면 좋은지 알려 드립니다. 사진은 어떤 서버로도 보내지 않습니다.",
              })}
            </p>
          </div>
          <ol className="hidden grid-cols-3 gap-2 text-[12.5px] sm:grid">
            {[
              { n: 1, t: { id: "Pilih foto", en: "Pick a photo", ko: "사진 고르기" }, k: { id: "dari contoh yang ada", en: "from the samples", ko: "예시 사진 중에서" } },
              { n: 2, t: { id: "Tekan tombol", en: "Press the button", ko: "버튼 누르기" }, k: { id: "model membaca foto", en: "the model reads it", ko: "모델이 사진을 읽음" } },
              { n: 3, t: { id: "Baca jawaban", en: "Read the answer", ko: "답 확인" }, k: { id: "dan langkah tindakan", en: "and next steps", ko: "그리고 할 일" } },
            ].map((l) => (
              <li key={l.n} className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-pestguardHijauMuda font-pestguardDisplay text-[13px] font-bold text-pestguardNampan">{l.n}</span>
                <p className="mt-2 font-semibold text-white">{p(l.t)}</p>
                <p className="text-white/55">{p(l.k)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- Area kerja ---------- */}
      <div className="grid gap-5 lg:grid-cols-[minmax(300px,380px)_minmax(0,1fr)]">
        <div className="space-y-4 lg:order-1">
          <section className="rounded-pestguardKartu border border-pestguardAbuGaris bg-white p-4 shadow-pestguardKartu sm:p-5">
            <h2 className="flex items-center gap-2 font-pestguardDisplay text-[16px] font-semibold text-pestguardHijauTua">
              <Camera className="h-[18px] w-[18px]" aria-hidden /> {p({ id: "1. Pilih foto yang ingin dicek", en: "1. Choose a photo to check", ko: "1. 확인할 사진 고르기" })}
            </h2>
            <p className="mb-3 mt-1 text-[13px] text-pestguardAbuTeks">{p({ id: `${daftarSampel.length} foto contoh tersedia. Ketuk salah satu.`, en: `${daftarSampel.length} sample photos available. Tap one.`, ko: `예시 사진 ${daftarSampel.length}장이 있습니다. 하나를 누르세요.` })}</p>
            <GaleriSampel daftarSampel={daftarSampel} namaBerkasTerpilih={namaSampel} saatSampelDipilih={(n) => { setNamaSampel(n); setIdTerpilih(null); }} terkunci={sedangBerjalan} />
            {sampel && (
              <p className="mt-3 text-[12.5px] leading-snug text-pestguardAbuTeks">
                <span className="font-semibold text-pestguardTeksUtama">{p(sampel.judul)}</span>
                {sampel.sumber && `, ${p({ id: "sumber", en: "source", ko: "출처" })} ${p(sampel.sumber)}`}
                {sampel.classIdLabelAsli !== null &&
                  p({
                    id: `. Label asli diketahui (${tk(ambilKelasHama(sampel.classIdLabelAsli)?.namaIndonesia ?? "")}), jadi hasil model bisa dicocokkan.`,
                    en: `. The true label is known (${tk(ambilKelasHama(sampel.classIdLabelAsli)?.namaIndonesia ?? "")}), so the model result can be checked.`,
                    ko: `. 실제 정답(${tk(ambilKelasHama(sampel.classIdLabelAsli)?.namaIndonesia ?? "")})을 알고 있어 모델 결과를 대조할 수 있습니다.`,
                  })}
              </p>
            )}
          </section>

          <section className="rounded-pestguardKartu border border-pestguardAbuGaris bg-white p-4 shadow-pestguardKartu sm:p-5">
            <h2 className="font-pestguardDisplay text-[16px] font-semibold text-pestguardHijauTua">{p({ id: "2. Jalankan pemeriksaan", en: "2. Run the check", ko: "2. 확인 실행" })}</h2>
            <p className="mb-3 mt-1 text-[13px] leading-snug text-pestguardAbuTeks">
              {p({ id: "Memakai", en: "Using", ko: "사용 모델" })} <span className="font-semibold text-pestguardTeksUtama">{model.namaTampilan}</span>.{" "}
              {p({
                id: `Pertama kali, model sekitar ${model.perkiraanUkuranOnnxMb ?? 80} MB diunduh sekali, setelah itu langsung jalan, bahkan saat sinyal lemah.`,
                en: `The first time, the model (about ${model.perkiraanUkuranOnnxMb ?? 80} MB) downloads once; after that it runs instantly, even with a weak signal.`,
                ko: `처음 한 번만 약 ${model.perkiraanUkuranOnnxMb ?? 80}MB 모델을 내려받고, 그 뒤에는 신호가 약해도 바로 실행됩니다.`,
              })}
            </p>
            <div className="hidden lg:block">{tombolJalankan()}</div>
            {sedangBerjalan && tahap === "unduh" && (
              <div className="mt-3" aria-live="polite">
                <div className="h-2 overflow-hidden rounded-full bg-pestguardHijauLembut">
                  <div className="h-full rounded-full bg-pestguardHijauSedang transition-[width]" style={{ width: `${persenUnduh ?? 15}%` }} />
                </div>
                <p className="mt-1 text-[12px] text-pestguardAbuTeks">
                  {(progresUnduh.diterima / 1_048_576).toFixed(1)} MB{progresUnduh.total ? ` / ${(progresUnduh.total / 1_048_576).toFixed(1)} MB` : ""}
                </p>
              </div>
            )}
            {modelBelumAda && !galat && (
              <p className="mt-3 flex gap-2 rounded-xl bg-amber-50 p-3 text-[12.5px] leading-snug text-amber-900">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                {p({
                  id: `Berkas ${model.namaBerkas} belum ditemukan di public/models. Salin model ke folder itu, lalu muat ulang.`,
                  en: `${model.namaBerkas} was not found in public/models. Copy the model there and reload.`,
                  ko: `public/models에서 ${model.namaBerkas}을(를) 찾지 못했습니다. 모델을 복사한 뒤 새로고침하세요.`,
                })}
              </p>
            )}
            {galat && (
              <p role="alert" className="mt-3 flex gap-2 rounded-xl bg-red-50 p-3 text-[13px] leading-snug text-pestguardMerahPeringatan">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                {galat}
              </p>
            )}

            <details className="group mt-4 rounded-xl border border-pestguardAbuGaris">
              <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-2 px-3 text-[13px] font-semibold text-pestguardHijauTua [&::-webkit-details-marker]:hidden">
                {p({ id: "Pengaturan lanjutan (pilih model dan mesin)", en: "Advanced settings (model and engine)", ko: "고급 설정 (모델과 엔진)" })}
                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden />
              </summary>
              <div className="space-y-4 border-t border-pestguardAbuGaris p-3">
                <PemilihModel idModelTerpilih={idModel} saatModelDipilih={setIdModel} statusBerkasPerModel={statusBerkas} terkunci={sedangBerjalan} />
                <div>
                  <p className="text-[12.5px] font-semibold text-pestguardTeksUtama">{p({ id: "Mesin", en: "Engine", ko: "엔진" })}</p>
                  <div className="mt-1.5 grid grid-cols-2 gap-1 rounded-xl bg-pestguardHijauPudar p-1" role="radiogroup" aria-label={p({ id: "Mesin inferensi", en: "Inference engine", ko: "추론 엔진" })}>
                    {[
                      { id: "wasm" as const, label: p({ id: "Standar", en: "Standard", ko: "표준" }), ket: p({ id: "semua perangkat", en: "all devices", ko: "모든 기기" }) },
                      {
                        id: "webgpu" as const,
                        label: p({ id: "Cepat", en: "Fast", ko: "빠름" }),
                        ket: webGpuAda ? p({ id: "kartu grafis", en: "graphics card", ko: "그래픽 카드" }) : p({ id: "tidak didukung", en: "not supported", ko: "지원 안 됨" }),
                      },
                    ].map((pil) => (
                      <button
                        key={pil.id}
                        type="button"
                        role="radio"
                        aria-checked={mesin === pil.id}
                        disabled={sedangBerjalan || (pil.id === "webgpu" && !webGpuAda)}
                        onClick={() => setMesin(pil.id)}
                        className={gabungkanNamaKelas(
                          "min-h-[44px] rounded-lg px-2 py-1.5 text-left text-[12.5px] disabled:opacity-40",
                          mesin === pil.id ? "bg-white font-semibold text-pestguardHijauTua shadow-sm" : "text-pestguardAbuTeks"
                        )}
                      >
                        {pil.label}
                        <span className="block text-[11px] font-normal text-pestguardAbuTeks">{pil.ket}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    await hapusCacheModel();
                    void perbaruiStatusBerkas();
                  }}
                  className="inline-flex min-h-[40px] items-center gap-1.5 text-[12.5px] font-semibold text-pestguardAbuTeks hover:text-pestguardMerahPeringatan"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden /> {p({ id: "Hapus model tersimpan di browser", en: "Delete models saved in this browser", ko: "브라우저에 저장된 모델 삭제" })}
                </button>
              </div>
            </details>
          </section>
        </div>

        <div className="min-w-0 lg:order-2">
          {sampel ? (
            <PenampilDeteksi
              alamatGambar={sampel.alamat}
              judulGambar={p(sampel.judul)}
              ukuranGambar={hasilCocokPilihan ? { lebar: hasil.lebar, tinggi: hasil.tinggi } : ukuranPratinjau}
              daftarDeteksi={hasilCocokPilihan && turunan ? turunan.wawasan.daftarDeteksi : null}
              ambangKeyakinan={ambang}
              saatAmbangBerubah={setAmbang}
              idDeteksiTerpilih={idTerpilih}
              saatDeteksiDipilih={setIdTerpilih}
              sedangBerjalan={sedangBerjalan}
              namaBerkasUnduhan={`deteksi-${dasarNamaBerkas}-${model.idModel}.png`}
            />
          ) : (
            <div className="pestguard-nampan grid min-h-[320px] place-items-center rounded-pestguardKartu p-6 text-center text-[14px] text-white/70">
              {p({ id: "Tambahkan foto ke public/sample-images untuk mulai.", en: "Add photos to public/sample-images to start.", ko: "시작하려면 public/sample-images에 사진을 추가하세요." })}
            </div>
          )}
        </div>
      </div>

      {/* ---------- Hasil ---------- */}
      <div ref={refHasil} className="scroll-mt-20 space-y-5">
        {hasilCocokPilihan && turunan ? (
          <>
            <JawabanPetani
              jawaban={turunan.jawaban}
              wawasan={turunan.wawasan}
              teksLaporanLengkap={turunan.laporan}
              namaBerkasLaporan={`laporan-${dasarNamaBerkas}-${hasil.model.idModel}.txt`}
            />
            <RingkasanVisualFoto wawasan={turunan.wawasan} jawaban={turunan.jawaban} detailTerbuka={detailTerbuka} saatDetailDiubah={setDetailTerbuka} />
            {detailTerbuka && (
              <div className="pestguard-muncul space-y-5">
            <PanelLangkahPetani jawaban={turunan.jawaban} />
            <div className="grid gap-5 xl:grid-cols-2">
              <PanelCekPetani jawaban={turunan.jawaban} />
              <DaftarDeteksi wawasan={turunan.wawasan} idDeteksiTerpilih={idTerpilih} saatDeteksiDipilih={setIdTerpilih} />
            </div>
            <PanelKenaliHama daftarRingkasan={turunan.wawasan.ringkasanPerKelas} />
            <PanelBandingModel hasilPerModel={hasilBanding} ambang={ambang} sedangBerjalan={bandingBerjalan} saatJalankan={jalankanBanding} terkunci={sedangBerjalan} />
            <PanelTeknis
              wawasan={turunan.wawasan}
              ambang={ambang}
              analisisCitra={turunan.analisisCitra}
              model={hasil.model}
              info={hasil.info}
              jsonRespons={turunan.json}
              namaBerkasJson={`deteksi-${dasarNamaBerkas}-${hasil.model.idModel}.json`}
            />
              </div>
            )}
          </>
        ) : (
          !sedangBerjalan && (
            <div className="rounded-pestguardKartu border border-dashed border-pestguardAbuGaris bg-white/60 p-6 text-center">
              <p className="font-pestguardDisplay text-[17px] font-semibold text-pestguardHijauTua">{p({ id: "Jawaban akan muncul di sini", en: "The answer will appear here", ko: "여기에 답이 표시됩니다" })}</p>
              <p className="mx-auto mt-1 max-w-md text-[14px] leading-relaxed text-pestguardAbuTeks">
                {p({
                  id: "Setelah prediksi selesai, Anda akan melihat jenis hama, seberapa bisa dipercaya, langkah yang perlu dilakukan, dan cara mengenali hama itu di lahan.",
                  en: "When the prediction finishes, you will see the pest type, how reliable it is, what to do, and how to recognise the pest in the field.",
                  ko: "예측이 끝나면 해충 종류, 결과를 얼마나 믿을 수 있는지, 해야 할 일, 그리고 밭에서 해충을 알아보는 법이 표시됩니다.",
                })}
              </p>
            </div>
          )
        )}

        {riwayat.length > 0 && (
          <section className="rounded-pestguardKartu border border-pestguardAbuGaris bg-white p-5 shadow-pestguardKartu">
            <h2 className="flex items-center gap-2 font-pestguardDisplay text-[16px] font-semibold text-pestguardHijauTua">
              <History className="h-[18px] w-[18px]" aria-hidden /> {p({ id: "Pemeriksaan di kunjungan ini", en: "Checks during this visit", ko: "이번 방문의 확인 기록" })}
            </h2>
            <ul className="mt-3 divide-y divide-pestguardAbuGaris">
              {riwayat.map((r, i) => (
                <li key={`${r.waktu}-${i}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-[13.5px]">
                  <span className="w-12 text-pestguardAbuTeks">{r.waktu}</span>
                  <button type="button" onClick={() => setNamaSampel(r.namaBerkas)} className="min-w-0 flex-1 truncate text-left font-semibold text-pestguardHijauUtama hover:underline">
                    {r.namaBerkas}
                  </button>
                  <span className="text-pestguardTeksUtama">
                    {r.classIdTeratas !== null
                      ? `${tk(ambilKelasHama(r.classIdTeratas)?.namaIndonesia ?? "")} (${r.jumlahTeratas})`
                      : p({ id: "Tidak ada hama", en: "No pests", ko: "해충 없음" })}
                  </span>
                  <span className="text-[12px] text-pestguardAbuTeks">{r.model}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* Tombol tetap di bawah layar ponsel, di atas menu navigasi */}
      <div className="fixed inset-x-0 bottom-[60px] z-20 border-t border-pestguardAbuGaris bg-white/95 px-4 py-2.5 backdrop-blur lg:hidden">
        {tombolJalankan()}
      </div>
    </div>
  );
}
