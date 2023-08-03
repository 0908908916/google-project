const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config(); // 連結 .env檔案
// 獲得一個 route
const authRoute = require("./routes/auth-route");
// 導入 profile 模組
const profileRoute = require("./routes/profile-route");
// 導入 passport 模組 不用給他變數 因為 use 會直接貼到這裡
require("./config/passport");
// 導入 cookieSession
const cookieSession = require("cookie-session");
// 導入 passport
const passport = require("passport");
const session = require("express-session");
const flash = require("connect-flash");

// mongo 網址: https://cloud.mongodb.com/v2/64bfc020ed71d573a75c740d#/clusters
// 要運用 mongoDB 網頁雲端串api 網址 步驟為 到這個 database 之後 點按鈕 Connect 再來 Drivers 這個選項
// 選向下拉是選單 Driver  Node.js    Version  3.6 or later  把下面的網址複製 然後用字串的方式貼過來
// 再來下面就是一般的設定了 然後 npm 要載入模組 npm install mongodb@3.6
// 然後以下的網址 <password> 要取代掉 打上我設定的密碼 778899password
mongoose
  .connect(
    // 這樣就把他的 passport 藏起來了
    process.env.DB_CONNECT,
    // 這下面的網址應該把它隱藏 所以用到 .env 裡面 先註解方便理解
    // "mongodb+srv://778899:778899password@cluster0.gfympf8.mongodb.net/?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    console.log("Connect to mongodb atlas.");
  })
  .catch((err) => {
    console.log(err);
  });

// middleware
// 這個有順序性的

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

///////////////////////////

// 這個後來刪除 留著方便辨識這是幹嘛的

// 把 cookieSession 放在 route 前面 在 .env 文檔 加一個 SECRET=THISISMYSECRETWOW
// app.use(
//   cookieSession({
//     keys: [process.env.SECRET],
//   })
// );

//////////////////////////////
// 1.
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

// 2.
// 這個用完還要再作兩個設定 他會 Browser Stores Cookies
app.use(passport.initialize());
app.use(passport.session());
//////////////
app.use(flash());
// 讓註冊帳號打錯錯誤出現在上方 當中的物件可以設定屬性叫 sucess_msg 然後 views 都是可以用的
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error"); // passport-local 錯誤訊息
  next();
});

// 3. route

app.use("/auth", authRoute); // 這句話的意思 他經過上面會檢查 auth 有沒有 有的話就會進入 authRoute 他就可以檢查是要做 login 還是 google 這樣子
app.use("/profile", profileRoute); // 導入 profile 模組

app.get("/", (req, res) => {
  // 我們要導入 index.ejs
  res.render("index", { user: req.user });
});

app.listen(8080, () => {
  console.log("Server running on port 8080.");
});

// 在終端機打上 nodemon index.js   出現 Server running on port 8080.   Connect to mongodb atlas. 連接成功
// 網址為: http://localhost:8080/
