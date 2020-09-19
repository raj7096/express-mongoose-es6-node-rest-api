const express = require("express");
require("./db/mongoose.js");
const Router = require("./router/User.js");
const cors = require("cors");

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(cors());
app.use(Router);

app.listen(port, () => {
  console.log("Server Running on Port", port);
});
