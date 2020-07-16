var bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    express = require("express"),
    app = express(),
    mongoose = require("mongoose"),
    moment = require('moment'),
    seedDB = require("./seeds"),
    multer = require("multer"),
    crypto = require("crypto"),
    path = require("path"),
    GridFsStorage = require("multer-gridfs-storage"),
    Grid = require('gridfs-stream'),
    User = require("./models/user"),
    Member = require("./models/member"),
    Publ = require("./models/publ"),
    Post = require("./models/post");
InitiateMongoServer = require("./config/db");
// seedDB();


// DB
const mongoURI = " mongodb+srv://yudi:henrique@cluster0-6g67m.mongodb.net/rede";

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

// connection
const conn = mongoose.createConnection(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// init gfs
let gfs;
conn.once("open", () => {
    // init stream
    gfs = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: "uploads"
    });
});

app.locals.filepath = "";

// Storage
const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = file.originalname;
                filepath = file.originalname;
                const fileInfo = {
                    filename: filename,
                    metadata: req.body.newPubl,
                    bucketName: "uploads"
                };
                resolve(fileInfo);
            });
        });
    }
});

const upload = multer({
    storage
});

// get / page
app.get("/profile/:email/publicacoes", (req, res) => {
    Publ.aggregate([

        { $addFields: { arrSize: { $size: "$likes" } } },
        { $sort: { arrSize: -1 } }

    ]).exec((err, results) => {
        const data = results[0];
        console.log(data);

        res.render('publicacoes', { email: req.params.email, publs: results })
    })
});

app.get("/profileMember/:email/publicacoes", (req, res) => {

    Publ.aggregate([

        { $addFields: { arrSize: { $size: "$likes" } } },
        { $sort: { arrSize: -1 } }

    ]).exec((err, results) => {
        const data = results[0];
        console.log(data);

        res.render('publicacoesMember', { email: req.params.email, publs: results })
    })
});




app.get("/profile/:email/search/", function (req, res) {

    var searchParams = req.query.query.toUpperCase().split(' ');
    console.log(searchParams)
    User.find({ tags: { $all: searchParams } }, function (e, users) {
        console.log("ACHOU")
        console.log(users)

        Publ.find({ tags: { $all: searchParams } }, function (e, publs) {
            console.log("PUBLS")
            console.log(publs)
            res.render('results', { results: true, search: req.query.query, users: users, publs: publs, email: req.params.email });
        })
    });
});

app.get("/profileMember/:email/search/", function (req, res) {

    var searchParams = req.query.query.toUpperCase().split(' ');
    console.log(searchParams)
    User.find({ tags: { $all: searchParams } }, function (e, users) {
        console.log(users)
        Publ.find({ tags: { $all: searchParams } }, function (e, publs) {
            console.log("PUBLS")
            console.log(publs)
            res.render('resultsMember', { results: true, search: req.query.query, users: users, publs: publs, email: req.params.email });
        })
    });
});









app.post("/profile/:email/uploadArquivo", upload.single("newPubl[file]"), (req, res) => {
    // res.json({file : req.file})
    console.log()
    if (filepath != null) {
        path = filepath
    } else {
        path = ""
    }
    console.log(req.body.newPubl)
    var tag = req.body.newPubl.tags.toUpperCase().split(' ')
    var createPubl = new Publ({
        authorName: req.body.newPubl.authorName,
        authorEmail: req.body.newPubl.authorEmail,
        publText: req.body.newPubl.publText,
        publTitle: req.body.newPubl.publTitle,
        ano: req.body.newPubl.ano,
        local: req.body.newPubl.local,
        url: req.body.newPubl.url,
        arquivo: path,
        tags: tag,
    })
    console.log(createPubl);

    Publ.create(createPubl, function (err, newPubl) {
        if (err) {
            console.log(err);
        } else {

            res.redirect("/profile/" + req.params.email);
            console.log(newPubl);
        }
    });

});

