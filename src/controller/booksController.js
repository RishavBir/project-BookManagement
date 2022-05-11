
const mongoose = require('mongoose');
const jwt = require("jsonwebtoken")
const userModel = require("../models/userModel")
const booksModel = require("../models/booksModel")
const BooksModel= require("../models/booksModel")
const reviewModel = require("../models/reviewModel")

const moment = require('moment')
let time = moment().format('YYYY-MM-DDTHH:MM:ss.SSS')


const createBook = async function (req, res) {

 try {
        let data = req.body
        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, msg: "Body must require" })
        let validUser = await userModel.findById({ _id: data.userId })
        if (validUser === null) return res.status(400).send({ status: false, msg: "User Id not valid" })

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
            if (allBooks.length == 0) return res.status(404).send({ status: false, msg: "books not found" })
            return res.status(200).send({ status: true, data: allBooks })
        }

        let filterBooks = await booksModel.find({ $and: [data, { isDeleted: false }]}).sort({title:1})

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

        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).send({ status: false, message: "Invalid book id" })
        }

        const foundedBook = await booksModel.findOne({ _id: bookId, isDeleted: false })

        if (!foundedBook) {
            return res.status(404).send({ status: false, message: "books not found" })
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
            return res.status(400).send({ status: false, msg: " Book has deleted " })
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

module.exports.createBook = createBook
 module.exports.getBooks = getBooks
 module.exports.getBooksById = getBooksById
 module.exports.updateBooksById = updateBooksById
 module.exports.deleteBooksById =deleteBooksById