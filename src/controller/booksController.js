
const mongoose = require('mongoose');
const jwt = require("jsonwebtoken")
const userModel = require("../models/userModel")
const booksModel = require("../models/booksModel")
// const BooksModel= require("../models/booksModel")
const reviewModel = require("../models/reviewModel")

// This validation is for createReview API
const isValid= function(value){
    if(typeof value === "undefined"|| value === null) 
    return false;
    if(typeof value === "string" && value.trim().length===0)
    return false;
    return true;
};

const moment = require('moment')
let time = moment().format('YYYY-MM-DDTHH:MM:ss.SSS')


const createBook = async function (req, res) {

 try {
        let data = req.body
        if (Object.keys(data).length == 0) 
        return res.status(400).send({ status: false, msg: "Body must require" })

        let validUser = await userModel.findById({ _id: data.userId })
        if (validUser === null) 
        return res.status(400).send({ status: false, msg: "User Id not valid" })

        let {title,ISBN,excerpt,userId,category,subcategory,reviews,deletedAt, isDeleted, releasedAt}=data
        if (!title) 
        return res.status(400).send({status:false, msg:"Title is mandatory"})

        if (!ISBN) 
        return res.status(400).send({status:false, msg:"ISBN is mandatory"})

        if (!excerpt) 
        return res.status(400).send({status:false, msg:"Excerpt is mandatory"})

        if (!userId) 
        return res.status(400).send({status:false, msg:"UserId is mandatory"})

        if (!category) 
        return res.status(400).send({status:false, msg:"Category is mandatory"})

        if (!subcategory) 
        return res.status(400).send({status:false, msg:"Subcategory is mandatory"})

        if (!reviews) 
        return res.status(400).send({status:false, msg:"Reviews is mandatory"})

        
      let savedData = await booksModel.create(data)
        res.status(201).send({ status: true, data: savedData })
    }

    catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}

//************************************************************************************************************************************************************************************ */


const getBooks = async function (req, res) {
    try {
        let data = req.query
        if (Object.keys(data).length === 0) {
            let allBooks = await booksModel.find({ isDeleted: false }).select({ISBN:0, subcategory:0, deletedAt:0, isDeleted:0, createdAt:0, updatedAt:0}).sort({ title:1})
            if (allBooks.length == 0)
             return res.status(404).send({ status: false, msg: "books not found" })
         return res.status(200).send({ status: true, data: allBooks })
        }

        let filterBooks = await booksModel.find({ $and: [data, { isDeleted: false }]}).select({ISBN:0, subcategory:0, deletedAt:0, isDeleted:0, createdAt:0, updatedAt:0}).sort({title:1})

        if (filterBooks.length == 0) return res.status(404).send({ status: false, msg: "no books found" })


       return  res.status(200).send({ status: true, data: filterBooks })
    }
    catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }

}

//****************************************************************************************************************************************** */

const getBooksById = async function (req, res) {
    try {
        const bookId = req.params.bookId;

        if (Object.keys(bookId).length === 0) {
            return res.status(400).send({ status: false, message: "book id is not present" })
        }

        const foundedBook = await booksModel.findOne({ _id: bookId, isDeleted: false })

        if (!foundedBook) {
            return res.status(404).send({ status: false, message: "books not found , maybe you put wrong book id or the book have already deleted" })
        }

      const availableReviews = await reviewModel.find({ bookId: foundedBook._id, isDeleted: false }).select({ isDeleted: 0, createdAt: 0, updateAt: 0 })
    return res.status(200).send({ status: true, message: "Books list", data: foundedBook, reviewData: availableReviews})
} 
 
 catch (error) { res.status(500).send({ msg: error.message })
}

 }

// /************************************************************************************************************************************************************************ */

  const updateBooksById = async function (req, res) {
    try {

      let body = req.body

        let bookId = req.params.bookId;

        let checkBook = await booksModel.findById(bookId)
        console.log(checkBook)

        if (!checkBook) {
            return res.status(404).send({ status: false, msg: "No book found this bookId" })
        }
        
         if (checkBook.isDeleted == true) {
            return res.status(400).send({ status: false, msg: " Book has already deleted " })
        }

        if (body.title){
            let find = await booksModel.findOne({title:body.title})
            if(find){
                return res.status(400).send ({status:false, msg: "Already exist please enter another title"})
            }
        }
       
        if (body.ISBN){
            let finding = await booksModel.findOne({ISBN:body.ISBN})
            if(finding){
                return res.status(400).send ({status:false, msg: "ISBN Already exist please enter another ISBN"})
            }
        }
       
        if (body.excerpt){
            let findings = await booksModel.findOne({excerpt:body.excerpt})
            if(findings){
                return res.status(400).send ({status:false, msg: " Already exist please enter another excerpt"})
            }
        }

        
        if (body.releasedAt){
            let found = await booksModel.findOne({releasedAt:body.releasedAt})
            if(found){
                return res.status(400).send ({status:false, msg: " Already exist please enter other release date eg:'YYYY-MM-DDTHH' "})
            }
        }
       

    let updatebook = await booksModel.findByIdAndUpdate({ _id: bookId, isDeleted: false }, body, { new: true })

        return res.status(200).send({ status: true, msg: "book update successfully ", data: updatebook })

        }
    catch (err) {

        res.status(500).send({ status: false, error: err.message })
    }

}
 
 // /******************************************************************************************************************************* */


