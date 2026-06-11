import { ReactNode, Suspense } from "react";
import { RiLoader5Line } from "react-icons/ri";

export default function ProjectLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <RiLoader5Line className="animate-spin text-3xl text-primary/70" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