app.delete("/profileMember/:email", function (req, res) {
    console.log("oi");
    console.log(req.params);
    console.log(req.body.post);

    var id = req.body.post.id;
    console.log("iD:" + id);

    Post.findByIdAndDelete(id, function (err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/profileMember/' + req.params.email);
        }
    });

});

app.get("/profile/:email/publ/:id/edit", (req, res) => {
    Publ.find({ _id: req.params.id }, function (err, publ) {
        if (err) {
            console.log(err);
        } else {
            console.log(publ)
            res.render("publedit", { publ: publ, email: req.params.email });
        }
    });
});


app.put("/profile/:email/publ/:id/like", (req, res) => {
    Publ.updateOne({ _id: req.params.id }, { $addToSet: { likes: [req.params.email] } }, function (err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect(req.get('referer'));
        }
    });
});



app.put("/profileMember/:email/publ/:id/like", (req, res) => {
    Publ.updateOne({ _id: req.params.id }, { $addToSet: { likes: [req.params.email] } }, function (err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect(req.get('referer'));
        }
    });
});

app.put("/profile/:email/publ/:id/dislike", function (req, res) {
    console.log("OI");
    Publ.updateOne({ _id: req.params.id }, { $pullAll: { likes: [req.params.email] } }, function (err, foundPubl) {
        if (err) {
            console.log(err);
        } else {
            console.log(foundPubl);
            console.log("Dislike");
            res.redirect('back');
        }
    });
});

app.put("/profileMember/:email/publ/:id/dislike", function (req, res) {
    console.log("OI");
    Publ.updateOne({ _id: req.params.id }, { $pullAll: { likes: [req.params.email] } }, function (err, foundPubl) {
        if (err) {
            console.log(err);
        } else {
            console.log(foundPubl);
            console.log("Dislike");
            res.redirect('back');
        }
    });
});

app.put("/profile/:email/publ/:id/edit", (req, res) => {
    console.log("PUTTTTTTTTTTTTTTTTTTTTTTT")

    var tag = req.body.newPubl.tags.toUpperCase().split(' ')

    req.body.newPubl.tags = tag
    console.log(req.body.newPubl)
    Publ.findByIdAndUpdate(req.params.id, req.body.newPubl, function (err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/profile/' + req.params.email)
        }
    });
});

app.delete("/profile/:email/publ/:id/del", (req, res) => {
    Publ.findByIdAndRemove(req.body.publ.id, function (err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/profile/' + req.params.email)
        }
    });
});

app.get("/files", (req, res) => {
    gfs.find().toArray((err, files) => {
        // check if files
        if (!files || files.length === 0) {
            return res.status(404).json({
                err: "no files exist"
            });
        }

        return res.json(files);
    });
});

app.get("/files/:filename", (req, res) => {
    gfs.find(
        {
            filename: req.params.filename
        },
        (err, file) => {
            if (!file) {
                return res.status(404).json({
                    err: "no files exist"
                });
            }
            console.log("DOWNLOAD")
            gfs.openDownloadStreamByName(req.params.filename).pipe(res);
            return res.json(file);
        }
    );
});

app.get("/image/:filename", (req, res) => {
    // console.log('id', req.params.id)
    const file = gfs
        .find({
            filename: req.params.filename
        })
        .toArray((err, files) => {
            if (!files || files.length === 0) {
                return res.status(404).json({
                    err: "no files exist"
                });
            }
            gfs.openDownloadStreamByName(req.params.filename).pipe(res);
        });
});

