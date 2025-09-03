const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI);

const sensorSchema = new mongoose.Schema({
  type: String,
  value: Number,
}, { timestamps: true });

const Sensor = mongoose.models.Sensor || mongoose.model("Sensor", sensorSchema);

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
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
      res.status(500).json({ error: "❌ Lỗi server" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
