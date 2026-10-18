import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import SidebarNavigasi from "@/components/layout/SidebarNavigasi";
import TopbarAplikasi from "@/components/layout/TopbarAplikasi";

// Font tampilan judul besar, dipakai untuk nama sistem dan judul halaman utama
const fontTampilanJudul = Fraunces({
  subsets: ["latin"],
  variable: "--font-pestguard-display",
  weight: ["400", "500", "600"],
});

// Font teks utama untuk seluruh isi aplikasi, dipilih karena mudah dibaca di layar
const fontTeksUtama = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-pestguard-teks",
  weight: ["400", "500", "600", "700"],
});

// Font monospace untuk angka teknis seperti persentase confidence dan kode sesi
const fontMonospaceTeknis = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-pestguard-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "AIO PESTGUARD - Simulasi Sistem Deteksi Hama AIGRA",
  description:
    "Simulasi antarmuka web AIO PESTGUARD untuk memantau deteksi hama padi, jagung, dan bawang, lengkap dengan wawasan dan rekomendasi yang mudah dipahami petani.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body
        className={`${fontTampilanJudul.variable} ${fontTeksUtama.variable} ${fontMonospaceTeknis.variable} font-pestguardTeks antialiased`}
      >
        <div className="flex min-h-screen w-full bg-pestguardHijauPudar">
          <SidebarNavigasi />
          <div className="flex min-h-screen w-full flex-1 flex-col lg:pl-64">
            <TopbarAplikasi />
            <main className="flex-1 px-4 pb-16 pt-6 sm:px-6 lg:px-10">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
