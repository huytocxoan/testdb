import mongoose from "mongoose";

console.log("🚀 pairs.js đã được load trên server!");  // 👈 Log test

const connectDB = async () => {
  if (mongoose.connections[0]?.readyState) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

const sensorSchema = new mongoose.Schema({
  type: String,
  value: Number,
}, { timestamps: true });

const Sensor = mongoose.models.Sensor || mongoose.model("Sensor", sensorSchema);

export default async function handler(req, res) {
  console.log("📡 pairs API running...");  // 👈 Log test

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await connectDB();

    const docs = await Sensor.find().sort({ createdAt: -1 }).limit(50).lean();

    const pairs = [];
    let current = { temperature: null, humidity: null, tTime: null, hTime: null };

    for (const d of docs) {
      if (d.type === "temperature") {
        current.temperature = d.value;
        current.tTime = d.createdAt || null;
      } else if (d.type === "humidity") {
        current.humidity = d.value;
        current.hTime = d.createdAt || null;
      }

      if (current.temperature !== null && current.humidity !== null) {
        const pairTime = current.tTime && current.hTime
          ? (current.tTime > current.hTime ? current.tTime : current.hTime)
          : (current.tTime || current.hTime || null);

        pairs.push({
          temperature: current.temperature,
          humidity: current.humidity,
          time: pairTime
        });

        current = { temperature: null, humidity: null, tTime: null, hTime: null };
        if (pairs.length >= 5) break;
      }
    }

    res.status(200).json(pairs);
  } catch (err) {
    console.error("❌ Error in /api/pairs:", err);
    res.status(500).json({ error: "Server error" });
  }
}
