import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./Logo";

export function SiteHeader() {
  return (
    <header className="w-full border-b border-border/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Logo />
        <nav className="hidden gap-8 text-sm text-muted-foreground md:flex">
          <a href="#product" className="hover:text-foreground">
            Product
          </a>
          <a href="#why" className="hover:text-foreground">
            Why ObservEx
          </a>
          <a href="#pricing" className="hover:text-foreground">
            Pricing
          </a>
          <a href="#resources" className="hover:text-foreground">
            Resources
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />

          <Link
            href={"/login"}
            className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background hover:opacity-90"
          >
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}
