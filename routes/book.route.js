const express = require('express');
const router = express.Router();
const Book = require("../models/book");
const book = require('../models/book');

// chercher un livre par s/cat
router.get('/cat/:categorieID', async (req, res) => {
    try {
        const books = await Book.find({ nomcategorie: req.params.scategorieID }).exec();
        res.status(200).json(books);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// afficher la liste des livres
router.get('/', async (req, res) => {
    try {
        const books = await Book.find();
        res.status(200).json(books);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// afficher la liste des livres par page
router.get('/bookspage/', async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Get the current page number from the query parameters
    const pagesize = parseInt(req.query.pagesize) || 5; // Number of items per page

    // Calculez le nombre d'éléments à sauter (offset)
    const offset = (page - 1) * pagesize;
    try {
        // Effectuez la requête à votre source de données en utilisant les paramètres de pagination
        const books = await Book.find({}, null, { sort: { '_id': -1 } })
            .skip(offset)
            .limit(pagesize)
            .exec();

        res.status(200).json(books);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// nombre total des enregistrements
router.get('/nombreTot/', async (req, res) => {
    try {
        const books = await Book.find().exec();
        res.status(200).json({ tot: books.length });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// 2ème solution paginate avec filtre
router.get('/filtres/', async (req, res) => {
    const filtre = req.query.filtre || "";
    const page = parseInt(req.query.page) || 1; // Get the current page number from the query parameters
    const limit = parseInt(req.query.limit) || 5; // Number of items per page

    // Calculez le nombre d'éléments à sauter (offset)
    const offset = (page - 1) * limit;
    try {
        // Effectuez la requête à votre source de données en utilisant les paramètres de pagination
        // $option is used to make the search case insensitive.
        const books = await Book.find({ title: { $regex: filtre, $options: "i" } }, null, { sort: { '_id': -1 } })
            .skip(offset)
            .limit(limit)
            .populate("nomcategorie")
            .exec();

        const booksNb = await Book.find({ title: { $regex: filtre, $options: "i" } }).exec();

        res.status(200).json({ books: books, longueur: booksNb.length });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// créer un nouveau livre
router.post('/', async (req, res) => {
    const newBook = new Book(req.body);
    try {
        const response = await newBook.save();
        const book = await Book.findById(response._id).populate("nomcategorie").exec();
        res.status(200).json(book);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// chercher un livre
router.get('/:bookId', async (req, res) => {
    try {
        const book = await Book.findById(req.params.bookId);
        res.status(200).json(book);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

router.put('/:bookId', async (req, res) => {
    try {
        const bok = await Book.findByIdAndUpdate(
            req.params.bookId,
            { $set: req.body },
            { new: true }
        );
        const books = await Book.findById(bok._id).populate("categorieID").exec();
        console.log(books)
        res.status(200).json(books);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// supprimer un livre
router.delete('/:bookId', async (req, res) => {
    const id = req.params.bookId;
    try {
        await Book.findByIdAndDelete(id);
        res.status(200).json({ message: "Book deleted successfully." });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// afficher la liste des articles par page avec filtre
router.get('/paginationFilter', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const searchTerm = req.query.searchTerm || '';
        const prixMax = parseFloat(req.query.prixMax) || Infinity;

        const query = {};
        if (searchTerm) {
            query.title = { $regex: new RegExp(searchTerm, 'i') };
        }
        query.prix = { $lte: prixMax };

        const offset = (page - 1) * limit;
        const books = await Book.find(query).skip(offset).limit(limit);
        const totalCount = await Book.countDocuments(query);

        res.status(200).json({
            success: true,
            data: books,
            totalCount
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


module.exports = router;
