import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

import { AssistantDrawer } from "@/components/assistant/assistant-drawer";
import { AlifLogo } from "@/components/brand/alif-logo";
import { AppNav } from "@/components/nav/app-nav";

export default async function AuthenticatedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-white/85 px-5 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link aria-label="ALIF journey" href="/journey">
            <AlifLogo compact />
          </Link>
          <div className="flex items-center gap-3">
            <AppNav />
            <UserButton />
          </div>
        </div>
      </header>
      {children}
      <AssistantDrawer />
    </div>
  );
}
