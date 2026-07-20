import { SignIn } from "@clerk/nextjs";

import { AuthShell } from "@/components/auth/auth-shell";

export default function SignInPage() {
  return (
    <AuthShell eyebrow="Welcome back" title="Continue your journey">
      <SignIn />
    </AuthShell>
  );
}
