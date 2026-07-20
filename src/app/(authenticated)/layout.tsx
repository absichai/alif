import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

import { AssistantDrawer } from "@/components/assistant/assistant-drawer";
import { AlifLogo } from "@/components/brand/alif-logo";

export default async function AuthenticatedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="min-h-screen bg-[var(--sand)]">
      <header className="border-b border-[var(--border)] bg-white px-5 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link aria-label="ALIF journey" href="/journey">
            <AlifLogo compact />
          </Link>
          <nav aria-label="Primary" className="flex items-center gap-5 text-sm font-bold">
            <Link href="/journey">Journey</Link>
            <Link href="/profile">Profile</Link>
            <UserButton />
          </nav>
        </div>
      </header>
      {children}
      <AssistantDrawer />
    </div>
  );
}
