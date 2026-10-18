import DashboardBeranda from "@/components/dashboard/DashboardBeranda";
import { ambilRingkasanSemuaLahan, ambilSesiPemantauan } from "@/lib/dataSource";

export default function HalamanBeranda() {
  const daftarRingkasanLahanTerurut = ambilRingkasanSemuaLahan();
  const daftarSesiPemantauan = ambilSesiPemantauan();
  return <DashboardBeranda daftarRingkasanLahanTerurut={daftarRingkasanLahanTerurut} daftarSesiPemantauan={daftarSesiPemantauan} />;
}
