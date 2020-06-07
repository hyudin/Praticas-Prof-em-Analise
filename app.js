var bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    express = require("express"),
    app = express(),
    mongoose = require("mongoose"),
    User = require("./models/user"),
    Post = require("./models/post");
InitiateMongoServer = require("./config/db");



//Iniciar o server mongo
InitiateMongoServer();

// PORT
var PORT = process.env.PORT || 8080;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
// app.use(userRouter);

app.get("/", function (req, res) {
    res.render("home");
});

var mongoose = require("mongoose");
// var shortid = require("shortid");



//RESTFUL Routes

//=================== INDEX ROUTE ======================
app.get("/profile", function (req, res) {
    User.find({}, function (err, user) {
        if (err) {
            console.log("Erro ao carregar dados do usuário");
        } else {
            // res.render("profile", {user:user});
            console.log(user);


            Post.find({}, function (err, posts) {
                if (err) {
                    console.log("Erro ao carregar posts!");
                } else {
                    res.render("profile", { posts: posts, user: user });
                }

            });
        }
    });
});



// =================== SHOW ROUTE =====================
app.get("/profile/:email", function(req,res){
        User.find({email:req.params.email}, function(err,foundUser){
            if(err){
                console.log(err);
                console.log("Usuário não encontrado");
            } else {

                Post.find({}, function (err, posts) {
                    if (err) {
                        console.log("Erro ao carregar posts!");
                    } else {
                        console.log("Usuário encontrado");
                        console.log(foundUser);
                        res.render("profile", { posts: posts, user: foundUser });
                    }
    
                });
            }
        })
});

//=================== NEW ROUTE ======================

//CRIAR POST
app.post("/profile", function (req, res) {
    // create post
    Post.create(req.body.newpost, function (err, newPost) {
        if (err) {
            console.log("error");
        } else {
            res.redirect("profile");
            console.log(newPost);
        }
    });
});


//=================EDIT ROUTE===================
app.get("/profile/:email/edit",function(req,res){
    User.find({email:req.params.email}, function(err, foundUser){
        if(err){
            console.log("ERRO USUÁRIO NÃO ENCONTRADO!");
        } else {
            res.render("editprofile", {user:foundUser});
        }

    })
});


//================UPDATE ROUTE===================
app.put("/profile/:email",function(req,res){
    User.findOneAndUpdate(req.params.email, req.body.user, function(err,foundUser){
        if(err){
            res.redirect("/profile"); 
        }   else {
            res.redirect("/profile/" + req.params.email);
        }

    });
});
app.get("/cadastro",function(req,res){
    res.render("cadastro");
});


//================DELETE ROUTE====================
app.delete("/profile/:id/post/",function(req,res){
    res.send("DELETAR POST");
});





async function listDatabases(client) {
    databasesList = await client.db().admin().listDatabases();

    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};

app.listen(PORT, function () {
    console.log("Server funcionando na porta 8080");
});