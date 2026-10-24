import type { Config } from "tailwindcss";

// Palet resmi AIO PESTGUARD: hijau dan putih. Merah dan kuning hanya untuk peringatan.
// Nama token dipertahankan dari versi sebelumnya supaya seluruh komponen lama ikut berganti
// warna tanpa perlu disunting satu per satu.
const tailwindConfig: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pestguardHijauTua: "#0c3a29",
        pestguardHijauUtama: "#14703f",
        pestguardHijauSedang: "#1d8a4f",
        pestguardHijauMuda: "#8fd19e",
        pestguardHijauLembut: "#e3f1e7",
        pestguardHijauPudar: "#f3f8f4",
        pestguardPutih: "#ffffff",
        pestguardAbuGaris: "#d8e6dc",
        pestguardAbuTeks: "#56685d",
        pestguardTeksUtama: "#102419",
        pestguardMerahPeringatan: "#b3281e",
        pestguardKuningPeringatan: "#a86f00",
        pestguardHijauAman: "#1d8a4f",
        pestguardNampan: "#0a2e21",
      },
      fontFamily: {
        pestguardDisplay: ["var(--font-pestguard-display)", "system-ui", "sans-serif"],
        pestguardTeks: ["var(--font-pestguard-teks)", "system-ui", "sans-serif"],
        pestguardMono: ["var(--font-pestguard-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        pestguardKartu: "0 1px 2px rgba(12, 58, 41, 0.05), 0 10px 30px rgba(12, 58, 41, 0.05)",
        pestguardKartuAngkat: "0 18px 40px rgba(12, 58, 41, 0.14)",
      },
      borderRadius: {
        pestguardKartu: "1rem",
      },
    },
  },
  plugins: [],
};

export default tailwindConfig;