// files/del/:id
// Delete chunks from the db
app.post("/files/del/:id", (req, res) => {
    gfs.delete(new mongoose.Types.ObjectId(req.params.id), (err, data) => {
        if (err) return res.status(404).json({ err: err.message });
        res.redirect("/profile/" + useremail);
    });
});





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

            Post.find({ 'authorEmail': user.email }, function (err, posts) {
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
    var count = 0;


    User.find({ email: req.params.email }, function (err, foundUser) {
        if (err) {
            console.log(err);
            console.log("Usuário não encontrado");
        } else {
            console.log(foundUser.email)
            Post.find({ 'authorEmail': req.params.email }, function (err, posts) {
                if (err) {
                    console.log("Erro ao carregar posts!");
                } else {
                    Publ.find({ 'authorEmail': req.params.email }, function (err, publs) {
                        if (err) {
                            console.log("erro ao carregar publs")
                        } else {
                            User.find({ friends: { $all: req.params.email } }, function (e, users) {
                                Member.find({ friends: { $all: req.params.email } }, function (err, count) {
                                    console.log(users.length + count.length)
                                    res.render("profile", { posts: posts, user: foundUser, publs: publs, email: req.params.email, followers: users.length + count.length });
                                });
                            });

                        }
                    });
                    // console.log("Usuário encontrado");
                    // console.log(foundUser);


                }

            });
        }
    })
});

