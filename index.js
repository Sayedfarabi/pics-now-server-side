const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require("express");
const cors = require("cors");
const colors = require("colors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const Auth = require('./middleweres/Auth');
const port = process.env.PORT || 5000;

const app = express()

// middle wares : 
app.use(cors());
app.use(express.json());

const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;

const uri = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.wfsi327.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function dbConnection() {
    try {
        await client.connect()
        console.log("database connect".blue);
    } catch (error) {
        console.log(error.name.red, error.message.yellow);
    }
}

dbConnection()

const Services = client.db("picsNow").collection("services");
const Users = client.db("picsNow").collection("users");
const Reviews = client.db("picsNow").collection("reviews");


app.post("/addUser", async (req, res) => {
    try {
        const userData = req.body;

        // console.log(userData);

        if (userData) {
            const query = {
                email: userData.email
            }
            const isAdded = await Users.findOne(query)
            if (!isAdded) {
                const data = await Users.insertOne(userData)
                if (data.acknowledged) {
                    res.send({
                        success: true,
                        message: "User data add to database successfully"
                    })
                } else {
                    res.send({
                        success: false,
                        message: "User can't added to database"
                    })
                }
            } else {
                res.send({
                    success: false,
                    message: "User data have already added to database"
                })
            }
        } else {
            res.send({
                success: false,
                message: "Please provide your user data"
            })
        }

    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
})

app.post("/addService", Auth, async (req, res) => {
    try {
        const serviceData = req.body;
        console.log(serviceData);
        const data = await Services.insertOne(serviceData);
        // console.log(data);
        if (data.acknowledged) {
            console.log(data);
            res.send({
                success: true,
                message: "Service data add to database successfully"
            })
        } else {
            res.send({
                success: false,
                message: "can't added the service"
            })
        }
    } catch (error) {
        console.log(error.name.red, error.message.yellow);
        res.send({
            success: false,
            message: "can not added this service"
        })
    }
})

app.post("/getToken", async (req, res) => {
    try {
        const newEmail = req?.body?.email;
        // console.log(newEmail.yellow);
        if (!newEmail) {
            res.send({
                success: false,
                message: "Please provide email address"
            })
        } else {
            const userEmail = await Users.findOne({ email: newEmail })
            if (!userEmail) {
                res.send({
                    success: false,
                    message: "Email doesn't exist"
                })
            } else {
                const tokenObject = {
                    email: newEmail
                }
                const token = jwt.sign(tokenObject, process.env.ACCESS_TOKEN_SECRET);
                res.send({
                    success: true,
                    message: "Get token successfully",
                    data: tokenObject,
                    token: token
                })
            }
        }

    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
})

app.post("/addReview", Auth, async (req, res) => {
    try {
        const reviewData = req.body;
        console.log(reviewData);

        if (reviewData) {
            const data = await Reviews.insertOne(reviewData)
            if (data.acknowledged) {
                res.send({
                    success: true,
                    message: "Your review added successfully"
                })
            } else {
                res.send({
                    success: false,
                    message: "Your review can't added successfully"
                })
            }
        } else {
            res.send({
                success: false,
                message: "Please provide your review"
            })
        }
    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
})

app.get("/", async (req, res) => {
    try {
        const query = {};
        const data = await Services.find(query).toArray()
        res.send({
            success: true,
            data: data
        })
    } catch (error) {
        res.send({
            success: false,
            data: []
        })
    }
})

app.get("/users", async (req, res) => {
    try {
        const query = {};
        const data = await Users.find(query).toArray()

        res.send({
            success: true,
            data: data
        })
    } catch (error) {
        res.send({
            success: false,
            data: []
        })
    }
})

app.get("/reviews", Auth, async (req, res) => {
    try {
        const query = {};
        const data = await Reviews.find(query).toArray()
        res.send({
            success: true,
            data: data
        })
    } catch (error) {
        res.send({
            success: false,
            data: []
        })
    }
})

app.get("/service/:id", Auth, async (req, res) => {
    try {
        const { id } = req.params;
        if (id) {
            const data = await Services.findOne({ _id: new ObjectId(id) })
            if (data) {
                res.send({
                    success: true,
                    data: data
                })
            } else {
                res.send({
                    success: false,
                    data: []
                })
            }
        } else {
            res.send({
                success: false,
                message: "Please provide service _id"
            })
        }

    } catch (error) {
        console.log(error.name.red, error.message.yellow);
        res.send({
            success: false,
            message: error.message
        })
    }
})






app.listen(port, () => {
    console.log(`server side running port on ${port}`);
})
