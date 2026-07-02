export const dynamic = "force-dynamic";

import { Navbar } from "@/components/navbar";
import { AppAmbient } from "@/components/app-ui";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark relative flex min-h-screen flex-col bg-[#050508] text-white">
      <AppAmbient />
      <Navbar />
      <main className="relative flex-1">{children}</main>
    </div>
  );
}
