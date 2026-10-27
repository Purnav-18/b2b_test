const mongoose = require("mongoose");

const connectDB = async () => {
    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is not configured.");
    }
    await mongoose.connect(process.env.MONGODB_URI);
    await mongoose.model("Lead").init();
    console.log("MongoDB connected");
};

module.exports = connectDB;