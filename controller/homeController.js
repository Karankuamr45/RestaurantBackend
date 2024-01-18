import itemModel from "../model/itemSchema.js";
import restaurantModel from "../model/restaurantSchema.js"
import cloudinary from 'cloudinary';
import streamifier from 'streamifier';

const homeController=(req,res)=>{
    res.send("doing code with cloudinary")
}

// Api to add a restaurant


const addRestaurantController = async (req, res) => {
  try {
    const { name, description, rating } = req.body;

    // Validate required fields
    if (!name || !description || !rating || !req.file) {
      return res.status(400).json({ error: 'Name, description, rating, and image are required' });
    }

    // Validate rating range
    const parsedRating = parseFloat(rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ error: 'Rating should be between 1 and 5' });
    }

    const newRestaurant = new restaurantModel({
      name: name,
      description: description,
      rating: rating,
      items: [],
    });

    try {
      // Create a readable stream from the buffer
      const stream = cloudinary.v2.uploader.upload_stream(async (err, cloudinaryResult) => {
        if (err) {
          console.error('Cloudinary upload error:', err);
          return res.status(500).json({ error: 'Error uploading image to Cloudinary' });
        }

        newRestaurant.image = cloudinaryResult.secure_url;
        
        // Save the new restaurant, including the image
        await newRestaurant.save();

        res.status(201).json({ message: 'Restaurant added successfully', newRestaurant });
      });

      streamifier.createReadStream(req.file.buffer).pipe(stream);
    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError);
      return res.status(500).json({ error: 'Error uploading image to Cloudinary' });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};





// API endpoint to add items to a specific category in a restaurant
const addItemController=async(req,res)=>{
  try {
    const restaurantId = req.params.restaurantId;
    const { name, category, description, price } = req.body;

    // Validate required fields
    if (!name || !category || !description || !price) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate price to be a positive number
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ error: 'Price should be a positive number' });
    }

    // Find the restaurant by ID
    const restaurant = await restaurantModel.findById(restaurantId);
    
    // If restaurant not found
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const result=await cloudinary.v2.uploader.upload(req.file.path)

    const newItem=await itemModel({
    name:name,
    category:category,
    description:description,
    price:price,
    image:result.secure_url,
    })

     // Add the item to the restaurant's items array
     restaurant.items.push(newItem);

     // Save the updated restaurant
     const updatedRestaurant = await restaurant.save();

     res.json({ message: 'Item added to the restaurant successfully', restaurant: updatedRestaurant });

    

    
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}


const getRestaurantController=async (req, res) => {
  try {
    // Retrieve all restaurants from the database
    const restaurants = await restaurantModel.find();

    res.json({ restaurants });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Api to delete a specific restaurant item
const deleteItemController= async (req, res) => {
  try {
    const restaurantId = req.params.restaurantId;
    const itemId = req.params.itemId;

    // Find the restaurant by ID
    const restaurant = await restaurantModel.findById(restaurantId);

    // If restaurant not found
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Find the index of the item in the items array
    const itemIndex = restaurant.items.findIndex(item => item._id == itemId);

    // If item not found
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found in the restaurant' });
    }

    // Retrieve the public_id of the item image from Cloudinary
    const publicId = restaurant.items[itemIndex].image.split('/').pop().split('.')[0];

    // Delete the item image from Cloudinary
    await cloudinary.v2.uploader.destroy(publicId);

    // Remove the item from the items array
    restaurant.items.splice(itemIndex, 1);

    // Save the updated restaurant
    const updatedRestaurant = await restaurant.save();

    res.json({ message: 'Item deleted from the restaurant successfully', restaurant: updatedRestaurant });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}


const deleteRestaurantWithEveryThing =async (req, res) => {
  try {
    const restaurantId = req.params.restaurantId;

    // Find the restaurant by ID
    const restaurant = await restaurantModel.findById(restaurantId);

    // If restaurant not found
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Delete all items' images from Cloudinary
    for (const item of restaurant.items) {
      const publicId = item.image.split('/').pop().split('.')[0];
      await cloudinary.v2.uploader.destroy(publicId);
    }

    // Delete the restaurant and its items from the database
    await restaurantModel.findByIdAndDelete(restaurantId);

    res.json({ message: 'Restaurant and its items deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}





export {homeController,addRestaurantController,getRestaurantController,addItemController,deleteItemController,deleteRestaurantWithEveryThing}