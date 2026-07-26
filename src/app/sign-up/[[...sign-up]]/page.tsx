import { SignUp } from "@clerk/nextjs";

import { AuthShell } from "@/components/auth/auth-shell";

export default function SignUpPage() {
  return (
    <AuthShell eyebrow="Your journey is waiting" title="Create your free account">
      <SignUp />
    </AuthShell>
  );
}
