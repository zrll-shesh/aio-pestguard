import { CalendarClock, FlaskConical, Info, Ruler } from "lucide-react";
import type { HasilDeteksiHama, RingkasanLahan } from "@/lib/types";
import KartuDasar from "@/components/ui/KartuDasar";
import { LencanaKeyakinan } from "@/components/ui/LencanaStatus";
import { formatAngkaSebagaiPersen, formatTanggalSaja } from "@/lib/utils";

interface PropsPanelWawasanHama {
  deteksiTerpilih: HasilDeteksiHama | null;
  ringkasanLahan: RingkasanLahan;
}

/** Panel wawasan AI untuk satu hama yang dipilih: fase hidup, perkiraan bertelur, dan pilihan obat */
export default function PanelWawasanHama({ deteksiTerpilih, ringkasanLahan }: PropsPanelWawasanHama) {
  if (!deteksiTerpilih) {
    return (
      <KartuDasar judulKartu="Wawasan untuk hama terpilih">
        <p className="text-sm text-pestguardAbuTeks">Klik salah satu kotak pada foto untuk melihat fase hidup hama, perkiraan waktu bertelur, dan pilihan obat.</p>
      </KartuDasar>
    );
  }

  const stadium = deteksiTerpilih.estimasiStadium;
  const adaPestisida = deteksiTerpilih.ada_rekomendasi_pestisida;

  return (
    <KartuDasar judulKartu="Wawasan untuk hama terpilih" keteranganKartu={`${deteksiTerpilih.nama_indonesia}, ${ringkasanLahan.namaLahan}`}>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="font-pestguardMono font-semibold">{formatAngkaSebagaiPersen(deteksiTerpilih.confidence)}</span>
        <LencanaKeyakinan tingkatKeyakinan={deteksiTerpilih.tingkatKeyakinan} />
        {deteksiTerpilih.tingkatKeyakinan === "rendah" && (
          <span className="text-pestguardMerahPeringatan">Mohon cek langsung di lahan.</span>
        )}
      </div>

      <div className="mt-4 space-y-4">
        <section>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-pestguardHijauTua">
            <Ruler className="h-4 w-4" aria-hidden /> Ukuran dan fase hidup
          </h3>
          {stadium && deteksiTerpilih.estimasiUkuranCm !== null ? (
            <div className="mt-1.5 text-sm leading-relaxed text-pestguardTeksUtama">
              <p>
                Ukuran perkiraan <span className="font-pestguardMono font-semibold">{(deteksiTerpilih.estimasiUkuranCm * 10).toFixed(1)} mm</span>, sehingga hama ini kemungkinan berada pada fase{" "}
                <strong>{stadium.namaStadium}</strong>.
              </p>
              {stadium.stadiumBerikutnya && stadium.perkiraanHariMenujuStadiumBerikutnya !== null && (
                <p className="mt-1">
                  Fase berikutnya: {stadium.stadiumBerikutnya}, paling lama sekitar {stadium.perkiraanHariMenujuStadiumBerikutnya} hari lagi.
                </p>
              )}
              <p className="mt-1 text-xs text-pestguardAbuTeks">{stadium.catatanReferensiBiologis}</p>
            </div>
          ) : (
            <p className="mt-1.5 text-sm text-pestguardAbuTeks">Ukuran hama belum bisa dihitung. Kalibrasi ukuran piksel ke sentimeter masih dalam rencana kerja.</p>
          )}
        </section>

        <section>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-pestguardHijauTua">
            <CalendarClock className="h-4 w-4" aria-hidden /> Perkiraan waktu bertelur
          </h3>
          {stadium && stadium.perkiraanTanggalMulaiOviposisi && stadium.masaPraOviposisi ? (
            <p className="mt-1.5 text-sm leading-relaxed text-pestguardTeksUtama">
              Hama dewasa diperkirakan mulai siap bertelur sekitar <strong>{formatTanggalSaja(stadium.perkiraanTanggalMulaiOviposisi)}</strong>. Pengendalian sebelum tanggal ini
              mencegah jumlah hama melonjak.
            </p>
          ) : (
            <p className="mt-1.5 text-sm text-pestguardAbuTeks">Data masa bertelur untuk hama ini belum tersedia pada referensi.</p>
          )}
        </section>

        <section>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-pestguardHijauTua">
            <FlaskConical className="h-4 w-4" aria-hidden /> Pilihan obat dari referensi
          </h3>
          {adaPestisida ? (
            <ul className="mt-2 space-y-2">
              {deteksiTerpilih.rekomendasi_pestisida.map((opsi) => (
                <li key={`${opsi.bahan_aktif}-${opsi.contoh_produk}`} className="rounded-lg border border-pestguardAbuGaris bg-pestguardHijauPudar p-3 text-sm">
                  <p className="font-semibold text-pestguardTeksUtama">{opsi.bahan_aktif}</p>
                  <p className="text-pestguardAbuTeks">
                    Dosis {opsi.dosis}. Contoh produk: {opsi.contoh_produk}.
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1.5 text-sm text-pestguardAbuTeks">
              Belum ada data obat untuk hama ini di referensi AIGRA. Mohon tanyakan ke penyuluh pertanian lapangan.
            </p>
          )}
          <p className="mt-2 flex items-start gap-1.5 text-xs text-pestguardAbuTeks">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden /> Selalu baca label kemasan, pakai alat pelindung, dan gunakan bahan aktif bergantian.
          </p>
        </section>
      </div>
    </KartuDasar>
  );
}
