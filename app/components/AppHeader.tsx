import Link from "next/link";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import Logout from "./Logout";

export function AppHeader() {
  return (
    <header className="w-full border-b border-border/60 bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden gap-6 text-sm text-muted-foreground md:flex">
            <Link href={"/dashboard"} className="hover:text-foreground">
              Sites
            </Link>
            <Link href={"/new"} className="hover:text-foreground">
              New project
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Logout />
        </div>
      </div>
    </header>
  );
}
