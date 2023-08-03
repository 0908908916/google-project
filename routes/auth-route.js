const router = require("express").Router();
const passport = require("passport");
// 導入讓使用者加密
const bcrypt = require("bcrypt");
// 記得加入 user model
const User = require("../models/user-model");

router.get("/login", (req, res) => {
  // render 到這個 login
  res.render("login", { user: req.user });
});

// 增加一個註冊的網址
router.get("/signup", (req, res) => {
  res.render("signup", { user: req.user });
});

// 撰寫登出的程式碼 logOut() 原本登出的函數 登出後找回到首頁
router.get("/logout", (req, res) => {
  res.logOut();
  res.redirect("/");
});

// // 寫一個關於登入的  passport-local  route
router.post(
  "login",
  passport.authenticate("local", {
    failureRedirect: "/auth/login", // 登入失敗的話導向這個網址
    failureFlash: "Wrong email or password.", // 登入失敗出現的訊息
  }),
  (req, res) => {
    // 登入成功就會執行並導入這個網頁
    if (req.session.returnTo) {
      let newPath = req.session.returnTo;
      req.session.returnTo = "";
      res.redirect(newPath);
    } else {
      res.redirect("/profile");
    }
  }
);

// 我們要來處理使用者註冊的資料 可做為資料儲存 註冊完就會出現資料在終端機 例: { name: 'jakoy', email: 'kao@fake.com', password: '123456' } 輸入的資料
router.post("/signup", async (req, res) => {
  console.log(req.body);
  let { name, email, password } = req.body;
  // check if the data is already in db 如果 email 有重複的話我們就要把他找到
  const emailExist = await User.findOne({ email });
  // 如果 email 確實存在的話 出現同一個帳號 錯誤的話就導回同一頁 並出現訊息
  if (emailExist) {
    req.flash("error_msg", "Email has already been registered.");
    res.redirect("/auth/signup");
  }

  // 再來讓使用者加密
  const hash = await bcrypt.hash(password, 10);
  password = hash;
  let newUser = new User({ name, email, password });
  try {
    await newUser.save();
    // 儲存成功的話 就導向 login 並顯示成功訊息
    // 可以到這個網址看使用者資料 https://cloud.mongodb.com/v2/64bfc020ed71d573a75c740d#/metrics/replicaSet/64bfc53b1146a67dc3378092/explorer/test/users/find
    req.flash("success_msg", "Registration succeeds. You can login now.");
    res.redirect("/auth/login");
  } catch (err) {
    req.flash("error_msg", err.errors.name.properties.message); // 打錯會顯示錯誤的值
    // 設定如果打的帳號不符合標準會出現錯誤
    // console.log(err.errors.name.properties); // 可以找到錯誤的值資料看資料並運用
    // 重新導向到 signup
    res.redirect("/auth/signup");
  }
});

// 這個意思就是我們要用 我們的 passport 來做 google 的驗證 然後我們想獲得他的資料 就是 scope: ["profile"] 這一段 也可以寫別的 scope: ["email"] 這樣
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"], // 讓 google 登入資料庫 會顯示 email
  })
);

// 若希望使用者每次登入系統時，可以選擇登入的帳號，則需要加入 要用可註解上面用下面 否則相反
// router.get(
//   "/google",
//   passport.authenticate("google", {
//     scope: ["profile", "email"],
//     prompt: "select_account",
//   })
// );

// 我們要登入進去的時候會發生什麼 然後會到 res 的那個頁面 不用加 /auth
router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
  if (req.session.returnTo) {
    let newPath = req.session.returnTo;
    req.session.returnTo = "";
    res.redirect(newPath);
  } else {
    res.redirect("/profile");
  }
});

module.exports = router;
