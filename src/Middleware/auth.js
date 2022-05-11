
const jwt = require("jsonwebtoken");
const booksModel = require("../models/booksModel");


const authEntication = async function (req, res, next) {
    try {
        let header = req.headers;
        let token = header["x-api-key"]
        if (!token) return res.status(400).send({ msg: "Sorry,Header(token) Must Needed" })

        jwt.verify(token, "Project 3");
        next()
    }
    catch (error) {

        return res.status(407).send({status:false, msg: error.message })
    }

}



const authorIsation = async function (req, res, next) {
    try {
        let userId;
        let header = req.headers;
        let token = header["x-api-key"]
        let decodedToken = jwt.verify(token, "Project 3");
        let bookId = req.params.bookId;

        let data = req.query
        if (Object.keys(data).length === 0) {
            userId = await booksModel.findOne({ _id: bookId }).select({ userId: 1, _id: 0 })
        }
        else {
            userId = await booksModel.findOne(data).select({ userId: 1, _id: 0 })
        }
        let _id = userId.userId.toString()
        let logId = decodedToken.userId;
        if (_id != logId) return res.status(401).send({status: false, msg: "Sorry,authorisation required  " });

       next()

    }


    catch (error) {
        return res.status(404).send({status : false, msg : error.message })
    }


}
module.exports.authEntication = authEntication
module.exports.authorIsation = authorIsation