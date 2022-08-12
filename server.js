const path = require('path')
const fs = require('fs')
const { request } = require('express');
const express = require('express');
const { ObjectId } = require('mongodb');
const cors = require("cors")
const app = express();

app.use(express.json());
app.use(cors())
// app.use((req, res, next) => {

//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.header("Access-Control-Allow-Headers", "*");
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header('Access-Control-Allow-Methods', '*');
//     next();
// })
app.use((req, res, next) => {
    console.log(req.url);
    next()
})
const MongoClient = require('mongodb').MongoClient;

let db;
MongoClient.connect("mongodb+srv://codehulk:Victor614@cluster0.d8zce.mongodb.net/?retryWrites=true&w=majority"
    , (err, client) => {
        db = client.db('cw2');
        console.log("database connected");
    })

app.get('/', (req, res, next) => {
    res.send("welcome to backend");
})

app.param('collectionName', (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName)
    return next()
})

app.get('/collection/:collectionName', (req, res, next) => {
    req.collection.find({}).toArray((e, results) => {
        if (e) return next(e)
        res.send(results)
    })
})

app.post('/collection/:collectionName', (req, res, next) => {
    req.collection.insertOne(req.body, (e, results) => {
        if (e) return next(e)
        let response = { "message": "success" }
        res.send(response);
    })
})


//update an object 

app.put('/collection/:collectionName/:id', (req, res, next) => {
    let id = new ObjectId(req.params.id)
    req.collection.update(
        { _id: id },
        { $set: req.body },
        { safe: true, multi: false },
        (e, result) => {
            if (e) return next(e)
            res.send(result.modifiedCount === 1 ? { msg: 'success' } : { msg: 'error' })
        })
    console.log(req.body)
})

// search
app.get('/collection/:collectionName/search', (req, res, next) => {
    let query_str = req.query.key_word
    req.collection.find({}).toArray((e, results) => {
        if (e) return next(e)
        let newList = results.filter((lesson) => {
            return lesson.subject.toLowerCase().match(query_str) || lesson.location.toLowerCase().match(query_str)
        });
        res.send(newList)
    })
})

app.use(function(req, res, next){
    var filePath = path.join(__dirname, "static", req.url)
    fs.stat(filePath, function(err, fileInfo){
        if (err) {
            next()
            return
        }
        if (fileInfo.isFile()) {
            res.sendFile(filePath)
        }
        else{
            next()
        }
    })
})

app.use(function(req, res){
    res.status(404)
    res.send("file not found")
})

app.listen(process.env.PORT || 3000,()=> {
    console.log("app running");
})