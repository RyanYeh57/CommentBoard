// 資料庫基礎設定
const mongo = require("mongodb");
const uri = "mongodb+srv://ryan:ryan123@cluster0.fqfkhlz.mongodb.net/test";
const client = new mongo.MongoClient(uri)
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

// 設定首頁的路由
app.get("/", async function(req, res){
  const collection = db.collection("comments");
  let comments = await collection.find({});
  let data = []
  if(comments!==null){
  await comments.forEach(function(comment){
    data.push(comment);
  }); 
  };
  res.render("index.ejs",{data: data})
});

// 設定留言的路由
app.get("/comment", async function(req, res){
  const name = req.query.name;
  const comment = req.query.comment;
  const collection = db.collection("comments");
  let result = await collection.insertOne({
    name: name, comment: comment
  });
  res.redirect("/",);
});