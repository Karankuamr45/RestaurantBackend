import mongoose from "mongoose";

const restaurantSchema=mongoose.Schema({
    name:{
        type:String
    },
    categories: [
        {
          name: String,
          items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],
        },
      ],
    description:{
        type:String
    },
    rating:{
        type:Number,
    },
    image:{
        type:String
    }

})

const restaurantModel=mongoose.model("Restaurant",restaurantSchema);

export default restaurantModel;