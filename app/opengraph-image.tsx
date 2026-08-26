import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Skillsync — Where CVs and job needs finally sync.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Auto-detected by Next.js and served at /opengraph-image for the root route
// (and inherited by every page that doesn't define its own), so a shared
// link gets a real title/description/banner card instead of a bare URL.
// Colours are the brand navy→purple gradient from globals.css, hardcoded
// here because this renders via next/og's Satori engine, which can't read
// CSS custom properties.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: "linear-gradient(120deg, #0A1420 0%, #1A5F7A 55%, #7C5CFC 130%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 84,
              height: 84,
              borderRadius: 20,
              backgroundColor: "rgba(255,255,255,0.12)",
              fontSize: 44,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            S
          </div>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 700, color: "#fff" }}>
            Skillsync
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 30,
            color: "rgba(255,255,255,0.85)",
          }}
        >
          Where CVs and job needs finally sync.
        </div>
      </div>
    ),
    { ...size }
  );
}
