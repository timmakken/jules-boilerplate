export { default } from "next-auth/middleware";

// Applies next-auth only to matching routes - can be regex
// Ref: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: [
    "/account/:path*",
    "/generate/:path*", // Example: if you have a /generate page that needs auth
    // Add other paths that require authentication
    // e.g., "/dashboard/:path*"
  ]
};
