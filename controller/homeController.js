import restaurantModel from "../model/restaurantSchema.js"
import cloudinary from 'cloudinary';

const homeController=(req,res)=>{
    res.send("doing code with cloudinary")
}

const addRestaurantController=async(req,res)=>{
  try {
    const result=await cloudinary.v2.uploader.upload(req.file.path)

    const newRestaurant= await restaurantModel({
        name:req.body.name,
        description:req.body.description,
        rating:req.body.rating,
        image:result.secure_url,
    })

    await newRestaurant.save();

    res.status(201).json({message : "Restaurant added successfully",newRestaurant})
    
  } catch (error) {
    console.log(error.message)
    res.status(500).json({message : "Internal server error"})
  }
}

export {homeController,addRestaurantController}