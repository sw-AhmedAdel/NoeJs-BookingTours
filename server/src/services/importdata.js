const fs = require("fs");
const path = require("path");
const Tour = require("../models/tour.mongo");

const tours = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "..", "data", "tours-simple.json"))
);

async function loadData() {
  try {
    await Tour.create(tours);
    console.log("Data successfully loaded");
  } catch (err) {
    console.log(err, "Could not loead data");
  }
}

async function deleteData() {
  try {
    await Tour.deleteMany();
    console.log("Deleted all data");
  } catch (err) {
    console.log(err, "Could not loead data");
  }
}

module.exports = {
  loadData,
  deleteData,
};
