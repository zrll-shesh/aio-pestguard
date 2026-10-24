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
import GaleriSampel from "./GaleriSampel";
import PemilihModel from "./PemilihModel";
import PenampilDeteksi from "./PenampilDeteksi";
import JawabanPetani from "./JawabanPetani";
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
  ringkas: string;
  jumlah: number;
}

const TEKS_TAHAP: Record<Tahap, string> = {
  diam: "",
  runtime: "Menyiapkan mesin di browser",
  unduh: "Mengunduh model",
  sesi: "Menyiapkan model",
  periksa: "Memeriksa foto",
  selesai: "Selesai",
  galat: "Gagal",
};

function terjemahkanGalat(galat: unknown, model: KonfigurasiModel): string {
  const pesan = galat instanceof Error ? galat.message : String(galat);
  if (/tidak ditemukan|belum ada/i.test(pesan)) return `Berkas model ${model.namaBerkas} belum ada di folder public/models. Salin berkasnya ke sana, lalu muat ulang halaman.`;
  if (/memory|alloc|out of/i.test(pesan)) return "Memori perangkat tidak cukup untuk model ini. Tutup tab lain, atau pilih model YOLO11m yang lebih ringan.";
  if (/webgpu/i.test(pesan)) return "Mode cepat (WebGPU) tidak berjalan di perangkat ini. Pilih mode Standar di Pengaturan lanjutan.";
  if (/Failed to fetch|NetworkError|network/i.test(pesan)) return "Koneksi terputus saat mengunduh model. Periksa internet lalu coba lagi.";
  return pesan;
}

