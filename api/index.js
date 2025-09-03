import mongoose from "mongoose";

let conn = null;
const uri = "mongodb+srv://vqhuy246:Huy2462003@vuqanghuy.3wc8fub.mongodb.net/test?retryWrites=true&w=majority";

// Schema
const sensorSchema = new mongoose.Schema({
  type: String,
  value: Number,
}, { timestamps: true });

const Sensor = mongoose.models.Sensor || mongoose.model("Sensor", sensorSchema);

export default async function handler(req, res) {
  if (!conn) {
    conn = await mongoose.connect(uri);
  }

  if (req.method === "POST") {
    try {
      console.log("📥 ESP32 gửi:", req.body);
      const data = new Sensor(req.body);
      await data.save();
      res.status(200).json({ message: "✅ Lưu thành công" });
    } catch (e) {
      console.error("❌ Lỗi lưu dữ liệu:", e);
      res.status(500).json({ error: "Lỗi lưu dữ liệu" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
