import { DB_NAME } from '../../constants.js';



const ConnectDB = async () => {
    try {
        const conneectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        console.log(`MongoDB connected: ${conneectionInstance.connection.host}`)
    } catch (error) {
        console.log("MongoDB connection failed", error)
        process.exit(1)
    }
}

export default dbConnect;