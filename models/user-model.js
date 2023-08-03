const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: 6, // 最小長度
    maxLength: 255, // 最大長度
  },
  // 樹定 google ID 是我們從 google 會獲得的資料 要把它儲存在 google ID 當中
  googleID: {
    type: String,
  },
  // 我們是甚麼時候建立這筆資料的
  date: {
    type: Date,
    default: Date.now,
  },
  // 在 google 所儲存的圖片是甚麼 他是一個網址 所以是一個字串
  thumbnail: {
    type: String,
  },
  // Local Login 有可能使用者不是用 google login 的 而是用本地 登入
  email: {
    type: String,
  },
  password: {
    type: String,
    minLength: 6,
    maxLength: 1024,
  },
});

// 把它變成一個模組 就可以拿來用

module.exports = mongoose.model("User", userSchema);
