const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("APP is running ");
});

app.use('/api/auth', require('./router/auth'));
app.use('/api/inventories', require('./router/inventories'));
app.use('/api/admin', require('./router/admin'));
app.use('/api/items', require('./router/items'));
app.use('/api/stats', require('./router/stats'));
app.use('/api/search', require('./router/search'));
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

