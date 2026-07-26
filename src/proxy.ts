import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    "/journey/:path*",
    "/profile(.*)",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/journeys(.*)",
    "/api/journey-steps(.*)",
    "/api/assistant(.*)",
    "/api/profile(.*)",
    "/__clerk/(.*)",
  ],
};
