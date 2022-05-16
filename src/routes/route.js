
const express = require("express")
const router = express.Router()
const userController=require("../controller/userController")
const booksController= require("../controller/booksController")
const middleware = require("../Middleware/auth")


router.post("/register",userController.createUser)
router.post("/login",userController.login)
router.post("/books",middleware.authEntication,booksController.createBook)
router.get("/books",middleware.authEntication,booksController.getBooks)
 router.get("/books/:bookId",middleware.authEntication, booksController.getBooksById)
 router.put("/books/:bookId",middleware.authEntication, middleware.authorIsation,booksController.updateBooksById)
router.delete("/books/:bookId", middleware.authEntication, middleware.authorIsation, booksController.deleteBooksById)
router.post("/books/:bookId/review",booksController.createReview)
router.put("/books/:bookId/review/:reviewId", booksController.updateReview)
router.delete("/books/:bookId/review/:reviewId", booksController.deleteReview)

module.exports = router;