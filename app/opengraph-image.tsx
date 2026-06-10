import { ImageResponse } from "next/og";
import { profile } from "@/data/profile";

export const alt = `${profile.name} — ${profile.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Link-preview card: dark glass aesthetic matching the site. */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#0A0A0B",
          backgroundImage:
            "radial-gradient(at 75% 25%, rgba(226,178,90,0.18), transparent 60%), radial-gradient(at 15% 85%, rgba(74,92,125,0.20), transparent 60%)",
          color: "#EDEDEF",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: 24,
            letterSpacing: "0.2em",
            color: "#8A8A93",
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: "#E2B25A",
            }}
          />
          {profile.role.toUpperCase()} · {profile.location.toUpperCase()}
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 96,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1.02,
          }}
        >
          {profile.name}
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 34,
            color: "#B9B9C1",
            maxWidth: 820,
            lineHeight: 1.35,
          }}
        >
          {profile.tagline}
        </div>
        <div
          style={{
            marginTop: 48,
            fontSize: 24,
            color: "#E2B25A",
          }}
        >
          Ask my portfolio anything →
        </div>
      </div>
    ),
    { ...size },
  );
}
