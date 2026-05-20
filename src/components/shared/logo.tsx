import Link from "next/link";

const brandName = process.env.NEXT_PUBLIC_BRAND_NAME ?? "RaspaLead";

interface LogoProps {
  href?: string;
  className?: string;
}

export function Logo({ href = "/", className }: LogoProps) {
  return (
    <Link href={href} className={`flex items-center gap-3 ${className ?? ""}`}>
      <div className="flex h-10 w-10 items-center justify-center rounded-[10px] border-[3px] border-[#050505] bg-[#155EEF] text-white shadow-[4px_4px_0_#050505]">
        <span className="font-display text-sm font-black">R</span>
      </div>
      <div className="space-y-0.5">
        <span className="font-display block text-lg font-black uppercase tracking-normal text-[#0F172A]">
          {brandName}
        </span>
        <span className="font-data block text-[10px] font-black uppercase tracking-[0.22em] text-[#475569]">
          Central de prospeccao
        </span>
      </div>
    </Link>
  );
}
