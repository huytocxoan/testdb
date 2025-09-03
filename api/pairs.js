// api/pairs.js
const mongoose = require("mongoose");

const connectDB = async () => {
  if (mongoose.connections[0]?.readyState) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

const sensorSchema = new mongoose.Schema(
  {
    type: String,
    value: Number,
  },
  { timestamps: true }
);

const Sensor = mongoose.models.Sensor || mongoose.model("Sensor", sensorSchema);

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await connectDB();

    // ví dụ: lấy 10 bản ghi cuối cùng
    const data = await Sensor.find().sort({ createdAt: -1 }).limit(10);

    // ở đây bạn có thể xử lý ghép cặp nếu cần
    const pairs = data.map((d) => ({
      type: d.type,
      value: d.value,
      time: d.createdAt,
    }));

    res.status(200).json(pairs);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};
