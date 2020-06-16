var bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    express = require("express"),
    app = express(),
    mongoose = require("mongoose"),
    moment = require('moment'),
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
const { request } = require("express");
const user = require("./models/user");
// var shortid = require("shortid");
app.locals.useremail;
app.locals.userid;
app.locals.userFriends;
app.locals.error = false;
app.locals.moment = moment;
moment.locale('pt-BR');



//RESTFUL Routes

//=================== INDEX ROUTE ======================
app.get("/profile", function (req, res) {
    User.find({}, function (err, user) {
        if (err) {
            console.log("Erro ao carregar dados do usuário");
        } else {
            // res.render("profile", {user:user});
            console.log(user);
            console.log(user.email)

            Post.find({'authorEmail': user.email }, function (err, posts) {
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
    useremail = req.params.email;
    User.find({ email: req.params.email }, function (err, foundUser) {
        if (err) {
            console.log(err);
            console.log("Usuário não encontrado");
        } else {
            console.log(foundUser.email)
            Post.find({'authorEmail': req.params.email }, function (err, posts) {
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

app.get('/showMyId', function (req, response, next) {
    response.send(useremail);
});

//=================== NEW ROUTE ======================

//CRIAR POST
app.post("/profile/:email", function (req, res) {

    Post.create(req.body.newpost, function (err, newPost) {
        if (err) {
            console.log(err);
        } else {
            res.redirect(useremail);
            console.log(newPost);
        }
    });
});



//=================EDIT ROUTE===================
app.get("/profile/:email/edit", function (req, res) {
    User.find({ email: useremail }, function (err, foundUser) {
        if (err) {
            console.log("ERRO USUÁRIO NÃO ENCONTRADO!");
        } else {
            res.render("editprofile", { user: foundUser });
        }

    })
});





//================UPDATE ROUTE===================
app.put("/profile/:email", function (req, res) {
    console.log(req.body.user)
    User.findOneAndUpdate(useremail, req.body.user, function (err, foundUser) {
        if (err) {
            res.redirect("/profile");
        } else {
            res.redirect("/profile/" + useremail);
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


app.put("/profile/:email/friends/:friendsemail/follow", function (req, res) {
    console.log(userid)
    User.updateOne({ _id: userid }, { $addToSet: { friends: [req.params.friendsemail] } }, function (err, user) {
        if (err) {
            console.log(err)
        } else {
            console.log("oi")
            res.redirect("/profile/" + useremail)

            // User.friends.append(req.body.friendsemail)
            // res.render("friends", { user: foundUsers });
        }

    });
});

app.put("/profile/:email/like/:id", function (req, res) {
    console.log("OI");
    console.log(req.body.post);
    Post.updateOne({_id: req.params.id}, { $addToSet: { likes: [useremail] } } ,function (err,foundPost) {
        if (err) {
            console.log(err);
        } else {
            console.log(foundPost);
            console.log("LIKE");
            res.redirect('back');
        }
    });
});

//EDITAR POST

app.get("/profile/:email/post/:id/edit", function (req, res) {
    User.find({ email: useremail }, function (err, user) {
        console.log("============================================")
        console.log(req.params.id)
        if (err) {
            console.log("Erro ao carregar dados do usuário");
        } else {
            // res.render("profile", {user:user});
            console.log(user);

            Post.find({ _id: req.params.id }, function (err, post) {
                if (err) {
                    console.log(err);
                    console.log("Erro ao carregar posts!");
                } else {
                    res.render("postedit", { post: post, user: user });
                }

            });
        }
    });
});

app.put("/profile/:email/post/:id/edit", function (req, res) {
    console.log("OI");
    console.log(req.body.post);
    Post.findByIdAndUpdate(req.params.id, req.body.post, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("LIKE");
            res.redirect("/profile/" + useremail);
            console.log(post)
        }
    });
});


//===============CADASTRAR========================

app.get("/cadastro", function (req, res) {
    res.render("cadastro", {wrongPassword : false, emailExists : false});
});

app.post("/cadastro", function (req, res) {
    
    var regUser = req.body.user
    var password = regUser.password
    var confirmPassword = regUser.confirmPassword

    let errors = [];
    if (password != confirmPassword) {
        errors.push({ msg: 'Senha e senha confirmada estão diferentes' });
    }


    if (regUser.age < 18 || regUser.age > 100){
        errors.push({ msg: 'Idade não aceita' });
    }

    console.log(errors)
    if (errors.length > 0) {
        res.render('cadastro', {
            errors
        });
    } else{


        User.create(req.body.user, function (err, newUser) {
            if (err) {
                console.log(err)
                errors.push({ msg: 'Email já cadastrado' });
                res.render('cadastro', {
                    errors
                });
            } else {
                console.log(newUser);
                res.render("home");
            }
        })
    }
});

//=============== LOGIN =======================
app.get('/login',function(req, res) {
    res.render('/profile'+ useremail);
});


app.post('/login', function(req, res)
{
    User.findOne({email: req.body.email, password: req.body.password}, function(err, user){
        if(err) {
            console.log(err);
        }
        else if(user){
            useremail = req.body.email
            res.redirect('/profile/'+ useremail);
        }
        else {
            res.render('home', {error: true})
        }
    });

});



//================DELETE ROUTE====================
app.delete("/profile/:email", function (req, res) {
    console.log("oi");
    console.log(req.params);
    console.log(req.body.post);

    var id = req.body.post.id;
    console.log("iD:" + id);

    Post.findByIdAndDelete(id, function (err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect(useremail);
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

var userfriends
// 

// AMIGOS
app.get("/profile/:email/friends", function (req, res) {
    User.find({ email: useremail }, function (err, user) {
        if (err) {
            console.log("ERRO USUÁRIO NÃO ENCONTRADO!");
        } else {
            // var friends = user.find()
            console.log(user)

            User.find({ 'email': userFriends }, function (err, friends) {
                if (err) {
                    console.log(err);
                } else {
                    res.render("friends", { friends: friends, user: user });
                }

            })


        }

    })
});

// app.get("/profile/:email/friends/:friendsemail/follow", function (req, res) {
//     User.post({}, function (err, foundUsers) {
//         if (err) {
//             console.log(err)
//         } else {
//             res.send(req.body.friendsemail)
//             // User.friends.append(req.body.friendsemail)
//             // res.render("friends", { user: foundUsers });
//         }

//     })
// });

// app.get("/profile/:email/friends/:friendsemail/follow", function (req, res) {
//     console.log("PROCURANDO")
//     User.find({email:useremail}, function (err, user) {
//         if (err) {
//             console.log("Erro ao carregar dados do usuário");
//         } else {
//             // res.render("profile", {user:user});
//             console.log(user);

//             // User.find({email: req.params.friendsemail }, function (err, post) {
//             //     if (err) {
//             //         console.log(err);
//             //         console.log("Erro ao carregar posts!");
//             //     } else {
//             //         console.log(req.params.friendsemail);
//             //         res.render("postedit", { post: post, user: user });
//             //     }

//             // });
//         }
//     });
// });

app.get("/profile/:email/friends/:friendsemail", function (req, res) {
    User.find({email: req.params.friendsemail}, function (err, foundUser) {
        if (err) {
            console.log(err)
        } else {
            console.log("oi")
            console.log(foundUser) 
            Post.find({'authorEmail': req.params.friendsemail }, function (err, posts) {
                if (err) {
                    console.log("Erro ao carregar posts!");
                } else {
                    // console.log("Usuário encontrado");
                    // console.log(foundUser);
                    res.render("friendsprofile", { posts: posts, user: foundUser });

                }

            });

            }


    });
});




app.get("/profile/:email/friends/:friendsemail/follow", function (req, res) {
    console.log(userid)
    User.findById(userid, function (err, foundUsers) {
        if (err) {
            console.log(err)
        } else {
            console.log("oi")
            console.log(foundUsers)
            res.redirect("/profile/" + useremail)

            // User.friends.append(req.body.friendsemail)
            // res.render("friends", { user: foundUsers });
        }

    });
});

app.put("/profile/:email/friends/:friendsemail/follow", function (req, res) {
    console.log(userid)
    User.updateOne({ _id: userid }, { $addToSet: { friends: [req.params.friendsemail] } }, function (err, user) {
        if (err) {
            console.log(err)
        } else {
            console.log("oi")
            res.redirect("/profile/" + useremail)

            // User.friends.append(req.body.friendsemail)
            // res.render("friends", { user: foundUsers });
        }

    });
});


app.get("/profile/:email/friends/:friendsemail/unfollow", function (req, res) {
    console.log(userid)
    User.findById(userid, function (err, foundUsers) {
        if (err) {
            console.log(err)
        } else {
            console.log("oi")
            console.log(foundUsers)
            res.redirect("/profile/" + useremail)
            // User.friends.append(req.body.friendsemail)
            // res.render("friends", { user: foundUsers });
        }

    });
});

// Favorite.updateOne( {cn: req.params.name}, { $pullAll: {uid: [req.params.deleteUid] } } )
app.put("/profile/:email/friends/:friendsemail/unfollow", function (req, res) {
    console.log(userid)
    User.updateOne({ _id: userid }, { $pullAll: { friends: [req.params.friendsemail] } }, function (err, user) {
        if (err) {
            console.log(err)
        } else {
            console.log("oi")
            res.redirect("/profile/" + useremail)

            // User.friends.append(req.body.friendsemail)
            // res.render("friends", { user: foundUsers });
        }

    });
});

app.get("/profile/:email/pesquisadores", function (req, res) {
    User.find({ email: useremail }, function (err, user) {
        if (err) {
            console.log("USUÁRIO NÃO ENCONTRADO")
        } else {
            User.find({}, function (err, users) {
                if (err) {
                    console.log(err)
                }
                else {
                    res.render("pesquisadores", { users: users, user: user })
                }
            });
        }
    })

});




async function listDatabases(client) {
    databasesList = await client.db().admin().listDatabases();

    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};

app.listen(PORT, function () {
    console.log("Server funcionando na porta 8080");
});