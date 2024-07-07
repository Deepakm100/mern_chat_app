const mongoose = require('mongoose')

const connectDb = async() => {
    try {
        const connect = await mongoose.connect(process.env.MONGO_URI)
        console.log(`Connection :${connect.connection.host}`.cyan.underline);
    } catch (error) {
        console.log(`error :${error.message}`.red.bold);
        process.exit()
    }
}

module.exports = connectDb