import type { Config } from "tailwindcss";

// Palet warna resmi AIO PESTGUARD: hijau dan putih saja, sesuai permintaan tim AIGRA.
// Nama token warna dibuat deskriptif supaya mudah dipakai ulang oleh tim frontend maupun backend
// saat menyusun dokumentasi desain atau menyamakan istilah warna di kemudian hari.
const tailwindConfig: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pestguardHijauTua: "#0f3d2e",
        pestguardHijauUtama: "#16653f",
        pestguardHijauSedang: "#1f8a52",
        pestguardHijauMuda: "#4fae6d",
        pestguardHijauLembut: "#e4f3e8",
        pestguardHijauPudar: "#f1f9f3",
        pestguardPutih: "#ffffff",
        pestguardAbuGaris: "#dbe7df",
        pestguardAbuTeks: "#5b6b62",
        pestguardTeksUtama: "#10241a",
        pestguardMerahPeringatan: "#b3281e",
        pestguardKuningPeringatan: "#b8800a",
        pestguardHijauAman: "#1f8a52",
      },
      fontFamily: {
        pestguardDisplay: ["var(--font-pestguard-display)", "serif"],
        pestguardTeks: ["var(--font-pestguard-teks)", "sans-serif"],
        pestguardMono: ["var(--font-pestguard-mono)", "monospace"],
      },
      boxShadow: {
        pestguardKartu: "0 1px 2px rgba(15, 61, 46, 0.06), 0 1px 1px rgba(15, 61, 46, 0.04)",
        pestguardKartuAngkat: "0 8px 24px rgba(15, 61, 46, 0.10)",
      },
      borderRadius: {
        pestguardKartu: "1rem",
      },
    },
  },
  plugins: [],
};

export default tailwindConfig;
