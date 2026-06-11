import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./Logo";

export function SiteHeader() {
  return (
    <header className="w-full border-b border-border/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Logo />
        <nav className="hidden gap-8 text-sm text-muted-foreground md:flex">
          <Link href="/#product" className="hover:text-foreground">
            Product
          </Link>
          <Link href="/#how-it-works" className="hover:text-foreground">
            How it works
          </Link>
          <Link href="/demo" className="hover:text-foreground">
            Demo
          </Link>
          <Link href="/docs" className="hover:text-foreground">
            Docs
          </Link>
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