const deleteBooksById= async function (req, res) {

    try {
        let id = req.params.bookId
        let allBooks = await booksModel.findOneAndUpdate({ _id: id, isDeleted: false }, { $set: { isDeleted: true, deletedAt: time } }, { new: true,upsert:true })
        if (allBooks) 
        res.status(200).send({ status: true, data: allBooks })
        else 
        res.status(404).send({ status: false, msg: "No Books Exist" })
    } 
    catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}

// /********************************************************************************************************************************************************************************* */


const createReview = async function (req, res) {
    try {
        let bookId = req.params.bookId

        if (!bookId) 
        return res.status(400).send({ status: false, msg: "Bad Request, please provide BookId in params" })

        let check = await booksModel.findById({ _id: bookId, isDeleted: false })
        if (!check) {
            return res.status(404).send({ status: false, message: "No book found" })
        } else {
            let data = req.body
            let { review, rating, reviewedBy } = data

            if (!isValid(data)) {
                return res.status(400).send({ status: false, msg: "please provide  details" })
            }

            if (!isValid(review)) {
                return res.status(400).send({ status: false, msg: "Not a valid review" })
            }

            if (!isValid(reviewedBy)) {
                return res.status(400).send({ status: false, msg: "Name should be a valid String " })
            }

            if(!(rating>=1 && rating<=5)){
               return res.status(400).send({ status: false, msg: "Rating should be inbetween 1-5 " })
           }

            data.reviewedAt = new Date()
            data.bookId= bookId

            let newReview = await booksModel.findOneAndUpdate({ _id: bookId }, {
                $inc: { review: 1} }, { new: true, upsert: true ,})            // inc stands for increment
            
            let savedData = await reviewModel.create(data)
             newReview.reviewData = savedData
            return res.status(201).send({ status: true, data: newReview })
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ status: false, msg: "error", err: err.message })

    }
}
/************************************************************************************************************** */


const updateReview= async function (req, res) {
    try {

      let body = req.body

        let bookId = req.params.bookId;
        let reviewId= req.params.reviewId;

        let checkBook = await booksModel.findById(bookId)
        console.log(checkBook)

        if (!checkBook) {
            return res.status(404).send({ status: false, msg: "No book found this bookId" })
        }
        
         if (checkBook.isDeleted == true) {
            return res.status(400).send({ status: false, msg: " Book has already deleted " })
        }

        if (body.review){
            let find = await reviewModel.findOne({review:body.review})
            if(find){
                return res.status(400).send ({status:false, msg: "Same review already exist, please enter new review"})
            }
        }
       
        if (body.rating){
            let finding = await reviewModel.findOne({rating:body.rating})
            if(finding){
                return res.status(400).send ({status:false, msg: "rating already exist please enter new rating"})
            }
        }
       
        if (body.reviewedBy){
            let findings = await reviewModel.findOne({reviewedBy:body.reviewedBy})
            if(findings){
                return res.status(400).send ({status:false, msg: "Same reviewer already exist , please update him/her"})
            }
        }
       
  let updatereview = await reviewModel.findByIdAndUpdate({ _id: reviewId, isDeleted: false }, body, { new: true })

        return res.status(200).send({ status: true, msg: "review updated successfully ", data: updatereview })

        }
    catch (err) {

        res.status(500).send({ status: false, error: err.message })
    }

}

//****************************************************************************************************************** */


const deleteReview = async (req, res) => {
    const bookId = req.params.bookId
    const reviewId = req.params.reviewId
  
    try {
  
  
        let checkBook = await booksModel.findById(bookId)
        console.log(checkBook)

        if (!checkBook) {
            return res.status(404).send({ status: false, msg: "No book found this bookId" })
        }
        
         if (checkBook.isDeleted == true) {
            return res.status(400).send({ status: false, msg: " Book has already deleted " })
        }
  
      if (reviewId) {
        let isValidreviewId = mongoose.Types.ObjectId.isValid(reviewId);
        if (!isValidreviewId) {
          return res.status(400).send({ status: false, msg: "reviewId is Not a type of Valid objectId" })
        }
      }
  
      
      const countreviews = checkBook.reviews
  
      const reviewIdExist = await reviewModel.findOne({ _id: reviewId, bookId: bookId, isDeleted: false })
      if (!reviewIdExist) {
        return res.status(404).send({ status: false, msg: "No Review Exist With this reviewId" })
      }
      let decreasereview = await booksModel.findOneAndUpdate({ _id: bookId, isDeleted: false }, { $set: { reviews: countreviews - 1 } }, { new: true, upsert: true })
      let deletereview = await reviewModel.findOneAndUpdate({ _id: reviewId, bookId: bookId, isDeleted: false }, { $set: { isDeleted: true } }, { new: true, upsert: true })
  
  
      return res.status(200).send({ status: true, message: "Review Deleted Successfully" })
  
    }
    catch (err) {
      res.status(500).send({ status: false, msg: err.message })
    }
  }
  
  


module.exports.createBook = createBook
 module.exports.getBooks = getBooks
 module.exports.getBooksById = getBooksById
 module.exports.updateBooksById = updateBooksById
 module.exports.deleteBooksById =deleteBooksById
 module.exports.createReview = createReview
 module.exports.updateReview= updateReview
 module.exports.deleteReview= deleteReview