export default function LabDeteksi({ daftarSampel }: { daftarSampel: SampelGambar[] }) {
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
            ringkas: teratas ? `${ambilKelasHama(teratas[0])?.namaIndonesia} (${teratas[1]})` : "Tidak ada hama",
            jumlah: lolos.length,
          },
          ...lama,
        ].slice(0, 8)
      );
      window.setTimeout(() => refHasil.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    } catch (e) {
      setGalat(terjemahkanGalat(e, model));
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
        setHasilBanding((lama) => ({ ...lama, [m.idModel]: { status: "galat", pesan: terjemahkanGalat(e, m) } }));
      }
    }
    setBandingBerjalan(false);
    void perbaruiStatusBerkas();
  };

  // --- Wawasan dihitung ulang setiap ambang berubah, tanpa inferensi ulang ---
  const turunan = useMemo(() => {
    if (!hasil) return null;
    const labelAsli = hasil.sampel.classIdLabelAsli !== null ? ambilKelasHama(hasil.sampel.classIdLabelAsli) : null;
    const lolos = saringBerdasarkanAmbang(hasil.deteksiSemua, ambang);
    const wawasan = susunWawasanPrediksi({
      deteksiMentahLolos: lolos,
      deteksiMentahSemua: hasil.deteksiSemua,
      ambangKeyakinan: ambang,
      lebarGambar: hasil.lebar,
      tinggiGambar: hasil.tinggi,
      labelAsli,
      analisisCitra: hasil.analisisCitra,
    });
    const jawaban = susunJawabanPetani(wawasan, hasil.analisisCitra);
    const laporan = susunLaporanTeks({
      namaBerkas: hasil.sampel.namaBerkas,
      model: hasil.model,
      ambangKeyakinan: ambang,
      wawasan,
      analisisCitra: hasil.analisisCitra,
      waktuInferensiMs: hasil.info.waktu.inferensiMs,
      mesin: hasil.info.mesin,
    });
    const json = JSON.stringify(
      susunResponsDeteksi({ namaBerkas: hasil.sampel.namaBerkas, model: hasil.model, ambangKeyakinan: ambang, daftarDeteksi: wawasan.daftarDeteksi }),
      null,
      2
    );
    return { wawasan, jawaban, laporan, json };
  }, [hasil, ambang]);

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
      {sedangBerjalan ? `${TEKS_TAHAP[tahap]}${tahap === "unduh" && persenUnduh !== null ? ` ${persenUnduh}%` : ""}` : hasilCocokPilihan ? "Jalankan ulang prediksi" : "Jalankan prediksi"}
    </button>
  );

  return (
    <div className="mx-auto max-w-[1440px] space-y-5 pb-20 lg:pb-0">
      {/* ---------- Pembuka ---------- */}
      <section className="pestguard-hero rounded-[22px] p-6 text-white shadow-pestguardKartu sm:p-8">
        <div className="relative z-[1] grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[12px] font-semibold text-pestguardHijauMuda">
              <Cpu className="h-3.5 w-3.5" aria-hidden /> Model asli, berjalan di perangkat Anda
            </p>
            <h1 className="mt-4 font-pestguardDisplay text-[28px] font-semibold leading-[1.15] sm:text-[36px]">Cek hama dari foto</h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-white/75">
              Pilih foto perangkap, tekan tombol, dan sistem akan menunjukkan hama apa yang terlihat, seberapa yakin, serta apa yang sebaiknya Anda lakukan. Foto tidak dikirim ke
              server mana pun.
            </p>
          </div>
          <ol className="hidden grid-cols-3 gap-2 text-[12.5px] sm:grid">
            {[
              { n: 1, t: "Pilih foto", k: "dari contoh yang ada" },
              { n: 2, t: "Tekan tombol", k: "model membaca foto" },
              { n: 3, t: "Baca jawaban", k: "dan langkah tindakan" },
            ].map((l) => (
              <li key={l.n} className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-pestguardHijauMuda font-pestguardDisplay text-[13px] font-bold text-pestguardNampan">{l.n}</span>
                <p className="mt-2 font-semibold text-white">{l.t}</p>
                <p className="text-white/55">{l.k}</p>
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
              <Camera className="h-[18px] w-[18px]" aria-hidden /> 1. Pilih foto yang ingin dicek
            </h2>
            <p className="mb-3 mt-1 text-[13px] text-pestguardAbuTeks">{daftarSampel.length} foto contoh tersedia. Ketuk salah satu.</p>
            <GaleriSampel daftarSampel={daftarSampel} namaBerkasTerpilih={namaSampel} saatSampelDipilih={(n) => { setNamaSampel(n); setIdTerpilih(null); }} terkunci={sedangBerjalan} />
            {sampel && (
              <p className="mt-3 text-[12.5px] leading-snug text-pestguardAbuTeks">
                <span className="font-semibold text-pestguardTeksUtama">{sampel.judul}</span>
                {sampel.sumber && `, sumber ${sampel.sumber}`}
                {sampel.classIdLabelAsli !== null && (
                  <>. Label asli diketahui ({ambilKelasHama(sampel.classIdLabelAsli)?.namaIndonesia}), jadi hasil model bisa dicocokkan.</>
                )}
              </p>
            )}
          </section>

          <section className="rounded-pestguardKartu border border-pestguardAbuGaris bg-white p-4 shadow-pestguardKartu sm:p-5">
            <h2 className="font-pestguardDisplay text-[16px] font-semibold text-pestguardHijauTua">2. Jalankan pemeriksaan</h2>
            <p className="mb-3 mt-1 text-[13px] leading-snug text-pestguardAbuTeks">
              Memakai <span className="font-semibold text-pestguardTeksUtama">{model.namaTampilan}</span>. Pertama kali, model sekitar {model.perkiraanUkuranOnnxMb ?? 80} MB diunduh
              sekali, setelah itu langsung jalan, bahkan saat sinyal lemah.
            </p>
            <div className="hidden lg:block">{tombolJalankan()}</div>
            {sedangBerjalan && tahap === "unduh" && (
              <div className="mt-3" aria-live="polite">
                <div className="h-2 overflow-hidden rounded-full bg-pestguardHijauLembut">
                  <div className="h-full rounded-full bg-pestguardHijauSedang transition-[width]" style={{ width: `${persenUnduh ?? 15}%` }} />
                </div>
                <p className="mt-1 text-[12px] text-pestguardAbuTeks">
                  {(progresUnduh.diterima / 1_048_576).toFixed(1)} MB{progresUnduh.total ? ` dari ${(progresUnduh.total / 1_048_576).toFixed(1)} MB` : ""}
                </p>
              </div>
            )}
            {modelBelumAda && !galat && (
              <p className="mt-3 flex gap-2 rounded-xl bg-amber-50 p-3 text-[12.5px] leading-snug text-amber-900">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                Berkas {model.namaBerkas} belum ditemukan di public/models. Salin model ke folder itu, lalu muat ulang.
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
                Pengaturan lanjutan (pilih model dan mesin)
                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden />
              </summary>
              <div className="space-y-4 border-t border-pestguardAbuGaris p-3">
                <PemilihModel idModelTerpilih={idModel} saatModelDipilih={setIdModel} statusBerkasPerModel={statusBerkas} terkunci={sedangBerjalan} />
                <div>
                  <p className="text-[12.5px] font-semibold text-pestguardTeksUtama">Mesin</p>
                  <div className="mt-1.5 grid grid-cols-2 gap-1 rounded-xl bg-pestguardHijauPudar p-1" role="radiogroup" aria-label="Mesin inferensi">
                    {[
                      { id: "wasm" as const, label: "Standar", ket: "semua perangkat" },
                      { id: "webgpu" as const, label: "Cepat", ket: webGpuAda ? "kartu grafis" : "tidak didukung" },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        role="radio"
                        aria-checked={mesin === p.id}
                        disabled={sedangBerjalan || (p.id === "webgpu" && !webGpuAda)}
                        onClick={() => setMesin(p.id)}
                        className={gabungkanNamaKelas(
                          "min-h-[44px] rounded-lg px-2 py-1.5 text-left text-[12.5px] disabled:opacity-40",
                          mesin === p.id ? "bg-white font-semibold text-pestguardHijauTua shadow-sm" : "text-pestguardAbuTeks"
                        )}
                      >
                        {p.label}
                        <span className="block text-[11px] font-normal text-pestguardAbuTeks">{p.ket}</span>
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
                  <Trash2 className="h-3.5 w-3.5" aria-hidden /> Hapus model tersimpan di browser
                </button>
              </div>
            </details>
          </section>
        </div>

        <div className="min-w-0 lg:order-2">
          {sampel ? (
            <PenampilDeteksi
              alamatGambar={sampel.alamat}
              judulGambar={sampel.judul}
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
              Tambahkan foto ke public/sample-images untuk mulai.
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
              analisisCitra={hasil.analisisCitra}
              model={hasil.model}
              info={hasil.info}
              jsonRespons={turunan.json}
              namaBerkasJson={`deteksi-${dasarNamaBerkas}-${hasil.model.idModel}.json`}
            />
          </>
        ) : (
          !sedangBerjalan && (
            <div className="rounded-pestguardKartu border border-dashed border-pestguardAbuGaris bg-white/60 p-6 text-center">
              <p className="font-pestguardDisplay text-[17px] font-semibold text-pestguardHijauTua">Jawaban akan muncul di sini</p>
              <p className="mx-auto mt-1 max-w-md text-[14px] leading-relaxed text-pestguardAbuTeks">
                Setelah prediksi selesai, Anda akan melihat jenis hama, seberapa bisa dipercaya, langkah yang perlu dilakukan, dan cara mengenali hama itu di lahan.
              </p>
            </div>
          )
        )}

        {riwayat.length > 0 && (
          <section className="rounded-pestguardKartu border border-pestguardAbuGaris bg-white p-5 shadow-pestguardKartu">
            <h2 className="flex items-center gap-2 font-pestguardDisplay text-[16px] font-semibold text-pestguardHijauTua">
              <History className="h-[18px] w-[18px]" aria-hidden /> Pemeriksaan di kunjungan ini
            </h2>
            <ul className="mt-3 divide-y divide-pestguardAbuGaris">
              {riwayat.map((r, i) => (
                <li key={`${r.waktu}-${i}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-[13.5px]">
                  <span className="w-12 text-pestguardAbuTeks">{r.waktu}</span>
                  <button type="button" onClick={() => setNamaSampel(r.namaBerkas)} className="min-w-0 flex-1 truncate text-left font-semibold text-pestguardHijauUtama hover:underline">
                    {r.namaBerkas}
                  </button>
                  <span className="text-pestguardTeksUtama">{r.ringkas}</span>
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
