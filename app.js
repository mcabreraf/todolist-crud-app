//This is a very easy project for looking up the implementation of MongoDB Driver for NodeJS along with express. Clearly, this project is using the MEN model. Other libraries are used too, check package.json to see which are those libraries.

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const db = require("./db");
const collection = "todo";
const Joi = require("@hapi/joi");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine","ejs");

//Home Page
app.get("/", (req, res) => {
    res.render("index");
});

// @hapi/joi schema for sintax validation
const schema = Joi.object({
    todo : Joi.string().required()
});

//Read information from database
app.get("/getTodos", (req,res) => {
    db.getDB().collection(collection).find({}).toArray((err,documents) => {
        if(err){
            console.log(err);
        }else{
            res.json(documents);
        }
    });
});

//Create information for the database
app.post("/todos",(req,res,next) => {
    const userInput = req.body;
    const { error } = schema.validate(userInput);
    if(error){
        const error = new Error("Invalid Input");
        error.status = 400;
        return next(error);
    }else{
        db.getDB().collection(collection).insertOne(userInput,(err,result) => {
            if(err){
                const error = new Error("Failed to add a todo");
                error.status = 400;
                return next(error);  
            }else{
                res.json({result : result, document : result.ops[0], msg : "Successfully inserted todo!", error : null});
            }   
        }); 
    }
});

//Update information from database
app.put("/:id", (req, res, next) => {
    const todoID = req.params.id;
    const userInput = req.body;
    const { error } = schema.validate(userInput);
    if(error){
        const error = new Error("Invalid Input");
        error.status = 400;
        return next(error);
    }else{
        db.getDB().collection(collection).findOneAndUpdate({_id : db.getPrimaryKey(todoID)},{$set : {todo : userInput.todo, msg : "Successfully inserted todo!", error : null}},{returnOriginal : false}, (err, result) => {
            if(err){
                const error = new Error("Failed to add a todo");
                error.status = 400;
                return next(error);
            }else{
                res.json(result)
            }
        });
    }
});

//Delete information from database
app.delete("/:id",(req, res) => {
    const todoID = req.params.id;
    db.getDB().collection(collection).findOneAndDelete({_id : db.getPrimaryKey(todoID)}, (err, result) => {
        if(err){
            console.log(err);
        }else{
            res.json(result);
        }
    });
});

//Express middleware for handling errors
app.use((err, req, res, next) => {
    res.status(err.status).json({
        error : {
            message : err.message
        }
    });
});

//Database listen
db.connect((err) => {
    if(err){
        console.log("unable to connect to database");
        process.exit(1);
    }else{
        app.listen(3000, ()=>{
            console.log("connected to database, app listening on port 3000");
        });
    }
});