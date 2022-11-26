const express = require("express")
const bodyparser = require("body-parser")
const route = require("./routes/route")
const mongoose = require("mongoose")

const app = express();

app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended:true}))

mongoose.connect('mongodb+srv://prince_chouhan9340:VmEz2U6wR9QeMWxw@cluster0.7obeg.mongodb.net/project-3_bookManagement-db?retryWrites=true&w=majority',{
    useNewurlParser:true
}).then(()=>{
    console.log("MongoDb is conected")
}).catch(err=>console.log(err))

app.use("/", route)
// www.domianName.com/

app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port' + (process.env.PORT || 3000))
});
