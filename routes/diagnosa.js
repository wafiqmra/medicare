const express = require("express");
const path = require("path");
const router = express.Router();
const axios = require("axios");

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "diagnosa.html"));
});

router.post("/", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions", // Ganti dengan endpoint sesuai OpenChat
      {
        message: userMessage,
        model: "gpt-3.5-turbo"
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENCHAT_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const reply = response.data.reply || "Maaf, tidak ada respon.";
    res.json({ reply });
  } catch (error) {
    console.error(error.message);
    res.json({ reply: "Terjadi kesalahan saat menghubungi API." });
  }
});

module.exports = router;
