import mongoose from "mongoose";



 const mongoDBConnection = async ()=>{
    await mongoose.connect(process.env.MONGODB_URI);
}

export default mongoDBConnection; 


