import TabelRiwayatSesi from "@/components/history/TabelRiwayatSesi";
import { ambilRingkasanSemuaLahan, ambilSesiPemantauan } from "@/lib/dataSource";

export default function HalamanRiwayatSesi() {
  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div>
        <h1 className="font-pestguardDisplay text-3xl font-semibold text-pestguardHijauTua">Riwayat Sesi</h1>
        <p className="mt-1 max-w-2xl text-pestguardAbuTeks">
          Catatan semua foto perangkap yang pernah diperiksa sistem. Berguna untuk membandingkan kondisi hari ini dengan hari sebelumnya.
        </p>
      </div>
      <TabelRiwayatSesi daftarSesiPemantauan={ambilSesiPemantauan()} daftarRingkasanLahan={ambilRingkasanSemuaLahan()} />
    </div>
  );
}
