// export { default } from "next-auth/middleware";

export default function middleware() {
  // Bypassing for UI Preview
  return;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/admin/:path*",
  ],
};
