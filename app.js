const express = require('express');
const database = require('mysql');
const bodyParser = require('body-parser');
const session = require('express-session');
const db = database.createConnection({
    host: 'localhost',
    user: 'test',
    password: 'testing',
    database: 'web'
});
const http = express();

http.use(session({
  secret: 'rahasia',
  resave: false,
  saveUninitialized: true
}))

function dbQuery(db, query, params) {
    const promise = new Promise(function(resolve, reject) {
        db.query(query, params, function(err, results, fields) {
            if (err)
                reject(err);
            else
                resolve(results, fields);
        });
    });
    return promise;
}


http.use(bodyParser.urlencoded({ extended: false }))
http.use(bodyParser.json())

http.use((req, res, next) => {
    if (! req.session.flash)
        req.session.flash = [];

    next();
});

// var index = require("./routes/index");

http.set('view engine', 'ejs');
http.set('views', 'views');

const n = 2;

// http.get('/', (req, res) => {
//     // pagination
//     const page = parseInt(req.query.page ? req.query.page : 1);

//     // hitung page
//     const total = db.prepare('select count(*) total from data').get();

//     const rows = db.prepare('select * from data limit ? offset ?')
//         .all(n, (page-1)*n);

//     res.render('data', {datas: rows, flash: req.session.flash,
//         pagination: {page: page, total_pages: Math.floor(total.total/n, 1), prev_page: page > 1 ? page-1 : null,
//         next_page: page < Math.floor(total.total/n, 1) ? page+1: null}});
// });

http.get('/', (req, res) => {
    // pagination
    const page = parseInt(req.query.page ? req.query.page : 1);

    // hitung page
    var total = 0;

    dbQuery(db, 'select count(*) total from data').then((results, fields) => {
        total = results[0]['total'];
    });

    var rows = [];
    dbQuery(db, 'select * from data limit ? offset ?', [n, (page-1)*n])
    .then((results, fields) => {
            rows = results;
            res.render('index', {data: rows, flash: req.session.flash, pagination: {page: page
            	, total_pages: Math.floor(total/n, 1)
            	, prev_page: page > 1 ? page-1 : null
            	, next_page: page < Math.floor(total/n, 1) ? page+1: null}});
    })
    .catch(err => {
        res.send('error');
        console.log(err);
    });
});

http.post('/', (req, res) => {
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const gender = req.body.gender;
    const religion = req.body.religion;
    const email = req.body.email;

    dbQuery(db, 'insert into data (firstname,lastname,gender,religion,email) values(?,?,?,?,?)', [firstname,lastname,gender,religion,email])
	.then((results, fields) => {
	    req.session.flash.push({message: 'Data berhasil ditambah',
				    class: 'success'});

	    res.redirect('/');
	});
});

http.get('/delete/:id', (req, res) => {
    const id = req.params.id;

    dbQuery(db, 'delete from data where id=?', [id])
	.then((results, fields) => {
	    req.session.flash.push({message: 'Data berhasil dihapus',
		    class: 'warning'});
	    res.redirect('/');
	});
});

http.get('/update/:id', (req, res) => {
    const id = req.params.id;

    dbQuery(db, 'select * from data where id=?', [id])
	.then((results, fields) => {
		if (results.length >= 1)
			res.render('update', {data: results[0]});
		else
			res.status(404).send('Data ID = ' + id + ' not found');
	});
});

http.post('/update/:id', (req, res) => {
    const id = req.params.id;
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const gender = req.body.gender;
    const religion = req.body.religion;
    const email = req.body.email;

    dbQuery(db, 'update data set firstname=?, lastname=?, gender=?, religion=?, email=? where id=?', [firstname, lastname, gender, religion, email, id])
	.then((results, fields) => {
	    req.session.flash.push({message: 'Data berhasil diupdate',
				    class: 'success'});
	    res.redirect('/');

	});
});

// http.post('/', (req, res) => {
//     const firstname = req.body.firstname;
//     const lastname = req.body.lastname;
//     const gender = req.body.gender;
//     const religion = req.body.religion;
//     const email = req.body.email;

//     db.prepare('insert into data(firstname, lastname, gender, religion, email) values(:firstname,:lastname,:gender,:religion,:email)')
//         .run({firstname:firstname,lastname :lastname,gender :gender,religion :religion,email :email});

//     req.session.flash.push({message: 'Data berhasil ditambah',
//                             class: 'success'});

//     res.redirect('/');
// });

// http.get('/delete/:id', (req, res) => {
//     const id = req.params.id;

//     db.prepare('delete from data where id=?').run(id);

//     req.session.flash.push({message: 'Data berhasil dihapus',
//             class: 'warning'});
//     res.redirect('/');
// });

// http.get('/update/:id', (req, res) => {
//     const id = req.params.id;
//     const data = db.prepare('select * from data where id=?').get(id);

//     if (data)
//         res.render('update', {data: data});
//     else
//         res.status(404).send('Data ID : ' + id + ' not found');
// });

// http.post('/update/:id', (req, res) => {
//     const id = req.params.id;
//     const firstname = req.body.firstname;
//     const lastname = req.body.lastname;
//     const gender = req.body.gender;
//     const religion = req.body.religion;
//     const email = req.body.email;

//     db.prepare('update data set firstname=?, lastname=?, gender=?, religion=?, email=? where id=?')
//         .run(firstname, lastname, id);
    
//     req.session.flash.push({message: 'Data berhasil diupdate',
//                             class: 'success'});
//     res.redirect('/');
// });

http.listen(3000, () => {
	console.log('Listen to 3000 ...')
})