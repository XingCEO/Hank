import { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

type PageShellProps = {
  path: string;
  children: ReactNode;
};

export function PageShell({ path, children }: PageShellProps) {
  return (
    <div className="relative overflow-x-clip">
      <SiteHeader currentPath={path} />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
