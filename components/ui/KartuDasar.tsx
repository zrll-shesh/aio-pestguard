import type { ReactNode } from "react";
import { gabungkanNamaKelas } from "@/lib/utils";

interface PropsKartuDasar {
  judulKartu?: string;
  keteranganKartu?: string;
  elemenAksiDiKanan?: ReactNode;
  children: ReactNode;
  kelasTambahan?: string;
}

/** Kartu putih dengan sudut membulat, dipakai di seluruh halaman agar tampilan konsisten */
export default function KartuDasar({
  judulKartu,
  keteranganKartu,
  elemenAksiDiKanan,
  children,
  kelasTambahan,
}: PropsKartuDasar) {
  return (
    <section
      className={gabungkanNamaKelas(
        "rounded-pestguardKartu border border-pestguardAbuGaris bg-white p-5 shadow-pestguardKartu",
        kelasTambahan
      )}
    >
      {(judulKartu || elemenAksiDiKanan) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            {judulKartu && (
              <h2 className="font-pestguardDisplay text-lg font-semibold text-pestguardHijauTua">{judulKartu}</h2>
            )}
            {keteranganKartu && <p className="mt-0.5 text-sm text-pestguardAbuTeks">{keteranganKartu}</p>}
          </div>
          {elemenAksiDiKanan}
        </header>
      )}
      {children}
    </section>
  );
}
