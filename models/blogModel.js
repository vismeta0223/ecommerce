const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var blogSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    category:{
        type:String,
        required:true,
    },
    numViews:{
        type:String,
        default:false,
    },
    idLiked:{
        type:Boolean,
        default:false,
    },
    idDisliked:{
        type:Boolean,
        default:false,
    },
    likes:{
        type:moongoose.Schema.ObjectId,
        ref: "User",
    },
    dislikes:{
        type:moongoose.Schema.ObjectId,
        ref: "User",
    },
    image:{
        type:String,
        default: "https://www.techspot.com/articles-info/2625/images/2023-02-08-image.jpg",
    },
    author:{
        type: String,
        default: "Admin",
    }
},
    
);

//Export the model
module.exports = mongoose.model('Blog', blogSchema);