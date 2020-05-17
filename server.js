const express = require('express');
const connectDB = require('./config/db');
const app = express();

//Connect DB
connectDB();
//endpoint

app.get('/', (req, res) => res.send('API running'));

const PORT = process.env.PORT || 5000;

app.use(express.json({ extended: false })); //to get the data in req body

app.listen(PORT, () => console.log(`Server started on Port ${PORT}`));

//server routes
app.use('/users', require('./routes/api/users.js'));
app.use('/auth', require('./routes/api/auth.js'));
app.use('/posts', require('./routes/api/posts.js'));
app.use('/profile', require('./routes/api/profile.js'));
