import { Camera, ClipboardCheck, Cpu, Lightbulb, Sprout } from "lucide-react";
import KartuDasar from "@/components/ui/KartuDasar";
import { DAFTAR_TAHAP_PROYEK, HASIL_EVALUASI_MODEL } from "@/lib/mockData";
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
    <div className="mx-auto max-w-5xl space-y-5">
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

      <KartuDasar judulKartu="Seberapa jeli model pengenal hama" keteranganKartu="Hasil uji pada 110 gambar data uji, ambang keyakinan 35 persen. Angka dari evaluasi asli proyek.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-pestguardAbuTeks">
                <th className="pb-2 font-semibold">Model</th>
                <th className="pb-2 text-right font-semibold">Presisi</th>
                <th className="pb-2 text-right font-semibold">Recall</th>
                <th className="pb-2 text-right font-semibold">F1</th>
                <th className="pb-2 text-right font-semibold">mAP50</th>
                <th className="pb-2 text-right font-semibold">Ukuran (MB)</th>
              </tr>
            </thead>
            <tbody>
              {HASIL_EVALUASI_MODEL.map((model) => (
                <tr key={model.namaModel} className={gabungkanNamaKelas("border-t border-pestguardAbuGaris font-pestguardMono", model.adalahModelUtama && "bg-pestguardHijauLembut font-semibold")}>
                  <td className="py-2.5 font-pestguardTeks">
                    {model.namaModel}
                    {model.adalahModelUtama && <span className="ml-2 rounded-full bg-pestguardHijauUtama px-2 py-0.5 text-[10px] text-white">Dipakai</span>}
                  </td>
                  <td className="py-2.5 text-right">{model.presisi.toFixed(3)}</td>
                  <td className="py-2.5 text-right">{model.recall.toFixed(3)}</td>
                  <td className="py-2.5 text-right">{model.skorF1.toFixed(3)}</td>
                  <td className="py-2.5 text-right">{model.map50.toFixed(3)}</td>
                  <td className="py-2.5 text-right">{model.ukuranBerkasMb}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-pestguardAbuTeks">
          Artinya, dari 100 hama yang ada, model YOLO11l menemukan sekitar 85. Sebagian tanda bisa keliru (presisi 65 persen), karena itu sistem selalu menampilkan tingkat keyakinan dan meminta pengecekan bila rendah.
        </p>
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
          <li>Tampilan ini masih simulasi. Foto, jumlah, dan tanggal adalah contoh, belum dari perangkap sungguhan.</li>
          <li>Perkiraan fase hama dan waktu bertelur memakai data literatur dan belum dikalibrasi dengan ukuran asli dari foto.</li>
          <li>Untuk bawang, model baru mengenali kelompok hama secara umum sehingga keyakinannya cenderung lebih rendah. Pengecekan langsung sangat dianjurkan.</li>
          <li>Pilihan obat berasal dari referensi AIGRA dan bukan pengganti anjuran penyuluh pertanian lapangan.</li>
        </ul>
      </KartuDasar>
    </div>
  );
}
