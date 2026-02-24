import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Studio Pro";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          padding: "72px",
          background:
            "radial-gradient(140% 120% at 100% 0%, #8b5e3c 0%, #1b1410 45%, #0e0f13 100%)",
          color: "#f5f5f5",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: "-140px",
            top: "-140px",
            width: "420px",
            height: "420px",
            borderRadius: "999px",
            border: "1px solid rgba(255,255,255,0.2)",
            background: "radial-gradient(circle, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.02) 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "-120px",
            bottom: "-180px",
            width: "540px",
            height: "540px",
            borderRadius: "999px",
            border: "1px solid rgba(255,255,255,0.15)",
            background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.01) 68%)",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", zIndex: 2 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <p style={{ margin: 0, fontSize: 24, letterSpacing: "0.35em", textTransform: "uppercase", color: "#edd7ba" }}>
              STUDIO PRO
            </p>
            <h1 style={{ margin: "20px 0 0", fontSize: 76, lineHeight: 1.05, letterSpacing: "-0.03em", maxWidth: "880px" }}>
              CINEMATIC VISUALS FOR MODERN BRANDS
            </h1>
            <p style={{ margin: "24px 0 0", fontSize: 28, color: "rgba(255,255,255,0.86)" }}>
              Premium photography and production system
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center", fontSize: 20, color: "rgba(255,255,255,0.72)" }}>
            <span>Portrait</span>
            <span>•</span>
            <span>Commercial</span>
            <span>•</span>
            <span>Wedding</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
