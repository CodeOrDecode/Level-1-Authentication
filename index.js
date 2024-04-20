const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const server = express();
server.use(express.json());
const PORT = 3004;


mongoose.connect("mongodb://127.0.0.1:27017/ggggg")

const Userschema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true }
})


const Todoschema = mongoose.Schema({
    title: { type: String },
    description: { type: String },
    
})



const Usermodel = mongoose.model("user", Userschema);
const Productmodel = mongoose.model("todo", Todoschema);

const authmiddleware = (req, res, next) => {
    let token = req.headers.token.split(" ")[1];
    jwt.verify(token, 'masai', function (err, decoded) {
        if (err) {
            return res.status(400).send("you are not allowed to access it");
        }
        else {
            next()
        }

    });
}


server.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    const user = await Usermodel.findOne({ email: email });
    try {
        if (user) {
            return res.status(400).send("User already exist");
        }
        else {

            bcrypt.hash(password, 2, async (err, hassedpassword) => {
                let newUser = new Usermodel({
                    name: name,
                    email: email,
                    password: hassedpassword
                })
                await Usermodel.create(newUser);
                return res.status(200).send("User is  created");
            });

        }

    } catch (error) {
        return res.status(400).send("error");
    }
})




server.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await Usermodel.findOne({ email: email });
    if (!user) {
        return res.status(400).send("User not exist");
    }

    try {
        if (user) {
            bcrypt.compare(password, user.password, async (err, result) => {
                if (result) {

                    const token = jwt.sign({
                        data: { foo: 'bar' }
                    }, 'masai', { expiresIn: '1h' });


                    return res.status(200).send({ message: "Login Successful", token: token });
                }
                else {
                    return res.status(400).send("Invalid Credentials");
                }
            });

        }
        else {
            return res.status(400).send("Invalid Credentials");
        }

    } catch (error) {
        return res.status(400).send("error");
    }
})


server.get("/report", authmiddleware, async (req, res) => {
    try {
        return res.status(200).send("you are able");
    } catch (error) {
        return res.status(400).send("error");
    }

})


server.get("/", async (req, res) => {
    try {
        return res.status(200).send("Home Page");
    } catch (error) {
        return res.status(400).send("error");
    }

})

server.post("/addproduct",authmiddleware, async (req, res) => {
    try {
        await Productmodel.create(req.body);
        res.status(200).send("Product added");
    } catch (error) {
        console.log(error);
        res.status(404).send("error");
    }
})


server.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
})