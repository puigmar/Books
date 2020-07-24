var express = require('express');
var router = express.Router();

const Book = require('../models/Book.js');
const Author = require('../models/Author');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/books', (req, res, next) => {
  Book.find()
    .populate('author')
    .then(allBooksDB => {
      console.log('Retrieved books from DB:', allBooksDB);
      res.render('books', {books: allBooksDB})
    })
})

// Añadimos rutas para el formulario
router.get('/book/add', (req, res, next) => {
  res.render("book-add");
})

router.post('/book/add', (req, res, next) => {
  const {title, author, description, rating} = req.body;
  const newBook = new Book({ title, author, description, rating});
  newBook.save(newBook)
    .then((book) => {
      res.redirect('/books');
    })
    .catch((error) => {
      console.log(error);
    })
})

router.get('/book/edit', (req, res, next) => {
  const bookId = req.query.bookId;
  Book.findById(bookId)
    .populate('author')
    .then(book => {
      res.render('book-edit', {book: book})
    })
})

router.post('/book/edit', (req, res, next) => {
  const bookId = req.query.bookId;
  const {title, name, description, rating, authorName, authorLastName} = req.body;

  Book.updateOne({ _id: bookId }, { $set: { title, description, rating }}, {new: true})
  .then( () => {
    Book.find({_id: bookId},{author: 1, _id: 0})
      .then( (idAuthor) => {
        console.log(idAuthor[0].author[0])
        Author.updateOne({ _id: idAuthor[0].author[0] }, { $set: { name: authorName, lastName: authorLastName }}, {new: true})
        .then( (result) => {
          console.log(result)
          res.redirect("/books");
        })
      })
      .catch(err => console.log('err:', err));
  })
  .catch(err => console.log('err:', err));
})

// Añadimos rutas para el detalle del libro
router.get('/book/:id', (req, res, next) => {
  let bookId = req.params.id;
  if (!/^[0-9a-fA-F]{24}$/.test(bookId)) { 
    return res.status(404).render('not-found');
  }
  Book.findById({'_id': bookId})
    .populate('author')
    .then(book => {
      if (!book) {
          return res.status(404).render('not-found');
      }
      res.render("book", { book })
    })
    .catch(next)
});

// Gestionamos author
router.get('/authors/add', (req, res, next) => {
  res.render("author-add")
});

router.post('/authors/add', (req, res, next) => {
  const { name, lastName, nationality, birthday, pictureUrl } = req.body;
  const newAuthor = new Author({ name, lastName, nationality, birthday, pictureUrl})
  newAuthor.save()
  .then((book) => {
    res.redirect('/books')
  })
  .catch((error) => {
    console.log(error)
  })
});

// Add reviews

router.post('/book/:book_id', (req, res, next) => {
  const { user, comments, book_id } = req.body;
  Book.update(
    { _id: book_id },
    { $push: { reviews: { user, comments } } }
  )
    .then(book => {
      res.redirect('/book/' + book_id);
    })
    .catch(error => {
      console.log(error);
    });
});

module.exports = router;
