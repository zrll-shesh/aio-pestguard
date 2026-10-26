import type { Metadata } from "next";
import KamusHama from "@/components/hama/KamusHama";
import JudulHalaman from "@/components/ui/JudulHalaman";

export const metadata: Metadata = {
  title: "Kamus Hama - AIO PESTGUARD",
  description: "24 jenis hama padi, jagung, dan bawang yang dikenali AIO PESTGUARD, lengkap dengan gejala, cara memeriksa, musuh alami, dan cara mengendalikannya.",
};

export default function HalamanKamusHama() {
  return (
    <div className="mx-auto max-w-[1440px] space-y-5">
      <JudulHalaman
        judul={{ id: "Kamus Hama", en: "Pest Guide", ko: "해충 도감" }}
        keterangan={{
          id: "Kenali 24 jenis hama yang bisa dikenali sistem: ciri serangannya, di mana mencarinya, siapa musuh alaminya, dan kapan harus bertindak.",
          en: "Get to know the 24 pests the system recognises: signs of attack, where to look, their natural enemies, and when to act.",
          ko: "시스템이 알아보는 해충 24종의 피해 특징, 찾아볼 곳, 천적, 조치 시기를 알아보세요.",
        }}
      />
      <KamusHama />
    </div>
  );
}
