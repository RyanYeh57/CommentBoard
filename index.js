// 資料庫基礎設定
const mongo = require("mongodb");
const uri = "mongodb+srv://ryan:ryan123@cluster0.fqfkhlz.mongodb.net/test";
const client = new mongo.MongoClient(uri)
const dayjs = require("dayjs")
let db = null;
client.connect(async function(err){
  if (err){
    console.log("資料庫連線失敗", err);
    return;
  }
  db = client.db("comment_system");
  console.log("資料庫連線成功");
}); 

// 建立網站伺服器基礎設定
// express基礎設定
const express = require("express");
const app = express();

// ejs樣板引擎的基礎設定
app.set("view engine", "ejs");
app.set("views", "./views");

// 設定啟動伺服器 Port 3000  
app.listen(3000, function(){
  console.log("Server stared");
})

// session基礎設定
const session = require("express-session");
app.use(session({
  secret: "anything", 
  resave: false, 
  saveUninitialized: true, 
}));

// POST的基礎設定
app.use(express.urlencoded({extended:true}));

// 路由基礎設定
// 設定首頁的路由
app.get("/", async function(req, res){
  res.render("home.ejs")
});

// 註冊會員的路由
app.post("/sign-up",async function(req, res){
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
// 檢查資料庫中的資料
  const collection = db.collection("member");
  let result = await collection.findOne({
    email: email
  });
  if (result!==null){
    res.redirect("/error?msg=信箱重覆，註冊失敗")
    return;
  };
  result = await collection.insertOne({
    name: name, email: email, password: password
  });
  res.redirect("/");

});

//登入會員的路由
app.post("/login", async function(req, res){
  const email = req.body.email;
  const password = req.body.password;
  // 檢查資料庫中的資料
  const collection = db.collection("member");
  let result = await collection.findOne({
    $and:[
      {email: email},
      {password: password}
    ]
  });
  if(result==null){
    res.redirect("/error?msg=登入失敗");
    return;
  };
  req.session.member = result;
  res.redirect("/member")
});

// 登出會員的路由
app.get("/logout",function(req, res){
  req.session.member = null;
  res.redirect("/");
});

// 設定留言的路由
app.get("/comment", async function(req, res){
  const name = req.session.member.name;
  const comment = req.query.comment;
  const now = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss');
  const collection = db.collection("comments");
  if(!req.session.member){
    res.redirect("/");
    return;
  };
  let result = await collection.insertOne({
    name: name, comment: comment ,now: now
  });
  res.redirect("/member",);
});

// 設定會員頁面的路由
app.get("/member", async function(req, res){
  if(!req.session.member){
    res.redirect("/");
    return;
  };
  const name = req.session.member.name
  const collection = db.collection("comments");
  let comments = await collection.find({});
  let data = []
  if(comments!==null){
  await comments.forEach(function(comment){
    data.push(comment);
  }); 
  };
  res.render("member.ejs", {name: name, data: data});
});

// 連線到/error?msg=錯誤訊息
app.get("/error", function(req, res){
  const msg = req.query.msg;
  res.render("error.ejs", {msg: msg})
});