import BerandaLahan from "@/components/beranda/BerandaLahan";
import { ambilRingkasanSemuaLahan, ambilSesiPemantauan } from "@/lib/dataSource";

export default function HalamanBeranda() {
  return <BerandaLahan daftarRingkasan={ambilRingkasanSemuaLahan()} daftarSesi={ambilSesiPemantauan()} />;
}
