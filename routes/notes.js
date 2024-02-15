const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const Note = require("../models/Notes");
const { body, validationResult } = require("express-validator");

//ROute1:Get all notes using GET "api/notes/fetchallnotes".Login Required
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

//ROute2:Add a new note using POST "api/notes/addnote".Login Required
router.post(
  "/addnote",
  fetchuser,
  [
    // Express Validator Middleware
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "Description must be atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const note = new Note({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const savednote = await note.save();
      res.json(savednote);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);


//ROute3:Update an existing note using POST "api/notes/addnote".Login Required
router.put('/updatenote/:id',fetchuser,async (req,res)=>{
    try {
        
    
    const { title, description, tag } = req.body;

    //create a newNote object
    const newNote={};
    if(title){newNote.title=title};
    if(description){newNote.description=description};
    if(tag){newNote.tag=tag};


    //find the note to update
    let note=await Note.findById(req.params.id);
    if(!note){return res.status(404).send("Not Found")}

    if(note.user.toString()!==req.user.id){
        return res.status(401).send("Not Allowed");
    } 
    note=await Note.findByIdAndUpdate(req.params.id,{$set:newNote},{new:true})
    res.json({note});
} catch (error) {
    console.error(error.message);
  res.status(500).send("Server Error");
}
})

//ROute4:Delete an existing note using Delete "api/notes/deletenote".Login Required
router.delete('/deletenote/:id',fetchuser,async (req,res)=>{
    try {
        
    const { title, description, tag } = req.body;


    //find the note to delete
    let note=await Note.findById(req.params.id);
    if(!note){return res.status(404).send("Not Found")}

    if(note.user.toString()!==req.user.id){
        return res.status(401).send("Not Allowed");
    } 
    note=await Note.findByIdAndDelete(req.params.id)
    res.json({"success":"Note has been deleted"});
} catch (error) {
    console.error(error.message);
  res.status(500).send("Server Error");
}
})
module.exports = router;
