'use strict'

const express =  require('express');
require('dotenv').config;
const superagent = require('superagent');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.static('./public'));
app.use(express.urlencoded({extended:true}));

app.set('view engine','ejs');


//Routes Defenition

// app.get('/search', searchHandler);


app.get('/',(req,res)=>{
    // res.send('hello');
    res.render('pages/index');
})

app.get('/searches/new',(req,res)=>{
    res.render('pages/searches/new');
   })


app.post('/searches',(req,res) => 
{
    let BookSelector = req.body.SearchBox;
    
    let Result;

         if(req.query.select === 'Title')
         Result = 'intitle';
    
         else(req.query.select === 'Author')
         Result = 'Author';
        
         let url = `https://www.googleapis.com/books/v1/volumes?q=${BookSelector}+${Result}:keyes`;
    

    superagent.get(url)
         .then (BooksInfo =>
            {
                let BooksArr = BooksInfo.body.items.map( element =>
                    {
                        return new Books(element);
    
                    })
                    res.render('pages/searches/show', {BooksList : BooksArr});
            })
})

   
// Books Constructor

function Books(BooksProerty)
{
  this.title = BooksProerty.volumeInfo.title;
  this.author = BooksProerty.volumeInfo.authors;
  this.description = BooksProerty.volumeInfo.description;
  this.imgUrl = BooksProerty.volumeInfo.imageLinks.thumbnail;
}

app.listen(PORT,()=>{
    console.log(`Listening on PORT ${PORT}`);
})