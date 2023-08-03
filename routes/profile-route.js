const router = require("express").Router();
// 導入 post 模組
const Post = require("../models/post-model");

// 如果還沒有被認證過的話就導向 login 畫面 請你先登入
const authCheck = (req, res, next) => {
  // 設定我們最後要回去的值 就會到標題這個地方 title contect
  console.log(req.originalUrl);
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    res.redirect("/auth/login");
  } else {
    next();
  }
};

// 想要顯示使用者的資料
router.get("/", authCheck, async (req, res) => {
  // 增加一個想看到的東西 傳到那個 post 顯示作者 再傳到 profile 當中
  let postFound = await Post.find({ author: req.user._id });
  res.render("profile", { user: req.user, posts: postFound }); // 到時候就可以在 ejs 用這個物件
});

// 新增一個 route
router.get("/post", authCheck, (req, res) => {
  res.render("post", { user: req.user });
});

// 新增一個 post route
router.post("/post", authCheck, async (req, res) => {
  let { title, content } = req.body;
  let newPost = new Post({ title, content, author: req.user._id }); // 新增一個作者的編寫
  try {
    await newPost.save();
    res.status(200).redirect("/profile");
  } catch (err) {
    req.flash("error_msg", "Both title and content are require.");
    res.redirect("/profile/post");
  }
});

module.exports = router;
