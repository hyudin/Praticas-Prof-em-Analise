var bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    express = require("express"),
    app = express(),
    mongoose = require("mongoose"),
    seedDB = require("./seeds"),
    User = require("./models/user"),
    Post = require("./models/post");
InitiateMongoServer = require("./config/db");
// seedDB();


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
app.get("/profile/:email", function (req, res) {
    User.find({ email: req.params.email }, function (err, foundUser) {
        if (err) {
            console.log(err);
            console.log("Usuário não encontrado");
        } else {
            Post.find({}, function (err, posts) {
                if (err) {
                    console.log("Erro ao carregar posts!");
                } else {
                    // console.log("Usuário encontrado");
                    // console.log(foundUser);
                    res.render("profile", { posts: posts, user: foundUser });
                }

            });
        }
    })
});

//=================== NEW ROUTE ======================

//CRIAR POST
app.post("/profile/:email", function (req, res) {

    Post.create(req.body.newpost,function (err, newPost) {
        if (err) {
            console.log(err);
        } else {
            res.redirect(req.params.email);
            console.log(newPost);
        }
    });
});



//=================EDIT ROUTE===================
app.get("/profile/:email/edit", function (req, res) {
    User.find({ email: req.params.email }, function (err, foundUser) {
        if (err) {
            console.log("ERRO USUÁRIO NÃO ENCONTRADO!");
        } else {
            res.render("editprofile", { user: foundUser });
        }

    })
});





//================UPDATE ROUTE===================
app.put("/profile/:email", function (req, res) {
    User.findOneAndUpdate(req.params.email, req.body.user, function (err, foundUser) {
        if (err) {
            res.redirect("/profile");
        } else {
            res.redirect("/profile/" + req.params.email);
        }

    });
});

//LIKE

app.get("/profile/:email/like/:id", function (req, res) {
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

app.put("/profile/:email/like/:id", function (req, res) {
    console.log("OI");
    console.log(req.body.post);
    Post.findByIdAndUpdate(req.params.id, req.body.post ,function(err){
        if(err){
            console.log(err);
        }   else{
            console.log("LIKE");
            res.redirect('back');
        }
    });
});

app.get("/cadastro", function (req, res) {
    res.render("cadastro");
});


//================DELETE ROUTE====================
app.delete("/profile/:email", function (req, res) {
    console.log("oi");
    console.log(req.params);
    console.log(req.body.post);

    var id = req.body.post.id;
    console.log("iD:"+ id);

    Post.findByIdAndDelete(id,function(err){
        if(err){
            console.log(err);
        }   else{
            res.redirect(req.params.email);
        }
    });
    
    // Post.findByIdAndRemove(req.body.post, function (err) {
    //     if (err) {
    //         console.log(err);
    //         res.redirect(req.params.email);
    //     } else {
    //         res.redirect(req.params.email);
    //     }
    // });
    // Post.find({},function(err,foundPosts){
    //     if(Post._id == req.params.id{
    //         console.log("ACHEI");
    //         // Post.findByIdAndRemove(req.params.post);
    //     } else {
    //         console.log("não encontrado");
            
    //     }
    // })
});





async function listDatabases(client) {
    databasesList = await client.db().admin().listDatabases();

    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};

app.listen(PORT, function () {
    console.log("Server funcionando na porta 8080");
});