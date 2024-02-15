const mongoose = require('./db');
const express = require('express')
var cors=require('cors')
const connectionStatus = mongoose.connection.readyState;


const app = express()
const port = process.env.PORT||5000
app.use(cors())
app.use(express.json())

//Available Routes
app.use('/api/auth',require('./routes/auth'))
app.use('/api/notes',require('./routes/notes'))



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})