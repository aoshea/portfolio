const express = require("express");
const app = express();
const http = require("http").Server(app);
const port = process.env.PORT || 4000;

app.use(express.static(__dirname + "/public"));

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

// Start server
http.listen(port, () => {
  console.info(`listening at port ${port}`);
});
