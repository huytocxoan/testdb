import mongoose from "mongoose";

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
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  try {
    await connectDB();
    // lấy data và ghép cặp... (giống bạn)
    res.status(200).json(pairs);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
}
