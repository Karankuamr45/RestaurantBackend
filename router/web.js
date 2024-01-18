import express from "express";
import multer from 'multer';
import path from 'path';
import {  addItemController, addRestaurantController, deleteItemController, deleteRestaurantWithEveryThing, getRestaurantController, homeController } from "../controller/homeController.js";
const router=express.Router();
import cloudinary from 'cloudinary';


// Configure Cloudinary
cloudinary.v2.config({
    cloud_name: 'dkby5wtrt',
    api_key: '981471163326169',
    api_secret: 'sW1INuTQ2RmfaEHl60k0W5_CW5g',
  });

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(process.cwd(),'/public/images/'))
    },
    filename: function (req, file, cb) {
      const fileName = Date.now() + '-' + file.originalname
      cb(null,fileName )
    }
  })
  
  const upload = multer({ storage: storage })


router.get('/',homeController)  

// api to add new restaurant
router.post('/api/addRestaurant',upload.single('image'),addRestaurantController);

// api to add items in a restaurant
router.post('/api/addItem/:restaurantId',upload.single('image'),addItemController);

// API endpoint to delete an item
router.delete('/api/deleteItem/:restaurantId/:itemId',deleteItemController);

// API endpoint to delete a restaurant with categories and items
router.delete('/api/restaurant/:restaurantId', deleteRestaurantWithEveryThing);

router.get('/api/getRestaurants',getRestaurantController)


export default router;