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
          backgroundColor: "#0A0A0F",
          backgroundImage:
            "radial-gradient(at 75% 25%, rgba(159,143,255,0.18), transparent 60%), radial-gradient(at 15% 85%, rgba(92,168,255,0.16), transparent 60%)",
          color: "#EDEDF2",
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
            color: "#8B8B98",
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: "#9F8FFF",
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
            color: "#B9B9C4",
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
            color: "#9F8FFF",
          }}
        >
          Ask my portfolio anything →
        </div>
      </div>
    ),
    { ...size },
  );
}
