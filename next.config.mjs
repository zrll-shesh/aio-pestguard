/** @type {import('next').NextConfig} */

// Header cross-origin isolation membuat ONNX Runtime Web bisa memakai beberapa thread
// (SharedArrayBuffer), sehingga inferensi di browser 2 sampai 3 kali lebih cepat.
// "credentialless" dipilih (bukan "require-corp") agar sumber lintas domain seperti CDN
// cadangan tetap bisa dimuat. Browser yang belum mendukungnya otomatis memakai 1 thread.
const headerIsolasi = [
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
];

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      { source: "/:path*", headers: headerIsolasi },
      {
        // Berkas model besar: boleh di-cache browser, tetapi selalu divalidasi ulang
        // supaya model yang diganti dengan nama sama tetap terambil versi barunya.
        source: "/models/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=0, must-revalidate" }],
      },
      {
        source: "/ort/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
