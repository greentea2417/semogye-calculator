import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          background: "#F5F1E6",
          borderRadius: 8,
          border: "1px solid #E5DFCF",
        }}
      >
        {/* 계산기 화면 */}
        <div
          style={{
            width: 22,
            height: 6,
            background: "#4B5B63",
            borderRadius: 2,
            marginBottom: 3,
          }}
        />
        {/* 버튼 2x2 */}
        <div style={{ display: "flex", gap: 2 }}>
          <div style={{ width: 9, height: 7, background: "#5FCFA8", borderRadius: 2 }} />
          <div style={{ width: 9, height: 7, background: "#5FCFA8", borderRadius: 2 }} />
        </div>
        <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
          <div style={{ width: 9, height: 7, background: "#3B82C4", borderRadius: 2 }} />
          <div style={{ width: 9, height: 7, background: "#2A5F9E", borderRadius: 2 }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
