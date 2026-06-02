import type { ReactNode } from "react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { FiChevronLeft } from "react-icons/fi";
import Link from "next/link";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex items-center justify-between px-6 py-4">
        <Logo />
        <ThemeToggle />
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl">
          <Link href={"/"} className="flex items-center gap-1 mb-4 group w-max">
            <FiChevronLeft className="group-hover:-translate-x-0.5 transition" />
            <span>Back</span>
          </Link>

          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
          <div className="mt-6 border-t border-border pt-4 text-center text-sm text-muted-foreground">
            {footer}
          </div>
        </div>
      </div>
    </div>
  );
}
