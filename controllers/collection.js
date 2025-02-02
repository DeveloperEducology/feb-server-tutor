const Class = require("../models/Profile");
const Subject = require("../models/Profile");
const City = require("../models/Profile");
const Location = require("../models/Profile");
const Pincode = require("../models/Profile");
const Area = require("../models/Profile");
const Board = require("../models/Profile");


const collections = async (req, res) => {
    try {
      console.log("Fetching collections...");
  
      // Fetch data in parallel using Mongoose models
      const classesPromise = Class.find();
      const subjectsPromise = Subject.find();
      const citiesPromise = City.find({ status: true });
      const pincodesPromise = Pincode.find();
      const areasPromise = Area.find();
      const boardsPromise = Board.find();
  
      // Example for fetching locations with city details
      const locationsPromise = Location.find().populate("cityId", "name");
  
      // Resolve all promises
      const [classes, subjects, cities, locations, pincodes, areas, boards] =
        await Promise.all([
          classesPromise,
          subjectsPromise,
          citiesPromise,
          locationsPromise,
          pincodesPromise,
          areasPromise,
          boardsPromise,
        ]);
  
      // Log resolved data
      console.log("Classes:", classes);
      console.log("Subjects:", subjects);
      console.log("Cities:", cities);
      console.log("Locations:", locations);
  
      // Send the combined response
      res.status(200).json({
        classes,
        subjects,
        cities,
        locations,
        pincodes,
        areas,
        boards,
      });
    } catch (error) {
      console.error("Error fetching collections:", error);
      res
        .status(500)
        .json({ error: "An error occurred while fetching the collections" });
    }
  };
  

  module.exports = {
   collections
  };
  