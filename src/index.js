const express = require('express');
const cors = require('cors');

const app = express();

const port = process.env.PORT || 3000;
const router = require('./routes/corona.routes');


const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
}

app.use(cors(corsOptions));
app.use(express.json());
app.use('/corona', router);

app.get('/', (req, res) => {
    res.status(200).send('<h1>Node.js CRUD-API</h1> <h4>Message: Success</h4><p>Version: 1.0.0</p>')
});

app.listen(port, () => {
    console.log(`App is listening on port:${port}`);
});