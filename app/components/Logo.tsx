import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href={"/"} className={`flex items-center gap-2 ${className}`}>
      <span className="text-lg font-semibold tracking-tight leading-none">
        observex<span className="text-primary">/</span>
      </span>
    </Link>
  );
}
