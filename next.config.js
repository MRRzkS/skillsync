/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Client-side Router Cache lifetimes.
    //
    // `dynamic: 0` is deliberate: the HR data routes read a Supabase project
    // shared with the Candidate module, so a candidate can finish an assessment
    // at any moment. Letting the router replay a cached RSC payload would show
    // an out-of-date ranking — the exact stale-data class of bug already fixed
    // server-side in lib/supabase/server.ts. Navigation still feels instant
    // because every dynamic route has a loading.tsx skeleton and <Link>
    // prefetches the route shell and its JS chunks.
    //
    // `static: 180` (the default) applies to links marked prefetch={true};
    // only data-free routes such as /hr/new-job opt into that.
    staleTimes: {
      dynamic: 0,
      static: 180,
    },
  },
  images: {
    // Google account photos, shown as the avatar for OAuth sign-ins.
    remotePatterns: [
      { protocol: "https", hostname: "**.googleusercontent.com" },
    ],
  },
};

module.exports = nextConfig;
