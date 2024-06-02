const { default: mongoose } = require("mongoose")

const dbConnect = async() => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URL);
        console.log(`Database connected`);
    } catch (error) {
        console.log(`Database Error: ${error.message}`);
        console.error(error);
        process.exit(1);
    }
};
module.exports = dbConnect;