import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

const aqiMeterData = [
  { name: "Good",          value: 20, color: "#16a34a" },
  { name: "Moderate",      value: 20, color: "#eab308" },
  { name: "Unhealthy",     value: 20, color: "#f97316" },
  { name: "Very Unhealthy",value: 20, color: "#ef4444" },
  { name: "Hazardous",     value: 20, color: "#7c2d12" },
];

const AQI_TEXT_COLORS = {
  "Good":           "#16a34a",
  "Moderate":       "#ca8a04",
  "Unhealthy":      "#ea580c",
  "Very Unhealthy": "#dc2626",
  "Hazardous":      "#7c2d12",
};

const getNeedleAngle = (category) => {
  switch (category) {
    case "Good":           return -150;
    case "Moderate":       return -110;
    case "Unhealthy":      return -50;
    case "Very Unhealthy": return -20;
    case "Hazardous":      return 10;
    default:               return -150;
  }
};

const Needle = ({ angle }) => {
  const centerX = 160;
  const centerY = 130;
  const length  = 75;
  const radian  = (Math.PI / 180) * angle;
  const x = centerX + length * Math.cos(radian);
  const y = centerY + length * Math.sin(radian);

  return (
    <svg
      width="320"
      height="160"
      style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
    >
      <line
        x1={centerX} y1={centerY}
        x2={x}       y2={y}
        stroke="#020617" strokeWidth="4" strokeLinecap="round"
      />
      <circle cx={centerX} cy={centerY} r="7" fill="#020617" />
    </svg>
  );
};

function PollutantChart({ pollutants, aqiCategory }) {
  if (!pollutants) return null;

  const data = [
    { name: "CO",    value: pollutants.co    },
    { name: "Ozone", value: pollutants.ozone },
    { name: "NO₂",   value: pollutants.no2   },
    { name: "PM2.5", value: pollutants.pm25  },
  ];

  const labelColor = AQI_TEXT_COLORS[aqiCategory] || "#020617";

  return (
    <div style={styles.card}>

      {/* Gauge */}
      <h3 style={styles.heading}>Air Quality Gauge</h3>

      <div style={styles.gaugeWrapper}>
        <PieChart width={320} height={160}>
          <Pie
            data={aqiMeterData}
            startAngle={180}
            endAngle={0}
            cx="50%"
            cy="100%"
            innerRadius={70}
            outerRadius={100}
            dataKey="value"
            stroke="none"
          >
            {aqiMeterData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>

        <Needle angle={getNeedleAngle(aqiCategory)} />
      </div>

      {/* Label BELOW gauge with enough margin */}
      <p style={{ ...styles.aqiLabel, color: labelColor }}>
        {aqiCategory || "--"}
      </p>

      {/* Bar chart */}
      <h3 style={{ ...styles.heading, marginTop: "28px" }}>
        Pollutant Analytics
      </h3>

      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              fontSize: 12,
            }}
            cursor={{ fill: "#f8fafc" }}
          />
          <Bar dataKey="value" name="AQI Value" fill="#2563eb" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

    </div>
  );
}

const styles = {
  card: {
    background: "#ffffff",
    padding: "25px",
    borderRadius: "14px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    height: "100%",
  },
  heading: {
    fontSize: "18px",
    fontWeight: "700",
    marginBottom: "10px",
    color: "#1e293b",
  },
  gaugeWrapper: {
    position: "relative",
    width: "320px",
    height: "160px",
    margin: "0 auto",
  },
  aqiLabel: {
    textAlign: "center",
    fontSize: "22px",
    fontWeight: "800",
    marginTop: "16px",   /* positive margin — no overlap */
    marginBottom: "4px",
  },
};

export default PollutantChart;