import mongoose from 'mongoose';

const connectdb=async(DATABASE_URL)=>{
    try {
        const DATABASE_NAME={
            dbName:"cloudinary"
        }
      await mongoose.connect(DATABASE_URL,DATABASE_NAME);
      console.log("database of server is connected");
    } catch (error) {
        console.log(error.message)
    }
}


export default connectdb;








