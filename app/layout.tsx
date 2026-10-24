import type { Metadata, Viewport } from "next";
import { DM_Sans, IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import SidebarNavigasi from "@/components/layout/SidebarNavigasi";
import TopbarAplikasi from "@/components/layout/TopbarAplikasi";

// Judul dan angka besar: Space Grotesk, sama dengan dasbor CIVIC-FOOD AI
const fontTampilanJudul = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-pestguard-display",
  weight: ["500", "600", "700"],
});

// Teks isi: DM Sans, mudah dibaca di layar ponsel petani
const fontTeksUtama = DM_Sans({
  subsets: ["latin"],
  variable: "--font-pestguard-teks",
  weight: ["400", "500", "600", "700"],
});

// Hanya untuk data teknis (kode sesi, koordinat kotak, bentuk tensor)
const fontMonospaceTeknis = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-pestguard-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "AIO PESTGUARD - Sistem Deteksi Hama AIGRA",
  description:
    "AIO PESTGUARD memantau hama padi, jagung, dan bawang. Uji model deteksi YOLO (ONNX) langsung di browser, lengkap dengan wawasan keandalan dan saran tindakan untuk petani.",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0c3a29" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body
        className={`${fontTampilanJudul.variable} ${fontTeksUtama.variable} ${fontMonospaceTeknis.variable} font-pestguardTeks antialiased`}
      >
        <a
          href="#konten-utama"
          className="absolute -left-[999px] top-2 z-50 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-pestguardHijauTua focus:left-2"
        >
          Lompat ke konten
        </a>
        <div className="flex min-h-screen w-full bg-pestguardHijauPudar">
          <SidebarNavigasi />
          <div className="flex min-h-screen w-full min-w-0 flex-1 flex-col lg:pl-[264px]">
            <TopbarAplikasi />
            <main id="konten-utama" className="flex-1 px-4 pb-24 pt-6 sm:px-6 lg:px-9 lg:pb-12">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
