import type { ReactNode } from "react";
import { gabungkanNamaKelas } from "@/lib/utils";

interface PropsKartuDasar {
  judulKartu?: string;
  keteranganKartu?: ReactNode;
  elemenAksiDiKanan?: ReactNode;
  children: ReactNode;
  kelasTambahan?: string;
  id?: string;
}

/** Panel putih bergaya dasbor CIVIC-FOOD: garis tipis, bayangan lembut, judul Space Grotesk */
export default function KartuDasar({ judulKartu, keteranganKartu, elemenAksiDiKanan, children, kelasTambahan, id }: PropsKartuDasar) {
  return (
    <section
      id={id}
      className={gabungkanNamaKelas(
        "min-w-0 rounded-pestguardKartu border border-pestguardAbuGaris bg-white p-5 shadow-pestguardKartu sm:p-[22px]",
        kelasTambahan
      )}
    >
      {(judulKartu || elemenAksiDiKanan) && (
        <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            {judulKartu && <h2 className="font-pestguardDisplay text-[17px] font-semibold leading-snug text-pestguardHijauTua">{judulKartu}</h2>}
            {keteranganKartu && <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-pestguardAbuTeks">{keteranganKartu}</p>}
          </div>
          {elemenAksiDiKanan}
        </header>
      )}
      {children}
    </section>
  );
}
