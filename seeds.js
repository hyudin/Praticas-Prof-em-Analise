var mongoose = require("mongoose");
var Post = require("./models/post");

var data = [
    {
        authorName: "Henrique Yudi",
        authorEmail: "yudi.nishimotobr@gmail.com",
        postText: "Olá esse é o meu primeiro post!",
        likes: 50,
        created: "2020-06-05T03:47:16.798+00:00"
    },
    {
        authorName: "Lucas Kenji Uezima",
        authorEmail: "lucasDasEnzimas@gmail.com",
        postText: "Olá sou o LK!",
        likes: 300,
        created: "2020-06-04T10:47:16.798+00:00"
    },
    {
        authorName: "Fernando",
        authorEmail: "fernandodalarica@gmail.com",
        postText: "Olá sou o Fernando!",
        likes: 200,
        created: "2020-06-06T04:47:16.798+00:00"
    },
    {
        authorName: "Loren",
        authorEmail: "lorenLoreal@gmail.com",
        postText: "Olá sou a Lorean!",
        likes: 230,
        created: "2020-06-03T14:47:16.798+00:00"
    }
]



function seedDB() {
    //remove Posts
    // Post.remove({}, function (err) {
    //     if (err) {
    //         console.log(err);
    //     }
    //     console.log("Posts Removidos!");
    // });
    data.forEach(function (seed) {
        Post.create(seed, function (err, data) {
            if (err) {
                console.log(err)
            } else {
                console.log("Posts adicionados");
            }
        });
    });
}

module.exports = seedDB;