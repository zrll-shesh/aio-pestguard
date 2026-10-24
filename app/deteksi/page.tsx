import type { Metadata } from "next";
import LabDeteksi from "@/components/deteksi/LabDeteksi";
import { bacaDaftarSampelGambar } from "@/lib/model/sampelGambar";

export const metadata: Metadata = {
  title: "Cek Hama dari Foto - AIO PESTGUARD",
  description: "Jalankan model deteksi hama YOLO (ONNX) langsung di browser dan dapatkan jawaban serta langkah tindakan yang mudah dipahami petani.",
};

export default async function HalamanUjiDeteksi() {
  // Dibaca saat build (Vercel) atau setiap muat halaman saat npm run dev
  const daftarSampel = await bacaDaftarSampelGambar();
  return <LabDeteksi daftarSampel={daftarSampel} />;
}
