"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Map as PetaMaplibre, Marker } from "maplibre-gl";
import { Layers, LocateFixed, MapPinned, WifiOff } from "lucide-react";
import type { JenisKomoditas, RingkasanLahan, TingkatRisikoLahan } from "@/lib/types";
import { DAFTAR_LAHAN_DI_PETA, DAFTAR_PERANGKAP, tentukanStatusPerangkap } from "@/lib/dataPeta";
import { namaHamaLahan } from "@/lib/i18n/wawasanLahan";
import { LABEL_RISIKO } from "@/components/ui/LencanaStatus";
import { gabungkanNamaKelas } from "@/lib/utils";
import { useBahasa } from "@/components/i18n/PenyediaBahasa";

/** Peta dasar gratis tanpa kunci API (OpenFreeMap). Warnanya diredam ke hijau-putih setelah dimuat. */
const ALAMAT_GAYA_PETA = process.env.NEXT_PUBLIC_MAP_STYLE_URL ?? "https://tiles.openfreemap.org/styles/positron";
const BATAS_WAKTU_PETA_MS = 9000;
/** Di bawah tingkat zoom ini, perangkap digabung menjadi satu titik per lahan supaya tidak bertumpuk */
const ZOOM_TAMPIL_PERANGKAP = 13;

export const WARNA_STATUS: Record<TingkatRisikoLahan, string> = { tinggi: "#d64545", sedang: "#d99a00", rendah: "#1d8a4f" };

const GAYA_CADANGAN = {
  version: 8 as const,
  sources: {},
  layers: [{ id: "latar", type: "background" as const, paint: { "background-color": "#eaf3ec" } }],
};

function lingkaranGeoJson(pusat: [number, number], radiusMeter: number, titik = 48): number[][] {
  const [lng, lat] = pusat;
  const derajatLat = radiusMeter / 111320;
  const derajatLng = radiusMeter / (111320 * Math.cos((lat * Math.PI) / 180));
  const koordinat: number[][] = [];
  for (let i = 0; i <= titik; i++) {
    const sudut = (i / titik) * Math.PI * 2;
    koordinat.push([lng + derajatLng * Math.cos(sudut), lat + derajatLat * Math.sin(sudut)]);
  }
  return koordinat;
}

/** Meredam warna peta dasar menjadi palet hijau-putih AIO PESTGUARD */
function ubahWarnaPeta(peta: PetaMaplibre) {
  const gaya = peta.getStyle();
  for (const lapisan of gaya.layers ?? []) {
    const id = lapisan.id.toLowerCase();
    try {
      if (lapisan.type === "background") peta.setPaintProperty(lapisan.id, "background-color", "#f1f7f2");
      else if (lapisan.type === "fill") {
        if (id.includes("water")) peta.setPaintProperty(lapisan.id, "fill-color", "#cfe5dc");
        else if (/park|wood|grass|landcover|forest|farmland|vegetation|crop|scrub|wetland/.test(id)) peta.setPaintProperty(lapisan.id, "fill-color", "#dcefe1");
        else if (/building/.test(id)) peta.setPaintProperty(lapisan.id, "fill-color", "#e4ece6");
        else peta.setPaintProperty(lapisan.id, "fill-color", "#eef5ef");
      } else if (lapisan.type === "line") {
        if (/water|river/.test(id)) peta.setPaintProperty(lapisan.id, "line-color", "#b7d8cb");
        else if (/boundary|admin/.test(id)) peta.setPaintProperty(lapisan.id, "line-color", "#a9c7b3");
        else if (/casing/.test(id)) peta.setPaintProperty(lapisan.id, "line-color", "#d3e3d8");
        else if (/road|highway|street|path|bridge|tunnel|transport|rail/.test(id)) peta.setPaintProperty(lapisan.id, "line-color", "#ffffff");
      } else if (lapisan.type === "symbol") {
        peta.setPaintProperty(lapisan.id, "text-color", "#4d6356");
        peta.setPaintProperty(lapisan.id, "text-halo-color", "#ffffff");
      }
    } catch {
      // properti tidak ada pada lapisan ini, abaikan
    }
  }
}

interface PropsPetaSebaran {
  daftarRingkasan: RingkasanLahan[];
  idLahanTerpilih: string | null;
  saatLahanDipilih: (idLahan: string | null) => void;
  saatLihatDetail: (idLahan: string) => void;
}

