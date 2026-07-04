export function Histogram() {
  const bars = [
    14, 18, 22, 28, 26, 32, 38, 44, 52, 60, 72, 84, 96, 88, 76, 62, 54, 48, 42, 36, 30, 26, 22, 18,
  ];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 3,
        height: 64,
        marginBottom: 6,
      }}
    >
      {bars.map((h, i) => (
        <span
          key={i}
          style={{
            display: "block",
            flex: 1,
            height: `${h}%`,
            background: i > 10 && i < 16 ? "#f87171" : "#0d9488",
            opacity: i > 10 && i < 16 ? 1 : 0.7,
            borderRadius: 2,
          }}
        />
      ))}
    </div>
  );
}
