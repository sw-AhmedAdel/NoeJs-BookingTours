require("dotenv").config();
const http = require("http");
const app = require("./app");
const server = http.createServer(app);

const { mongoConnect } = require("./services/mongo");
const { loadData, deleteData } = require("./services/importdata");

//console.log(app.get("env"));
console.log(process.env.NODE_ENV);

async function startServer() {
  await mongoConnect();

  if (process.argv[2] === "l") {
    await loadData();
  }

  if (process.argv[2] === "d") {
    await deleteData();
  }

  if (process.argv[2] === "both") {
    await deleteData();
    await loadData();
  }

  server.listen(process.env.PORT, () => {
    console.log("Running Server");
  });
}

startServer();