export default function PetaSebaran({ daftarRingkasan, idLahanTerpilih, saatLahanDipilih, saatLihatDetail }: PropsPetaSebaran) {
  const { bahasa, p, tk, komoditas } = useBahasa();
  const wadah = useRef<HTMLDivElement>(null);
  const refPeta = useRef<PetaMaplibre | null>(null);
  const refPenanda = useRef<Marker[]>([]);
  const [siap, setSiap] = useState(false);
  const [petaDasarGagal, setPetaDasarGagal] = useState(false);
  const [filter, setFilter] = useState<JenisKomoditas | "Semua">("Semua");
  const [tampilPerangkap, setTampilPerangkap] = useState(false);

  const ringkasanPerId = useMemo(() => new Map(daftarRingkasan.map((r) => [r.idLahan, r])), [daftarRingkasan]);
  const lahanTampil = useMemo(
    () => DAFTAR_LAHAN_DI_PETA.filter((l) => filter === "Semua" || ringkasanPerId.get(l.idLahan)?.komoditas === filter),
    [filter, ringkasanPerId]
  );

  const batasSemua = useMemo(() => {
    const titik = DAFTAR_PERANGKAP.filter((t) => lahanTampil.some((l) => l.idLahan === t.idLahan));
    const lng = titik.map((t) => t.lng);
    const lat = titik.map((t) => t.lat);
    return [
      [Math.min(...lng) - 0.008, Math.min(...lat) - 0.008],
      [Math.max(...lng) + 0.008, Math.max(...lat) + 0.008],
    ] as [[number, number], [number, number]];
  }, [lahanTampil]);

  // ---------- Membuat peta sekali ----------
  useEffect(() => {
    let batal = false;
    let pengatur: number | undefined;
    (async () => {
      const maplibregl = (await import("maplibre-gl")).default;
      if (batal || !wadah.current) return;
      const peta = new maplibregl.Map({
        container: wadah.current,
        style: ALAMAT_GAYA_PETA,
        bounds: batasSemua,
        fitBoundsOptions: { padding: 60 },
        attributionControl: { compact: true },
        cooperativeGestures: true,
      });
      refPeta.current = peta;
      peta.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

      const pasangLapisanLahan = () => {
        if (peta.getSource("lahan")) return;
        peta.addSource("lahan", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: DAFTAR_LAHAN_DI_PETA.map((l) => {
              const r = ringkasanPerId.get(l.idLahan);
              return {
                type: "Feature" as const,
                properties: { idLahan: l.idLahan, warna: WARNA_STATUS[r?.tingkatRisiko ?? "rendah"] },
                geometry: { type: "Polygon" as const, coordinates: [lingkaranGeoJson(l.pusat, l.radiusMeter)] },
              };
            }),
          },
        });
        peta.addLayer({ id: "lahan-isi", type: "fill", source: "lahan", paint: { "fill-color": ["get", "warna"], "fill-opacity": 0.12 } });
        peta.addLayer({ id: "lahan-garis", type: "line", source: "lahan", paint: { "line-color": ["get", "warna"], "line-width": 2, "line-dasharray": [2, 1.5] } });
      };

      let sudahSiap = false;
      const tandaiSiap = () => {
        if (sudahSiap) return;
        sudahSiap = true;
        window.clearTimeout(pengatur);
        setSiap(true);
      };
      const pakaiLatarCadangan = () => {
        if (sudahSiap || batal) return;
        window.clearTimeout(pengatur);
        setPetaDasarGagal(true);
        peta.setStyle(GAYA_CADANGAN);
        peta.once("style.load", () => {
          pasangLapisanLahan();
          tandaiSiap();
        });
      };

      const perbaruiZoom = () => setTampilPerangkap(peta.getZoom() >= ZOOM_TAMPIL_PERANGKAP);
      peta.on("zoomend", perbaruiZoom);
      peta.on("load", () => {
        perbaruiZoom();
        ubahWarnaPeta(peta);
        pasangLapisanLahan();
        tandaiSiap();
      });
      // Bila peta dasar tidak termuat (offline atau diblokir), pakai latar polos
      pengatur = window.setTimeout(pakaiLatarCadangan, BATAS_WAKTU_PETA_MS);
      peta.on("error", (e) => {
        const pesan = String((e as { error?: Error }).error?.message ?? "");
        if (!sudahSiap && /style|Failed to fetch|NetworkError|Load failed/i.test(pesan)) pakaiLatarCadangan();
      });
    })();
    return () => {
      batal = true;
      window.clearTimeout(pengatur);
      refPenanda.current.forEach((m) => m.remove());
      refPeta.current?.remove();
      refPeta.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Penanda perangkap dan label lahan ----------
  useEffect(() => {
    const peta = refPeta.current;
    if (!peta || !siap) return;
    let batal = false;
    (async () => {
      const maplibregl = (await import("maplibre-gl")).default;
      if (batal) return;
      refPenanda.current.forEach((m) => m.remove());
      refPenanda.current = [];
      const tampil = new Set(lahanTampil.map((l) => l.idLahan));

      for (const lahan of DAFTAR_LAHAN_DI_PETA) {
        const r = ringkasanPerId.get(lahan.idLahan);
        if (!r || !tampil.has(lahan.idLahan)) continue;
        const label = document.createElement("button");
        label.type = "button";
        label.className = "pestguard-label-lahan";
        label.textContent = `${r.namaLahan} · ${komoditas(r.komoditas)}`;
        label.style.borderColor = WARNA_STATUS[r.tingkatRisiko];
        label.onclick = (e) => {
          e.stopPropagation();
          saatLahanDipilih(r.idLahan);
        };
        const derajatLat = lahan.radiusMeter / 111320;
        refPenanda.current.push(new maplibregl.Marker({ element: label, anchor: "bottom" }).setLngLat([lahan.pusat[0], lahan.pusat[1] + derajatLat * 1.05]).addTo(peta));
        label.setAttribute("aria-label", `${r.namaLahan}, ${komoditas(r.komoditas)}`);
      }

      if (!tampilPerangkap) {
        for (const lahan of DAFTAR_LAHAN_DI_PETA) {
          const r = ringkasanPerId.get(lahan.idLahan);
          if (!r || !tampil.has(lahan.idLahan)) continue;
          const ukuran = 40 + Math.min(r.totalDeteksiHariIni, 20) * 1.2;
          const titik = document.createElement("button");
          titik.type = "button";
          titik.className = "pestguard-titik";
          titik.dataset.status = r.tingkatRisiko;
          titik.dataset.terpilih = String(idLahanTerpilih === lahan.idLahan);
          titik.style.width = `${ukuran}px`;
          titik.style.height = `${ukuran}px`;
          titik.style.background = WARNA_STATUS[r.tingkatRisiko];
          titik.style.fontSize = "16px";
          titik.textContent = String(r.totalDeteksiHariIni);
          titik.onclick = (e) => {
            e.stopPropagation();
            saatLahanDipilih(lahan.idLahan);
          };
          refPenanda.current.push(new maplibregl.Marker({ element: titik }).setLngLat(lahan.pusat).addTo(peta));
          titik.setAttribute("aria-label", `${r.namaLahan}: ${r.totalDeteksiHariIni} ${namaHamaLahan(bahasa, r)}, ${p(LABEL_RISIKO[r.tingkatRisiko])}`);
        }
      }

      for (const perangkap of tampilPerangkap ? DAFTAR_PERANGKAP : []) {
        const r = ringkasanPerId.get(perangkap.idLahan);
        if (!r || !tampil.has(perangkap.idLahan)) continue;
        const status = tentukanStatusPerangkap(perangkap, r);
        const ukuran = 26 + Math.min(perangkap.jumlahHariIni, 10) * 2.4;
        const titik = document.createElement("button");
        titik.type = "button";
        titik.className = "pestguard-titik";
        titik.dataset.status = status;
        titik.dataset.terpilih = String(idLahanTerpilih === perangkap.idLahan);
        titik.style.width = `${ukuran}px`;
        titik.style.height = `${ukuran}px`;
        titik.style.background = WARNA_STATUS[status];
        titik.style.fontSize = `${ukuran > 36 ? 14 : 12}px`;
        titik.textContent = String(perangkap.jumlahHariIni);
        titik.setAttribute("aria-label", `${perangkap.label}: ${perangkap.jumlahHariIni} ${namaHamaLahan(bahasa, r)}, ${p(LABEL_RISIKO[status])}`);
        titik.title = `${p({ id: "Perangkap", en: "Trap", ko: "트랩" })} ${perangkap.label}`;
        titik.onclick = (e) => {
          e.stopPropagation();
          saatLahanDipilih(perangkap.idLahan);
        };
        refPenanda.current.push(new maplibregl.Marker({ element: titik }).setLngLat([perangkap.lng, perangkap.lat]).addTo(peta));
        // Marker MapLibre menimpa aria-label dengan "Map marker", jadi dipasang ulang setelahnya
        titik.setAttribute("aria-label", `${p({ id: "Perangkap", en: "Trap", ko: "트랩" })} ${perangkap.label}: ${perangkap.jumlahHariIni} ${namaHamaLahan(bahasa, r)}, ${p(LABEL_RISIKO[status])}`);
      }
    })();
    return () => {
      batal = true;
    };
  }, [siap, bahasa, lahanTampil, idLahanTerpilih, ringkasanPerId, komoditas, p, saatLahanDipilih, tampilPerangkap]);

  // ---------- Terbang ke lahan terpilih / kembali ke semua lahan ----------
  useEffect(() => {
    const peta = refPeta.current;
    if (!peta || !siap) return;
    const lahan = DAFTAR_LAHAN_DI_PETA.find((l) => l.idLahan === idLahanTerpilih);
    if (lahan) {
      // Sisakan ruang untuk kartu info: di bawah pada ponsel, di kanan pada desktop
      const layarKecil = window.innerWidth < 640;
      peta.flyTo({
        center: lahan.pusat,
        zoom: layarKecil ? 13.6 : 14.2,
        padding: layarKecil ? { top: 30, bottom: 230, left: 20, right: 20 } : { top: 20, bottom: 20, left: 20, right: 360 },
        speed: 0.9,
        essential: true,
      });
    }
  }, [idLahanTerpilih, siap]);

  useEffect(() => {
    const peta = refPeta.current;
    if (!peta || !siap) return;
    peta.fitBounds(batasSemua, { padding: 60, duration: 600 });
  }, [batasSemua, siap]);

  const terpilih = idLahanTerpilih ? ringkasanPerId.get(idLahanTerpilih) ?? null : null;
  const perangkapTerpilih = terpilih ? DAFTAR_PERANGKAP.filter((t) => t.idLahan === terpilih.idLahan) : [];
  const pilihanFilter: Array<JenisKomoditas | "Semua"> = ["Semua", "Padi", "Jagung", "Bawang"];
  const teksLihatSemua = p({ id: "Lihat semua lahan", en: "Show all fields", ko: "모든 농지 보기" });

  return (
    <section className="overflow-hidden rounded-pestguardKartu border border-pestguardAbuGaris bg-white shadow-pestguardKartu">
      <header className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 sm:px-[22px]">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 font-pestguardDisplay text-[19px] font-semibold text-pestguardHijauTua">
            <MapPinned className="h-5 w-5" aria-hidden /> {p({ id: "Peta sebaran hama", en: "Pest map", ko: "해충 분포 지도" })}
          </h2>
          <p className="mt-0.5 max-w-2xl text-[13.5px] text-pestguardAbuTeks">
            {p({
              id: "Angka = hama tertangkap hari ini. Titik merah berdenyut perlu didatangi dulu. Ketuk lahan atau perbesar peta untuk melihat tiap perangkap.",
              en: "Number = pests caught today. Visit pulsing red dots first. Tap a field or zoom in to see each trap.",
              ko: "숫자는 오늘 잡힌 해충 수입니다. 깜박이는 빨간 점부터 가 보세요. 농지를 누르거나 확대하면 트랩별로 보입니다.",
            })}
          </p>
        </div>
        <div className="flex gap-1 overflow-x-auto rounded-xl bg-pestguardHijauPudar p-1" role="radiogroup" aria-label={p({ id: "Saring komoditas", en: "Filter by crop", ko: "작물별 보기" })}>
          {pilihanFilter.map((pil) => (
            <button
              key={pil}
              type="button"
              role="radio"
              aria-checked={filter === pil}
              onClick={() => {
                setFilter(pil);
                saatLahanDipilih(null);
              }}
              className={gabungkanNamaKelas(
                "min-h-[36px] whitespace-nowrap rounded-lg px-3 text-[13px] font-semibold",
                filter === pil ? "bg-white text-pestguardHijauTua shadow-sm" : "text-pestguardAbuTeks"
              )}
            >
              {pil === "Semua" ? p({ id: "Semua", en: "All", ko: "전체" }) : komoditas(pil)}
            </button>
          ))}
        </div>
      </header>

      <div className="relative mt-4 h-[440px] sm:h-[520px]">
        {/* maplibre-gl.css memberi .maplibregl-map position: relative, jadi wadah peta dibungkus div absolut */}
        <div className="absolute inset-0 bg-[#eaf3ec]">
          <div ref={wadah} className="h-full w-full" />
        </div>

        {!siap && (
          <div className="absolute inset-0 grid place-items-center text-[13px] font-semibold text-pestguardAbuTeks">
            {p({ id: "Memuat peta...", en: "Loading map...", ko: "지도 불러오는 중..." })}
          </div>
        )}

        {petaDasarGagal && (
          <p className="absolute left-3 top-3 z-[1] flex max-w-[260px] items-start gap-1.5 rounded-lg bg-white/95 px-2.5 py-1.5 text-[11.5px] leading-snug text-pestguardAbuTeks shadow">
            <WifiOff className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            {p({
              id: "Peta dasar tidak termuat (sinyal lemah). Posisi titik tetap benar.",
              en: "Base map did not load (weak signal). Dot positions are still correct.",
              ko: "배경 지도를 불러오지 못했습니다(신호 약함). 점 위치는 정확합니다.",
            })}
          </p>
        )}

        <button
          type="button"
          onClick={() => {
            saatLahanDipilih(null);
            refPeta.current?.fitBounds(batasSemua, { padding: 60, duration: 600 });
          }}
          className="absolute right-[10px] top-[80px] z-[1] grid h-[29px] w-[29px] place-items-center rounded-[4px] bg-white text-pestguardHijauTua shadow-[0_0_0_2px_rgba(0,0,0,0.1)]"
          title={teksLihatSemua}
          aria-label={teksLihatSemua}
        >
          <LocateFixed className="h-4 w-4" aria-hidden />
        </button>

        <div className={gabungkanNamaKelas("absolute bottom-3 left-3 z-[1] rounded-xl bg-white/95 px-3 py-2 text-[11.5px] shadow", terpilih && "hidden sm:block")}>
          <p className="mb-1 flex items-center gap-1 font-semibold text-pestguardHijauTua">
            <Layers className="h-3.5 w-3.5" aria-hidden /> {p({ id: "Keterangan", en: "Legend", ko: "범례" })}
          </p>
          {(["tinggi", "sedang", "rendah"] as TingkatRisikoLahan[]).map((s) => (
            <p key={s} className="flex items-center gap-1.5 text-pestguardTeksUtama">
              <span className="h-3 w-3 rounded-full border-2 border-white shadow" style={{ background: WARNA_STATUS[s] }} aria-hidden />
              {p(LABEL_RISIKO[s])}
            </p>
          ))}
        </div>

        {terpilih && (
          <div className="pestguard-muncul absolute inset-x-3 bottom-3 z-[2] rounded-2xl border border-pestguardAbuGaris bg-white p-4 shadow-pestguardKartuAngkat sm:left-auto sm:w-[340px]">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-pestguardDisplay text-[16px] font-semibold text-pestguardHijauTua">
                  {terpilih.namaLahan} · {komoditas(terpilih.komoditas)}
                </p>
                <p className="truncate text-[12px] text-pestguardAbuTeks">{tk(terpilih.lokasi)}</p>
              </div>
              <span className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold text-white" style={{ background: WARNA_STATUS[terpilih.tingkatRisiko] }}>
                {p(LABEL_RISIKO[terpilih.tingkatRisiko])}
              </span>
            </div>
            <p className="mt-2 text-[14px] text-pestguardTeksUtama">
              <span className="font-pestguardDisplay text-[22px] font-semibold">{terpilih.totalDeteksiHariIni}</span> {namaHamaLahan(bahasa, terpilih)}{" "}
              {p({ id: "hari ini", en: "today", ko: "오늘" })}
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {perangkapTerpilih.map((t) => {
                const s = tentukanStatusPerangkap(t, terpilih);
                return (
                  <span key={t.idPerangkap} className="inline-flex items-center gap-1 rounded-full border border-pestguardAbuGaris px-2 py-0.5 text-[11.5px] font-semibold">
                    <span className="h-2 w-2 rounded-full" style={{ background: WARNA_STATUS[s] }} aria-hidden />
                    {t.label}: {t.jumlahHariIni}
                  </span>
                );
              })}
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => saatLahanDipilih(null)}
                className="min-h-[40px] rounded-xl border border-pestguardAbuGaris px-3 text-[13px] font-semibold text-pestguardAbuTeks hover:bg-pestguardHijauPudar"
              >
                {p({ id: "Tutup", en: "Close", ko: "닫기" })}
              </button>
              <button
                type="button"
                onClick={() => saatLihatDetail(terpilih.idLahan)}
                className="inline-flex min-h-[40px] flex-1 items-center justify-center rounded-xl bg-pestguardHijauUtama text-[13.5px] font-semibold text-white hover:bg-pestguardHijauTua"
              >
                {p({ id: "Lihat prediksi lahan ini", en: "See this field's forecast", ko: "이 농지의 예측 보기" })}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
