var express = require("express");
var app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", function(req,res){
    res.render("home");
});

app.get("/cadastro", function(req,res){
    res.render("cadastro");
});

app.get("/profile", function(req,res){
    var profiles = [
        {
         image: "/css/img/profile.jpg",
         name: "Henrique Yudi Yassuda Nishimoto",
         age: "28",
         city: "São Paulo",
         state: "SP",
         course: "Administração",
         university: "Universidade Presbiteriana Mackenzie"}

    ]
    res.render("profile", {profiles:profiles});
});

app.listen(8080, function(){
    console.log("Server funcionando na porta 8080");
});