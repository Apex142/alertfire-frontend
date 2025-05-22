import { Info } from "lucide-react";

interface LocationTechInfoProps {
  info: string;
}

export const LocationTechInfo = ({ info }: LocationTechInfoProps) => (
  <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-3 sm:p-5 w-full max-w-full">
    <div className="flex items-center gap-2 mb-2 sm:mb-3">
      <Info className="w-5 h-5 text-primary" />
      <span className="font-bold text-gray-900 text-base sm:text-lg">
        Infos techniques du lieu
      </span>
    </div>
    <div
      className="
        rounded-xl bg-slate-50 border border-slate-100
        text-[14px] sm:text-[15px] text-gray-700
        px-3 py-2 sm:px-4 sm:py-3
        whitespace-pre-line font-mono leading-relaxed shadow-inner
        break-words
      "
    >
      {info}
    </div>
  </div>
);
