import { AlertCircle } from "lucide-react";

import { ERROR_CODE_LABELS } from "@/shared/constants/errorCodes";

import type { ErrorCode } from "@/shared/constants/errorCodes";

interface ChartErrorOverlayProps {
  code: ErrorCode;
  message: string;
}

export default function ChartErrorOverlay({ code, message }: ChartErrorOverlayProps) {
  const label = ERROR_CODE_LABELS[code] ?? code;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-4 py-6 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(240,68,56,0.12)]">
        <AlertCircle size={22} className="text-[#f04438]" />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="font-semibold text-[#f04438] text-[13px]">{label}</span>
        <span className="max-w-[340px] text-[#b0b4ba] text-[12px] leading-relaxed">{message}</span>
        <span className="mt-1 inline-flex items-center justify-center self-center rounded bg-[rgba(240,68,56,0.1)] px-2 py-0.5 font-mono text-[#f04438] text-[10px] uppercase tracking-wider">
          {code}
        </span>
      </div>
    </div>
  );
}
