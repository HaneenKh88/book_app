'use strict'

const express = require('express')
const app = express();

require('dotenv').config();

const cors = require('cors');
app.use(cors());


const pg = require('pg')
const client = new pg.Client(process.env.DATABASE_URL);


const superagent = require('superagent');

const PORT = process.env.PORT || 3000

app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');



//Routes Defenition
app.get('/' , AllBooksHandler);
app.get('/searches/new', searchResultHandler);
app.post('/searches' ,searchHandler);
app.post('/addbooks' , AddBooksHandler);
app.get('/books/:id' , BooksDetailHandler);

function AllBooksHandler (req,res){
  let SQL = `SELECT * FROM books;`

  client.query(SQL) 
  .then (result =>
    {
      res.render('pages/index' , {booklist: result.rows});
      console.log(result.rows);
    })
    .catch(() => {
      errorHandler(`Error`, req, res);
    })
};

function searchResultHandler (req,res){
    res.render('pages/searches/new');
   }


   function searchHandler(req,res) 
{
    let BookSelector = req.body.SearchBox;

    let url;


         if(req.query.select === 'Title')
         {
         url = `https://www.googleapis.com/books/v1/volumes?q=${BookSelector}+intitle`;
         }

         else(req.query.select === 'Author')
       {
         url =`https://www.googleapis.com/books/v1/volumes?q=${BookSelector}+inauthor`;
       }

       
    superagent.get(url)
         .then (BooksInfo =>
            {
                let BooksArr = BooksInfo.body.items.map( element =>
                    {
                        return new Books(element);
    
                    })
                    res.render('pages/searches/show', {BooksList : BooksArr});
            })
}

function AddBooksHandler(req,res)
{
  let SQL = ` INSERT INTO books(title,author,isbn,image_url,description) VALUES ($1, $2, $3, $4, $5) RETURNING id ;`

  let Body = req.body;
  let values = [Body.title, Body.author, Body.isbn, Body.image_url, Body.description];


  client.query(SQL , values) 
  .then (() =>
    {
      res.redirect('/');
    })
    .catch(() => {
      errorHandler(`Error`, req, res);
    })
}

function BooksDetailHandler(req,res)
{
  let SQL = `SELECT * FROM books WHERE id = $1;`;
  let values= [req.params.id];

  client.query(SQL ,values)
  .then((result) =>
  {
    res.render('pages/books/detail' , {booklist: result.rows[0]});
  })
}


function errorHandler(errors) {
  app.use("*", (req, res) => {
    res.status(500).send(errors);
  })
}


// Books Constructor

function Books(BooksProerty)
{
  this.title = BooksProerty.volumeInfo.title;
  this.author = BooksProerty.volumeInfo.authors;
  this.description = BooksProerty.volumeInfo.description;
  this.imgUrl = BooksProerty.volumeInfo.imageLinks.thumbnail;
  this.isbn = BooksProerty.volumeInfo.industryIdentifiers[0].type + BooksProerty.volumeInfo.industryIdentifiers[0].identifier
}

// app.listen(PORT,()=>{
//     console.log(`Listening on PORT ${PORT}`);
// })

client.connect()
.then(() => {
  app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
})