app.get("/profileMember/:email", function (req, res) {
    useremail = req.params.email;
    Member.find({ email: req.params.email }, function (err, foundUser) {
        if (err) {
            console.log(err);
            console.log("Usuário não encontrado");
        } else {
            console.log(foundUser.email)
            Post.find({ 'authorEmail': req.params.email }, function (err, posts) {
                if (err) {
                    console.log("Erro ao carregar posts!");
                } else {
                    // console.log("Usuário encontrado");
                    // console.log(foundUser);
                    User.find({ friends: { $all: req.params.friendsemail } }, function (e, users) {
                        console.log(users.length)
                        res.render("profileMember", { posts: posts, user: foundUser, email: req.params.email, followers: users.length });
                    });

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
            res.redirect(req.params.email);
            console.log(newPost);
        }
    });
});


app.post("/profileMember/:email", function (req, res) {

    Post.create(req.body.newpost, function (err, newPost) {
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

app.get("/profileMember/:email/edit", function (req, res) {
    Member.find({ email: req.params.email }, function (err, foundUser) {
        if (err) {
            console.log("ERRO USUÁRIO NÃO ENCONTRADO!");
        } else {
            res.render("editprofileMember", { user: foundUser });
        }

    })
});





//================UPDATE ROUTE===================
app.put("/profile/:email/edit", function (req, res) {

    console.log(req.body.user)
    User.findOneAndUpdate({ email: req.params.email }, req.body.user, function (err, foundUser) {
        if (err) {
            res.redirect("/profile");
        } else {
            console.log(foundUser)
            console.log(useremail)
            User.findOneAndUpdate({ email: req.params.email }, {
                tags: (req.body.user.name + (' ') + req.body.user.city + (' ') + req.body.user.state + (' ') +
                    req.body.user.university + (' ') + req.body.user.course + (' ') + req.body.user.instPesquisa).toUpperCase().split(' ')
            }, function (err, foundUser) {
                if (err) {
                    console.log(err)
                } else {
                    res.redirect("/profile/" + req.params.email);
                }
            })

        }

    });
});

app.put("/profileMember/:email/edit", function (req, res) {
    console.log(req.body.user)
    Member.findOneAndUpdate({ email: req.params.email }, req.body.user, function (err, foundUser) {
        if (err) {
            res.redirect("/profileMember");
        } else {
            console.log(foundUser)
            console.log(useremail)
            res.redirect("/profileMember/" + req.params.email);
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

app.get("/profileMember/:email/like/:id", function (req, res) {
    Member.find({}, function (err, user) {
        if (err) {
            console.log("Erro ao carregar dados do usuário");
        } else {
            // res.render("profile", {user:user});
            console.log(user);

            Post.find({}, function (err, posts) {
                if (err) {
                    console.log("Erro ao carregar posts!");
                } else {
                    res.render("profile", { posts: posts, user: user, email: req.params.email });
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
            res.redirect("/profile/" + req.params.email)

            // User.friends.append(req.body.friendsemail)
            // res.render("friends", { user: foundUsers });
        }

    });
});

app.put("/profile/:email/like/:id", function (req, res) {
    console.log("OI");
    console.log(req.body.post);
    Post.updateOne({ _id: req.params.id }, { $addToSet: { likes: [req.params.email] } }, function (err, foundPost) {
        if (err) {
            console.log(err);
        } else {
            console.log(foundPost);
            console.log("LIKE");
            res.redirect('back');
        }
    });
});

app.put("/profileMember/:email/like/:id", function (req, res) {
    console.log("OI");
    console.log(req.body.post);
    Post.updateOne({ _id: req.params.id }, { $addToSet: { likes: [req.params.email] } }, function (err, foundPost) {
        if (err) {
            console.log(err);
        } else {
            console.log(foundPost);
            console.log("LIKE");
            res.redirect('back');
        }
    });
});

app.put("/profile/:email/dislike/:id", function (req, res) {
    console.log("OI");
    console.log(req.body.post);
    Post.updateOne({ _id: req.params.id }, { $pullAll: { likes: [req.params.email] } }, function (err, foundPost) {
        if (err) {
            console.log(err);
        } else {
            console.log(foundPost);
            console.log("Dislike");
            res.redirect('back');
        }
    });
});

app.put("/profileMember/:email/dislike/:id", function (req, res) {
    console.log("OI");
    console.log(req.body.post);
    Post.updateOne({ _id: req.params.id }, { $pullAll: { likes: [req.params.email] } }, function (err, foundPost) {
        if (err) {
            console.log(err);
        } else {
            console.log(foundPost);
            console.log("Dislike");
            res.redirect('back');
        }
    });
});

//EDITAR POST

app.get("/profile/:email/post/:id/edit", function (req, res) {
    User.find({ email: req.params.email }, function (err, user) {
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

app.get("/profileMember/:email/post/:id/edit", function (req, res) {
    Member.find({ email: req.params.email }, function (err, user) {
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
                    res.render("posteditMember", { post: post, user: user });
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
            res.redirect("/profile/" + req.params.email);
            console.log(post)
        }
    });
});

app.put("/profileMember/:email/post/:id/edit", function (req, res) {

    console.log(req.body.post);
    Post.findByIdAndUpdate(req.params.id, req.body.post, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("LIKE");
            res.redirect("/profileMember/" + req.params.email);
        }
    });
});


//===============CADASTRAR========================

app.get("/cadastro", function (req, res) {
    res.render("cadastro", { wrongPassword: false, emailExists: false });
});
app.locals.regUser;

app.post("/cadastro", function (req, res) {

    var regUser = req.body.user
    app.locals.regUser = req.body.user
    var password = regUser.password
    var confirmPassword = regUser.confirmPassword

    let errors = [];
    if (password != confirmPassword) {
        errors.push({ msg: 'Senha e senha confirmada estão diferentes' });
    }


    if (regUser.age < 18 || regUser.age > 100) {
        errors.push({ msg: 'Idade não aceita' });
    }




    console.log(errors)
    if (errors.length > 0) {
        res.render('cadastro', {
            errors
        });
    } else {
        var regUserTags = new User({
            name: req.body.user.name,
            email: req.body.user.email,
            password: req.body.user.password,
            age: req.body.user.age,
            city: req.body.user.city,
            state: req.body.user.state,
            course: req.body.user.course,
            university: req.body.user.university,
            inicDados: req.body.user.inicDados,
            instPesquisa: req.body.user.instPesquisa,
            formacao: req.body.user.formacao,
            curriculum: req.body.user.curriculum,
            tags: (req.body.user.name + (' ') + req.body.user.city + (' ') + req.body.user.state + (' ') +
                req.body.user.university + (' ') + req.body.user.course + (' ') + req.body.user.instPesquisa).toUpperCase().split(' ')
        });

        User.create(regUserTags, function (err, newUser) {
            if (err) {
                console.log(err)
                errors.push({ msg: 'Email já cadastrado' });
                res.render('cadastro', {
                    errors
                });
            } else {

                res.render('personalInterest', { email: req.body.user.email });


            }
        })
        // User.updateOne({name: req.body.user}, { $addToSet: { tags: [req.body.user.name.split(' ')] } } ,function (err,foundPubl) {
        //     if (err) {
        //         console.log(err);
        //     } else {
        //         console.log(newUser);
        //         res.render("home");
        //     }
        // });
    }
});

// app.get("/cadastro/:email/personalInterest", function (req, res) {
//     User.find({ email: req.params.email }, function (err, foundUser) {
//         if (err) {
//             console.log("ERRO USUÁRIO NÃO ENCONTRADO!");
//         } else {
//             res.render("editprofile", { user: foundUser });
//         }

//     })
// });

app.get("/profile/:email/personalInterest/edit", function (req, res) {
    console.log(req.body.personalInterest)
    User.update({ email: req.params.email }, { $set: { personalInterest: [] } }, function (err, affected) {
        console.log('affected: ', affected);
    });
    res.render('personalInterestedit', { email: req.params.email })
});

app.get("/profileMember/:email/personalInterestMember/edit", function (req, res) {
    console.log(req.body.personalInterest)
    Member.update({ email: req.params.email }, { $set: { personalInterest: [] } }, function (err, affected) {
        console.log('affected: ', affected);
    });
    res.render('personalInterestMemberedit', { email: req.params.email })
});

app.put("/profile/:email/personalInterest/edit", function (req, res) {
    console.log(req.body.personalInterest)

    User.updateOne({ email: req.params.email }, { $addToSet: { personalInterest: req.body.personalInterest } }, function (err, foundUser) {
        if (err) {
            console.log("ERRO USUÁRIO NÃO ENCONTRADO!");
        } else {
            res.redirect("/profile/" + req.params.email);
        }

    })
});

app.put("/profileMember/:email/personalInterestMember/edit", function (req, res) {
    console.log(req.body.personalInterest)
    Member.updateOne({ email: req.params.email }, { $addToSet: { personalInterest: req.body.personalInterest } }, function (err, foundUser) {
        if (err) {
            console.log("ERRO USUÁRIO NÃO ENCONTRADO!");
        } else {
            res.redirect("/profileMember/" + req.params.email);
        }

    })
});

app.put("/cadastro/:email/personalInterest", function (req, res) {
    console.log(req.body.personalInterest)
    User.updateOne({ email: req.params.email }, { $addToSet: { personalInterest: req.body.personalInterest } }, function (err, foundUser) {
        if (err) {
            console.log("ERRO USUÁRIO NÃO ENCONTRADO!");
        } else {
            res.render("home");
            res.redirect("/");
        }

    })
});

app.put("/cadastro/:email/personalInterestMember", function (req, res) {
    console.log(req.body.personalInterest)
    Member.updateOne({ email: req.params.email }, { $addToSet: { personalInterest: req.body.personalInterest } }, function (err, foundUser) {
        if (err) {
            console.log("ERRO USUÁRIO NÃO ENCONTRADO!");
        } else {
            console.log('home')
            res.redirect("/");
        }

    })
});


app.get("/addTags/:email", function (req, res) {
    res.render("home")
});

app.put("/addTags/:email", function (req, res) {
    var names = regUser.name;
    console.log("NAMES")
    console.log(names)
    var tag = names.toUpperCase().split(' ');
    console.log("TAGS")
    console.log(tag)

    User.findByIdAndUpdate({ email: req.params.email }, { $addToSet: { tags: [tag] } }, function (err) {
        if (err) {
            console.log(err);
        } else {
            res.render("home")
        }
    });
});



app.get("/cadastroMember", function (req, res) {
    res.render("cadastroMember", { wrongPassword: false, emailExists: false });
});

app.post("/cadastroMember", function (req, res) {
    console.log(req.body.member)
    var regMember = req.body.member
    var password = regMember.password
    var confirmPassword = regMember.confirmPassword

    let errors = [];
    if (password != confirmPassword) {
        errors.push({ msg: 'Senha e senha confirmada estão diferentes' });
    }


    if (regMember.age < 18 || regMember.age > 100) {
        errors.push({ msg: 'Idade não aceita' });
    }

    console.log(errors)
    if (errors.length > 0) {
        res.render('cadastroMember', {
            errors
        });
    } else {


        Member.create(req.body.member, function (err, newMember) {
            if (err) {
                console.log(err)
                errors.push({ msg: 'Email já cadastrado' });
                res.render('cadastroMember', {
                    errors
                });
            } else {
                console.log(newMember);
                res.render('personalInterestMember', { email: req.body.member.email });
            }
        })
    }
});

//=============== LOGIN =======================
app.get('/login', function (req, res) {
    res.render('/profile' + useremail);
});


app.post('/login', function (req, res) {

    User.findOne({ email: req.body.email, password: req.body.password }, function (err, user) {
        if (err) {
            console.log(err);

        }
        else if (user) {
            useremail = req.body.email
            res.redirect('/profile/' + useremail);
        }
        else {
            Member.findOne({ email: req.body.email, password: req.body.password }, function (err, member) {
                if (err) {
                    console.log(err);
                }
                else if (member) {
                    useremail = req.body.email
                    res.redirect('/profileMember/' + useremail)
                } else {
                    res.render('home', { error: true })
                }
            })
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
            res.redirect(req.params.email);
        }
    });

});

app.delete("/profileMember/:email", function (req, res) {
    console.log("oi");
    console.log(req.params);
    console.log(req.body.post);

    var id = req.body.post.id;
    console.log("iD:" + id);

    Post.findByIdAndDelete(id, function (err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/profileMember/' + req.params.email);
        }
    });

});

var userfriends
// 

// AMIGOS
app.get("/profile/:email/friends", function (req, res) {
    User.find({ email: req.params.email }, function (err, user) {
        if (err) {
            console.log("ERRO USUÁRIO NÃO ENCONTRADO!");
        } else {
            // var friends = user.find()
            console.log(user)

            User.find({ 'email': userFriends }, function (err, friends) {
                if (err) {
                    console.log(err);
                } else {
                    res.render("friends", { friends: friends, user: user, email: req.params.email });
                }

            })


        }

    })
});

app.get("/profileMember/:email/friends", function (req, res) {
    Member.find({ email: req.params.email }, function (err, user) {
        if (err) {
            console.log("ERRO USUÁRIO NÃO ENCONTRADO!");
        } else {
            // var friends = user.find()
            console.log(user)

            User.find({ 'email': userFriends }, function (err, friends) {
                if (err) {
                    console.log(err);
                } else {
                    res.render("friendsMember", { friends: friends, user: user, email: req.params.email });
                }

            })


        }

    })
});




app.get("/profile/:email/friends/:friendsemail", function (req, res) {
    User.find({ email: req.params.friendsemail }, function (err, foundUser) {
        if (err) {
            console.log(err)
        } else {
            console.log("oi")
            console.log(foundUser)
            Post.find({ 'authorEmail': req.params.friendsemail }, function (err, posts) {
                if (err) {
                    console.log("Erro ao carregar posts!");
                } else {
                    // console.log("Usuário encontrado");
                    // console.log(foundUser);
                    Publ.find({ 'authorEmail': req.params.friendsemail }, function (err, publs) {
                        if (err) {
                            console.log("erro ao carregar publs")
                        } else {
                            User.find({ friends: { $all: req.params.friendsemail } }, function (e, users) {
                                Member.find({ friends: { $all: req.params.friendsemail }},function(err,count) {
                                console.log(users.length+count.length)
                                res.render("friendsprofile", { posts: posts, user: foundUser, publs: publs, email: req.params.email, followers: users.length+count.length });
                            });
                            });
                        }
                    });

                }

            });

        }


    });
});

app.get("/profileMember/:email/friends/:friendsemail", function (req, res) {
    User.find({ email: req.params.friendsemail }, function (err, foundUser) {
        if (err) {
            console.log(err)
        } else {
            console.log("oi")
            console.log(foundUser)
            Post.find({ 'authorEmail': req.params.friendsemail }, function (err, posts) {
                if (err) {
                    console.log("Erro ao carregar posts!");
                } else {
                    // console.log("Usuário encontrado");
                    // console.log(foundUser);
                    Publ.find({ 'authorEmail': req.params.friendsemail }, function (err, publs) {
                        if (err) {
                            console.log("erro ao carregar publs")
                        } else {
                            User.find({ friends: { $all: req.params.friendsemail } }, function (e, users) {
                                console.log(users.length)
                                res.render("friendsprofile", { posts: posts, user: foundUser, publs: publs, email: req.params.email, followers: users.length });
                            });
                        }
                    });

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
            res.redirect("/profile/" + req.params.email + "/friends")

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
            res.redirect("/profile/" + req.params.email + "/friends")

            // User.friends.append(req.body.friendsemail)
            // res.render("friends", { user: foundUsers });
        }

    });
});


app.get("/profileMember/:email/friends/:friendsemail/follow", function (req, res) {
    console.log(userid)
    Member.findById(userid, function (err, foundUsers) {
        if (err) {
            console.log(err)
        } else {
            console.log("oi")
            console.log(foundUsers)
            res.redirect("/profileMember/" + req.params.email + "/friends")

            // User.friends.append(req.body.friendsemail)
            // res.render("friends", { user: foundUsers });
        }

    });
});

app.put("/profileMember/:email/friends/:friendsemail/follow", function (req, res) {
    console.log(userid)
    Member.updateOne({ _id: userid }, { $addToSet: { friends: [req.params.friendsemail] } }, function (err, user) {
        if (err) {
            console.log(err)
        } else {
            console.log("oi")
            res.redirect("/profileMember/" + req.params.email + "/friends")

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
            res.redirect("/profile/" + req.params.email)
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
            res.redirect("/profile/" + req.params.email)

            // User.friends.append(req.body.friendsemail)
            // res.render("friends", { user: foundUsers });
        }

    });
});

app.get("/profileMember/:email/friends/:friendsemail/unfollow", function (req, res) {
    console.log(userid)
    Member.findById(userid, function (err, foundUsers) {
        if (err) {
            console.log(err)
        } else {
            console.log("oi")
            console.log(foundUsers)
            res.redirect("/profileMember/" + req.params.email)
            // User.friends.append(req.body.friendsemail)
            // res.render("friends", { user: foundUsers });
        }

    });
});

// Favorite.updateOne( {cn: req.params.name}, { $pullAll: {uid: [req.params.deleteUid] } } )
app.put("/profileMember/:email/friends/:friendsemail/unfollow", function (req, res) {
    console.log(userid)
    Member.updateOne({ _id: userid }, { $pullAll: { friends: [req.params.friendsemail] } }, function (err, user) {
        if (err) {
            console.log(err)
        } else {
            console.log("oi")
            res.redirect("/profileMember/" + req.params.email)

            // User.friends.append(req.body.friendsemail)
            // res.render("friends", { user: foundUsers });
        }

    });
});

app.get("/profile/:email/pesquisadores", function (req, res) {
    User.find({ email: req.params.email }, function (err, user) {
        if (err) {
            console.log("USUÁRIO NÃO ENCONTRADO")
        } else {
            User.find({}, function (err, users) {
                if (err) {
                    console.log(err)
                }
                else {
                    res.render("pesquisadores", { users: users, user: user, email: req.params.email })
                }
            });
        }
    })

});

app.get("/profileMember/:email/pesquisadores", function (req, res) {
    Member.find({ email: req.params.email }, function (err, user) {
        if (err) {
            console.log("USUÁRIO NÃO ENCONTRADO")
        } else {
            User.find({}, function (err, users) {
                if (err) {
                    console.log(err)
                }
                else {
                    res.render("pesquisadoresMember", { users: users, user: user, email: req.params.email })
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