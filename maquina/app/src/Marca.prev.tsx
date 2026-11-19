import { useState } from "react";
import { Marca } from "./ui";

// prévia da marca: abrir /?marca (não aparece no app)
export default function MarcaPrev() {
  const [k, setK] = useState(0);
  return (
    <div className="grid min-h-dvh place-items-center bg-[#0b0204] p-6" onClick={() => setK(k + 1)}>
      <div className="flex flex-col items-center gap-10">
        <Marca key={k} tam={360} montar atraso={0.2} />
        <div className="flex items-end gap-6">
          {[96, 64, 40, 28, 20].map((t) => <Marca key={t} tam={t} vivo />)}
        </div>
        <p className="text-sm text-white/40">clique pra repetir</p>
      </div>
    </div>
  );
}
