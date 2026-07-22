import { ImageResponse } from "next/og";

export const alt = "Kataleya Flawers — Floristería en Lima, Perú";
export const size = { width: 1200, height: 630 } as const;
export const contentType = "image/png";

const COLOR_CREAM = "#fdfcfa";
const COLOR_PRIMARY = "#c0392b";
const COLOR_SECONDARY = "#e8b84b";
const COLOR_DARK = "#1a1a1a";

export default async function Image(): Promise<ImageResponse> {
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
          backgroundColor: COLOR_CREAM,
          backgroundImage: `radial-gradient(circle at 20% 20%, ${COLOR_SECONDARY}22 0%, transparent 50%), radial-gradient(circle at 80% 80%, ${COLOR_PRIMARY}15 0%, transparent 55%)`,
          fontFamily: "serif",
          padding: "80px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "8px",
            backgroundColor: COLOR_SECONDARY,
            display: "flex",
          }}
        />

        <div
          style={{
            display: "flex",
            fontSize: "24px",
            color: COLOR_DARK,
            opacity: 0.65,
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            marginBottom: "32px",
            fontFamily: "sans-serif",
          }}
        >
          Floristería · Lima, Perú
        </div>

        <div
          style={{
            display: "flex",
            fontSize: "128px",
            fontWeight: 700,
            color: COLOR_PRIMARY,
            lineHeight: 1.05,
            textAlign: "center",
            letterSpacing: "-0.02em",
          }}
        >
          Kataleya Flawers
        </div>

        <div
          style={{
            display: "flex",
            fontSize: "40px",
            color: COLOR_DARK,
            opacity: 0.78,
            marginTop: "32px",
            textAlign: "center",
            maxWidth: "900px",
            fontStyle: "italic",
          }}
        >
          Flores que cuentan historias en Lima
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "12px",
            backgroundColor: COLOR_PRIMARY,
            display: "flex",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
