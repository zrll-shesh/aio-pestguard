import type { Metadata } from "next";
import KamusHama from "@/components/hama/KamusHama";

export const metadata: Metadata = {
  title: "Kamus Hama - AIO PESTGUARD",
  description: "24 jenis hama padi, jagung, dan bawang yang dikenali AIO PESTGUARD, lengkap dengan gejala, cara memeriksa, musuh alami, dan cara mengendalikannya.",
};

export default function HalamanKamusHama() {
  return (
    <div className="mx-auto max-w-[1440px] space-y-5">
      <div>
        <h1 className="font-pestguardDisplay text-[28px] font-semibold text-pestguardHijauTua sm:text-[32px]">Kamus Hama</h1>
        <p className="mt-1 max-w-2xl text-[15px] leading-relaxed text-pestguardAbuTeks">
          Kenali 24 jenis hama yang bisa dikenali sistem: ciri serangannya, di mana mencarinya, siapa musuh alaminya, dan kapan harus bertindak.
        </p>
      </div>
      <KamusHama />
    </div>
  );
}
