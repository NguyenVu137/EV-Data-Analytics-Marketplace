require('dotenv').config();
const express = require('express'); //commonjs
const viewEngine = require('./config/viewEngine');
const initWebRoutes = require("./routes/web");
const connection = require('./config/connectDB');
const cors = require('cors');

const app = express(); //app express
const port = process.env.PORT; //port
const hostname = process.env.HOSTNAME;

app.use(cors({
    origin: "http://localhost:3000", // cho phép React frontend gọi
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));



//config req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

//config template engine
viewEngine(app);

// khai bao routes
initWebRoutes(app);

connection.query(
  'SELECT * FROM Users u',
  function (err, results, fields) {
    // console.log("results: ", results);
    // console.log("fields: " ,fields);
  }
);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});