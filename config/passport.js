const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20"); // google 驗證方式
const User = require("../models/user-model");
// passport-local
const LocalStrategy = require("passport-local");
// 加密認證模組
const bcrypt = require("bcrypt");

// 跟 cookie 有關聯的 教學請看 Udemy線上課程的網頁開發全攻略 37節500. 部分 Sessions in Passport
passport.serializeUser((user, done) => {
  console.log("Serializing user now");
  // 加入底線是因為 mongoDB 使用者登入會存進去 然後到這個 mongoDB 它的名稱前面會加 _ 變成 _id
  done(null, user._id);
});

// 再來我們要看這個 cookie 的資料
passport.deserializeUser((_id, done) => {
  console.log("Derializing user now");
  User.findById({ _id }).then((user) => {
    console.log("Found user.");
    done(null, user);
  });
});

// 寫一個關於登入的  passport-local done 是一個函數 基本上不太用去管它
passport.use(
  new LocalStrategy((username, password, done) => {
    console.log(username, password, done);
    User.findOne({ email: username })
      .then(async (user) => {
        if (!user) {
          return done(null, false);
        }
        //  true 的話 就以下
        await bcrypt.compare(password, user.password, function (err, result) {
          if (err) {
            return done(null, false);
          }
          if (!result) {
            return done(null, false);
          } else {
            return done(null, user);
          }
        });
      })
      .catch((err) => {
        return done(null, false);
      });
  })
);

// middleware
// 用這個  GoogleStrategy

passport.use(
  new GoogleStrategy(
    {
      // 把這段隱藏起來 "15799745358-et7lrdm9kstnenvmn0ttpuktncqstbul.apps.googleusercontent.com", // 在 gooogle 雲端 API 服務 創建的 OAuth 用戶端編號
      clientID: process.env.GOOGLE_CLIENT_ID,
      // 這個跟上面一樣 "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", // 在 gooogle 雲端 API 服務 創建的 OAuth 用戶端密鑰
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/redirect",
    },
    (accessToken, refreshToken, profile, done) => {
      console.log(profile); // 他的登入資料全部
      User.findOne({ googleID: profile.id }).then((foundUser) => {
        if (foundUser) {
          console.log("User already exist");
          done(null, foundUser);
        } else {
          new User({
            name: profile.displayName,
            googleID: profile.id,
            thumbnail: profile.photos[0].value, // 縮圖
            // 我們要找 email 的值 profile 的 emails 的 value 第一個值
            email: profile.emails[0].value,
          })
            .save()
            .then((newUser) => {
              console.log("New user created.");
              done(null, newUser);
            });
        }
      });
    }
  )
);
