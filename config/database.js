const mongoose = require('mongoose');

const connectDB = async () => {
    const connect = await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    console.log(`Database connection on ${connect.connection.host}`.green.underline);
}

module.exports = connectDB;