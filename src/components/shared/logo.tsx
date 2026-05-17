import Link from "next/link";

const brandName = process.env.NEXT_PUBLIC_BRAND_NAME ?? "RaspaLead";

interface LogoProps {
  href?: string;
  className?: string;
}

export function Logo({ href = "/", className }: LogoProps) {
  return (
    <Link href={href} className={`flex items-center gap-3 ${className ?? ""}`}>
      <div className="glow-primary flex h-9 w-9 items-center justify-center rounded-xl border border-primary/25 bg-primary/14">
        <span className="font-display text-sm font-extrabold text-primary">R</span>
      </div>
      <div className="space-y-0.5">
        <span className="font-display block text-lg font-bold tracking-[-0.03em] text-foreground">
          {brandName}
        </span>
        <span className="font-data block text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Central de prospeccao
        </span>
      </div>
    </Link>
  );
}
