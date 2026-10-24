import { Camera, ClipboardCheck, Cpu, Lightbulb, Sprout } from "lucide-react";
import KartuDasar from "@/components/ui/KartuDasar";
import Link from "next/link";
import { DAFTAR_TAHAP_PROYEK } from "@/lib/mockData";
import { DAFTAR_MODEL } from "@/lib/model/konfigurasiModel";
import { gabungkanNamaKelas } from "@/lib/utils";

const DAFTAR_ALUR_SISTEM = [
  { IkonAlur: Camera, judul: "1. Foto perangkap", isi: "Perangkap di lahan memotret hama yang menempel secara berkala." },
  { IkonAlur: Cpu, judul: "2. Sistem mengenali hama", isi: "Model kecerdasan buatan menandai setiap hama dengan kotak dan menyebut jenisnya." },
  { IkonAlur: Sprout, judul: "3. Dihitung per lahan", isi: "Jumlah hama dijumlahkan per hari dan dibandingkan dengan batas aman lahan." },
  { IkonAlur: Lightbulb, judul: "4. Wawasan dan saran", isi: "Sistem menyusun kalimat sederhana, perkiraan fase hama, dan pilihan obat dari referensi." },
  { IkonAlur: ClipboardCheck, judul: "5. Petani bertindak", isi: "Petani memeriksa lahan, menyemprot bila perlu, lalu melihat hasilnya di foto berikutnya." },
];

const DAFTAR_ISTILAH = [
  { istilah: "Keyakinan (confidence)", arti: "Seberapa yakin sistem bahwa yang ditandai benar hama tersebut. Di bawah 50 persen, mohon dicek langsung." },
  { istilah: "Batas aman mingguan", arti: "Jumlah hama per minggu yang masih bisa ditoleransi lahan. Bila terlewati, risiko menjadi tinggi." },
  { istilah: "Fase atau stadium", arti: "Tahap hidup hama, dari telur, anakan (nimfa atau larva), sampai dewasa. Hama paling merusak pada fase tertentu." },
  { istilah: "Oviposisi", arti: "Masa hama dewasa mulai bertelur. Pengendalian sebelum masa ini mencegah ledakan populasi." },
  { istilah: "Bahan aktif", arti: "Zat di dalam obat yang membunuh hama. Pakai bahan aktif berbeda secara bergantian agar hama tidak kebal." },
];

const DAFTAR_STATUS_LABEL = {
  selesai: { label: "Sudah jalan", kelas: "bg-pestguardHijauLembut text-pestguardHijauUtama" },
  berjalan: { label: "Sedang dibuat", kelas: "bg-amber-50 text-pestguardKuningPeringatan" },
  rencana: { label: "Rencana", kelas: "bg-gray-100 text-pestguardAbuTeks" },
} as const;

