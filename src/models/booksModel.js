const mongoose = require('mongoose');
const moment = require('moment')
const bookSchema = new mongoose.Schema({

 title: {type:String, 
            required:true,
             unique: true
            },

excerpt: {type:String, 
           required:true,
           }, 

userId: {type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
           },

ISBN:  { type:String,
         required: true,
         unique: true ,
         },

category: {type: String, 
            required: true
         },

subcategory: {type:[String],
              required:true
         },
                
  
isDeleted: {type: Boolean, 
            default: false
            },

deletedAt: {type: String, 
            },

reviews: {type:Number, 
    default: 0, 
    comment: Number 
   },
  
releasedAt: {type: Date, 
             default:moment(Date.now()),
            required :true},
},

    { timestamps: true });

module.exports = mongoose.model('Book', bookSchema)
