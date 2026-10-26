import TabelRiwayatSesi from "@/components/history/TabelRiwayatSesi";
import JudulHalaman from "@/components/ui/JudulHalaman";
import { ambilRingkasanSemuaLahan, ambilSesiPemantauan } from "@/lib/dataSource";

export default function HalamanRiwayatSesi() {
  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <JudulHalaman
        judul={{ id: "Riwayat Sesi", en: "Session History", ko: "촬영 기록" }}
        keterangan={{
          id: "Catatan semua foto perangkap yang pernah diperiksa sistem. Berguna untuk membandingkan kondisi hari ini dengan hari sebelumnya.",
          en: "A record of every trap photo the system has checked. Useful for comparing today with earlier days.",
          ko: "시스템이 확인한 모든 트랩 사진의 기록입니다. 오늘과 이전 날을 비교할 때 유용합니다.",
        }}
      />
      <TabelRiwayatSesi daftarSesiPemantauan={ambilSesiPemantauan()} daftarRingkasanLahan={ambilRingkasanSemuaLahan()} />
    </div>
  );
}