export default function HalamanPanduan() {
  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div>
        <h1 className="font-pestguardDisplay text-3xl font-semibold text-pestguardHijauTua">Cara Kerja Sistem</h1>
        <p className="mt-1 max-w-2xl text-pestguardAbuTeks">
          Penjelasan singkat bagaimana AIO PESTGUARD bekerja, apa arti istilahnya, dan bagian mana yang sudah jalan atau masih direncanakan.
        </p>
      </div>

      <KartuDasar judulKartu="Dari foto sampai tindakan">
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {DAFTAR_ALUR_SISTEM.map(({ IkonAlur, judul, isi }) => (
            <li key={judul} className="rounded-xl border border-pestguardAbuGaris bg-pestguardHijauPudar p-4">
              <IkonAlur className="h-6 w-6 text-pestguardHijauUtama" aria-hidden />
              <p className="mt-2 text-sm font-semibold text-pestguardHijauTua">{judul}</p>
              <p className="mt-1 text-sm leading-relaxed text-pestguardAbuTeks">{isi}</p>
            </li>
          ))}
        </ol>
      </KartuDasar>

      <KartuDasar judulKartu="Arti istilah di layar">
        <dl className="grid gap-4 sm:grid-cols-2">
          {DAFTAR_ISTILAH.map(({ istilah, arti }) => (
            <div key={istilah}>
              <dt className="text-sm font-semibold text-pestguardHijauTua">{istilah}</dt>
              <dd className="mt-0.5 text-sm leading-relaxed text-pestguardAbuTeks">{arti}</dd>
            </div>
          ))}
        </dl>
      </KartuDasar>

      <KartuDasar
        judulKartu="Seberapa jeli model pengenal hama"
        keteranganKartu="Hasil uji asli dari notebook pada 110 gambar uji (144 hama). Ketiga model bisa dicoba di halaman Cek Hama dari Foto."
      >
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          {[
            { angka: "85 dari 100", arti: "hama di foto berhasil ditemukan oleh model utama YOLO11l" },
            { angka: "8 dari 10", arti: "tanda pada keyakinan 35% ke atas memang hama yang benar" },
            { angka: "97 dari 100", arti: "temuan dengan keyakinan 80 sampai 90% terbukti benar" },
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
                <th className="px-3 py-2 font-semibold">Model</th>
                <th className="px-3 py-2 text-right font-semibold">mAP50</th>
                <th className="px-3 py-2 text-right font-semibold">mAP50-95</th>
                <th className="px-3 py-2 text-right font-semibold">Presisi</th>
                <th className="px-3 py-2 text-right font-semibold">Recall</th>
                <th className="px-3 py-2 text-right font-semibold">F1 di ambang 35% (rentang 95%)</th>
                <th className="px-3 py-2 text-right font-semibold">Parameter</th>
              </tr>
            </thead>
            <tbody>
              {DAFTAR_MODEL.map((model) => (
                <tr key={model.idModel} className={gabungkanNamaKelas("border-t border-pestguardAbuGaris", model.adalahDefault && "bg-pestguardHijauLembut/60 font-semibold")}>
                  <td className="px-3 py-2.5">
                    {model.namaTampilan}
                    {model.adalahDefault && <span className="ml-2 rounded-full bg-pestguardHijauUtama px-2 py-0.5 text-[10px] text-white">Dipakai</span>}
                  </td>
                  <td className="px-3 py-2.5 text-right">{model.metrikUji.map50.toFixed(3)}</td>
                  <td className="px-3 py-2.5 text-right">{model.metrikUji.map50Sampai95.toFixed(3)}</td>
                  <td className="px-3 py-2.5 text-right">{model.metrikUji.presisi.toFixed(3)}</td>
                  <td className="px-3 py-2.5 text-right">{model.metrikUji.recall.toFixed(3)}</td>
                  <td className="px-3 py-2.5 text-right">
                    {model.f1Bootstrap.titik.toFixed(3)} ({model.f1Bootstrap.bawah.toFixed(2)} sampai {model.f1Bootstrap.atas.toFixed(2)})
                  </td>
                  <td className="px-3 py-2.5 text-right">{model.jumlahParameterJuta} jt</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-pestguardAbuTeks">
          Rentang F1 ketiga model saling tumpang tindih, jadi perbedaannya belum tentu berarti dengan data uji sekecil ini. YOLO11l dipilih karena paling jeli menemukan hama
          (recall tertinggi), yang penting agar serangan tidak terlewat.
        </p>
        <Link href="/deteksi" className="mt-3 inline-flex min-h-[44px] items-center rounded-xl bg-pestguardHijauUtama px-4 text-sm font-semibold text-white hover:bg-pestguardHijauTua">
          Coba modelnya sekarang
        </Link>
      </KartuDasar>

      <KartuDasar judulKartu="Sudah sampai mana pengerjaan">
        <ul className="space-y-3">
          {DAFTAR_TAHAP_PROYEK.map((tahap) => {
            const gaya = DAFTAR_STATUS_LABEL[tahap.status];
            return (
              <li key={tahap.namaTahap} className="rounded-xl border border-pestguardAbuGaris p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-pestguardTeksUtama">{tahap.namaTahap}</span>
                  <span className={gabungkanNamaKelas("rounded-full px-2.5 py-0.5 text-xs font-semibold", gaya.kelas)}>{gaya.label}</span>
                </div>
                <p className="mt-1 text-sm text-pestguardTeksUtama">{tahap.penjelasanUntukPetani}</p>
                <p className="mt-1 text-xs text-pestguardAbuTeks">Teknis: {tahap.penjelasanTeknis}</p>
              </li>
            );
          })}
        </ul>
      </KartuDasar>

      <KartuDasar judulKartu="Hal yang perlu diketahui">
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-pestguardTeksUtama">
          <li>Halaman Beranda dan Riwayat masih memakai data contoh. Halaman Cek Hama dari Foto memakai model asli.</li>
          <li>Model dilatih dengan foto close-up dari dataset IP102. Foto dari perangkap di lahan bisa lebih jauh dan lebih kecil, sehingga hasilnya perlu diuji ulang di lapangan.</li>
          <li>Hasil model ONNX sedikit berbeda dari versi PyTorch saat divalidasi di notebook (selisih keyakinan rata-rata sekitar 2 poin persen, selisih jumlah deteksi 0,1 per gambar).</li>
          <li>Ada 7 jenis hama yang tidak punya contoh di data uji, jadi kemampuan sistem untuk jenis itu belum terukur. Ini ditandai &quot;Belum diuji&quot; di Kamus Hama.</li>
          <li>Perkiraan fase hama dan waktu bertelur memakai data literatur dan belum dikalibrasi dengan ukuran asli dari foto.</li>
          <li>Untuk bawang, model baru mengenali kelompok hama secara umum sehingga keyakinannya cenderung lebih rendah. Pengecekan langsung sangat dianjurkan.</li>
          <li>Pilihan obat berasal dari referensi AIGRA dan bukan pengganti anjuran penyuluh pertanian lapangan.</li>
        </ul>
      </KartuDasar>
    </div>
  );
}
