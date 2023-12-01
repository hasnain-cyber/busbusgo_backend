const app = require('express')();

app.get('/', (req, res) => {
    res.send('Hello World!');
});


const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});