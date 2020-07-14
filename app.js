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
    if(!gfs) {
      console.log("some error occured, check connection to db");
      res.send("some error occured, check connection to db");
      process.exit(0);
    }
    gfs.find().toArray((err, files) => {
      // check if files
      if (!files || files.length === 0) {
        return res.render("publicacoes", {
          files: false
        });
      } else {
        const f = files
          .map(file => {
            if (
              file.contentType === "image/png" ||
              file.contentType === "image/jpeg"
            ) {
              file.isImage = true;
            } else {
              file.isImage = false;
            }
            console.log("EH UM ARQUIVO")
            return file;
          })
          .sort((a, b) => {
            return (
              new Date(b["uploadDate"]).getTime() -
              new Date(a["uploadDate"]).getTime()
            );
          });
        

            User.find({email: userFriends}, function (err, foundUser) {
                if (err) {
                    console.log(err)
                } else {
                    Publ.find({'authorEmail': userFriends }, function (err, publ) {
                        if (err) {
                            console.log("Erro ao carregar posts!");
                        } else {
                            // console.log("Usuário encontrado");
                            console.log(publ);
                            res.render("publicacoes", { files: f, user: foundUser });
        
                        }
        
                    });
        
                    }
        
        
            });
        





        // return res.render("publicacoes", {
        //   files: f,
        //   user: users
        // });
      }
  
      // return res.json(files);
    });
  });

  app.get("/profileMember/:email/publicacoes", (req, res) => {
    if(!gfs) {
      console.log("some error occured, check connection to db");
      res.send("some error occured, check connection to db");
      process.exit(0);
    }
    gfs.find().toArray((err, files) => {
      // check if files
      if (!files || files.length === 0) {
        return res.render("publicacoesMember", {
          files: false
        });
      } else {
        const f = files
          .map(file => {
            if (
              file.contentType === "image/png" ||
              file.contentType === "image/jpeg"
            ) {
              file.isImage = true;
            } else {
              file.isImage = false;
            }
            console.log("EH UM ARQUIVO")
            return file;
          })
          .sort((a, b) => {
            return (
              new Date(b["uploadDate"]).getTime() -
              new Date(a["uploadDate"]).getTime()
            );
          });
        

            User.find({email: userFriends}, function (err, foundUser) {
                if (err) {
                    console.log(err)
                } else {
                    Publ.find({'authorEmail': userFriends }, function (err, publ) {
                        if (err) {
                            console.log("Erro ao carregar posts!");
                        } else {
                            // console.log("Usuário encontrado");
                            console.log(publ);
                            res.render("publicacoesMember", { files: f, user: foundUser });
        
                        }
        
                    });
        
                    }
        
        
            });
        





        // return res.render("publicacoes", {
        //   files: f,
        //   user: users
        // });
      }
  
      // return res.json(files);
    });
  });


  
  
  app.get("/profile/:email/like/publ/:id", function (req, res) {
    console.log("OIIIIIII!!!!!!!!")
    User.find({}, function (err, user) {
        if (err) {
            console.log("Erro ao carregar dados do usuário");
        } else {
            // res.render("profile", {user:user});
            console.log(user);
            console.log("OIIIIIIIIIIIIIIIIIIIIII")

            Publ.find({}, function (err, publ) {
                if (err) {
                    console.log("Erro ao carregar posts!");
                } else {
                    res.render("publicacoes", { publ: publ, user: user });
                }

            });
        }
    });
});

  app.put("/profile/:email/like/publ/:id", function (req, res) {
    console.log("OI");
    console.log(req.body.publ);
    Publ.updateOne({_id: req.params.id}, { $addToSet: { likes: [useremail] } } ,function (err,foundPubl) {
        if (err) {
            console.log(err);
        } else {
            console.log(foundPubl);
            console.log("LIKE");
            res.redirect('back');
        }
    });
});
app.get("/profileMember/:email/like/publ/:id", function (req, res) {
    console.log("OIIIIIII!!!!!!!!")
    Member.find({}, function (err, user) {
        if (err) {
            console.log("Erro ao carregar dados do usuário");
        } else {
            // res.render("profile", {user:user});
            console.log(user);
            console.log("OIIIIIIIIIIIIIIIIIIIIII")

            Publ.find({}, function (err, publ) {
                if (err) {
                    console.log("Erro ao carregar posts!");
                } else {
                    res.render("publicacoes", { publ: publ, user: user });
                }

            });
        }
    });
});

  app.put("/profileMember/:email/like/publ/:id", function (req, res) {
    console.log("OI");
    console.log(req.body.publ);
    Publ.updateOne({_id: req.params.id}, { $addToSet: { likes: [useremail] } } ,function (err,foundPubl) {
        if (err) {
            console.log(err);
        } else {
            console.log(foundPubl);
            console.log("LIKE");
            res.redirect('back');
        }
    });
});
  
  app.post("/profile/:email/uploadArquivo", upload.single("newPubl[file]"), (req, res) => {
    // res.json({file : req.file})
    Publ.create(req.body.newPubl ,function (err, newPubl) {
        if (err) {
            console.log(err);
        } else {

            res.redirect("/profile/"+useremail);
            console.log(newPubl);
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
      res.redirect("/profile/"+useremail);
    });
  });


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

app.get("/profileMember/:email", function (req, res) {
    useremail = req.params.email;
    Member.find({ email: req.params.email }, function (err, foundUser) {
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
                    res.render("profileMember", { posts: posts, user: foundUser });

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


app.post("/profileMember/:email", function (req, res) {

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
            res.redirect("/profile/" + useremail);
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
            res.redirect("/profileMember/" + useremail);
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

app.put("/profileMember/:email/like/:id", function (req, res) {
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

app.get("/profileMember/:email/post/:id/edit", function (req, res) {
    Member.find({ email: useremail }, function (err, user) {
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

app.put("/profileMember/:email/post/:id/edit", function (req, res) {
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

app.get("/cadastroMember", function (req, res) {
    res.render("cadastroMember", {wrongPassword : false, emailExists : false});
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


    if (regMember.age < 18 || regMember.age > 100){
        errors.push({ msg: 'Idade não aceita' });
    }

    console.log(errors)
    if (errors.length > 0) {
        res.render('cadastroMember', {
            errors
        });
    } else{


        Member.create(req.body.member, function (err, newMember) {
            if (err) {
                console.log(err)
                errors.push({ msg: 'Email já cadastrado' });
                res.render('cadastroMember', {
                    errors
                });
            } else {
                console.log(newMember);
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
            Member.findOne({email: req.body.email, password: req.body.password}, function(err, member){
                if(err) {
                    console.log(err);
                }
            else if (member){
                useremail = req.body.email
                res.redirect('/profileMember/'+useremail)
            } else {
                res.render('home', {error: true})
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
            res.redirect(useremail);
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
            res.redirect('/profileMember/'+ useremail);
        }
    });

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

app.get("/profileMember/:email/friends", function (req, res) {
    Member.find({ email: useremail }, function (err, user) {
        if (err) {
            console.log("ERRO USUÁRIO NÃO ENCONTRADO!");
        } else {
            // var friends = user.find()
            console.log(user)

            User.find({ 'email': userFriends }, function (err, friends) {
                if (err) {
                    console.log(err);
                } else {
                    res.render("friendsMember", { friends: friends, user: user });
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


app.get("/profileMember/:email/friends/:friendsemail/follow", function (req, res) {
    console.log(userid)
    Member.findById(userid, function (err, foundUsers) {
        if (err) {
            console.log(err)
        } else {
            console.log("oi")
            console.log(foundUsers)
            res.redirect("/profileMember/" + useremail)

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
            res.redirect("/profileMember/" + useremail)

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

app.get("/profileMember/:email/friends/:friendsemail/unfollow", function (req, res) {
    console.log(userid)
    Member.findById(userid, function (err, foundUsers) {
        if (err) {
            console.log(err)
        } else {
            console.log("oi")
            console.log(foundUsers)
            res.redirect("/profileMember/" + useremail)
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
            res.redirect("/profileMember/" + useremail)

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

app.get("/profileMember/:email/pesquisadores", function (req, res) {
    Member.find({ email: useremail }, function (err, user) {
        if (err) {
            console.log("USUÁRIO NÃO ENCONTRADO")
        } else {
            User.find({}, function (err, users) {
                if (err) {
                    console.log(err)
                }
                else {
                    res.render("pesquisadoresMember", { users: users, user: user })
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