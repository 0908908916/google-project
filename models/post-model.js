const mongoose = require("mongoose");

// 新的 post 內容
const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  // 每一個 post 有裡面的內容
  content: {
    type: String,
    required: true,
  },
  // 甚麼時候用這個 post (時間)
  date: {
    type: Date,
    default: Date.now,
  },
  // 作者
  author: String,
});

// 建為可用模組

module.exports = mongoose.model("Post", postSchema);
