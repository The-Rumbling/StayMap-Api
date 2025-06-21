const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

let db = JSON.parse(fs.readFileSync('db.json', 'utf8'));

// Ruta especial para buscar usuario por email
app.get('/users', (req, res) => {
  const { email } = req.query;
  if (email) {
    const found = db.users.filter(user => user.email === email);
    res.json(found);
  } else {
    res.json(db.users);
  }
});

// CRUD genérico para cada colección
Object.keys(db).forEach((key) => {
  // GET ALL (excepto users, ya manejado arriba)
  if (key !== 'users') {
    app.get(`/${key}`, (req, res) => res.json(db[key]));
  }

  // GET BY ID
  app.get(`/${key}/:id`, (req, res) => {
    const item = db[key].find(i => i.id == req.params.id);
    item ? res.json(item) : res.sendStatus(404);
  });

// GET posts by communityId
app.get('/posts', (req, res) => {
  const { communityId } = req.query;
  if (communityId) {
    const result = db.posts.filter(post => post.communityId == communityId);
    res.json(result);
  } else {
    res.json(db.posts);
  }
});
  
  // POST
  app.post(`/${key}`, (req, res) => {
    const nuevo = req.body;
    nuevo.id = key.slice(0, 2).toUpperCase() + Math.floor(Math.random() * 10000);
    db[key].push(nuevo);
    res.status(201).json(nuevo);
  });

  // PUT
  app.put(`/${key}/:id`, (req, res) => {
    const index = db[key].findIndex(i => i.id == req.params.id);
    if (index !== -1) {
      db[key][index] = { ...req.body, id: req.params.id };
      res.json(db[key][index]);
    } else res.sendStatus(404);
  });

  // DELETE
  app.delete(`/${key}/:id`, (req, res) => {
    const index = db[key].findIndex(i => i.id == req.params.id);
    if (index !== -1) {
      db[key].splice(index, 1);
      res.sendStatus(204);
    } else res.sendStatus(404);
  });
});

app.listen(PORT, () => {
  console.log(`API STAYMAP corriendo en puerto ${PORT}`);
});
