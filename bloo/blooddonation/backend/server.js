const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ DB CONNECTION (FIXED + SAFE)
mongoose.connect("mongodb://127.0.0.1:27017/bloodDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected Successfully"))
.catch(err => console.log("❌ MongoDB Error:", err));

// MODEL
const Donor = mongoose.model("Donor", {
  name: String,
  group: String,
  phone: String,
  lat: Number,
  lng: Number
});

// REGISTER (FIXED)
app.post("/register", async (req, res) => {
  try {
    console.log("Received Data:", req.body);

    const donor = new Donor(req.body);
    await donor.save();

    res.json({ success: true, message: "Saved to MongoDB" });
  } catch (err) {
    console.log("Save Error:", err);
    res.json({ success: false });
  }
});

// GET ALL
app.get("/donors", async (req, res) => {
  const data = await Donor.find();
  res.json(data);
});

// GET BY GROUP
app.get("/donors/:group", async (req, res) => {
  const data = await Donor.find({ group: req.params.group });
  res.json(data);
});

app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});