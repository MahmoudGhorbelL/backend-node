const mongoose = require('mongoose');
const categorie = require('./categorie.js');
const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  published: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  pages: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  prix: {
    type: Number,
    required: true
  },
  nomcategorie:{ type: String, required: true , unique:true ,
    ref:categorie}
});

module.exports=mongoose.model('book', bookSchema);