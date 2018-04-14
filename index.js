const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;

const port = process.env.PORT || 8080;

// Connection URL
const url = 'mongodb://hackuser:hackuser@csdm-mongodb.rgu.ac.uk/hackais';

// Database Name
const dbName = 'hackais';

app.use(express.static('public'));

function connect(callback) {
    // Use connect method to connect to the server
    MongoClient.connect(url, function (err, client) {
        console.log(err);
        const db = client.db(dbName);
        callback(db, client);
    });
}

app.get('/', function (req, res) {

});

app.get('/vessels', function (req, res) {
    connect(function (db, client) {
        const cVessels = db.collection('vessels');

        cVessels.find().toArray(function(err, docs) {
            res.status(200).send(convertJsonToHtml(docs));
            client.close();
        });
    })
});

app.get('/IMO', function (req, res) {
    connect(function (db, client) {
        const cVessels = db.collection('vessels');

        cVessels.find({IMO:9608764}).toArray(function(err, docs) {
            res.status(200).send(docs);
            client.close();
        });
    })
});

app.get('/MMSI', function (req, res) {
    connect(function (db, client) {
        const cVessels = db.collection('vessels');

        cVessels.find({MMSI:351228000}).toArray(function(err, docs) {
            res.status(200).send(docs);
            client.close();
        });
    })
});

app.get('/name', function (req, res) {
    connect(function (db, client) {
        const cVessels = db.collection('vessels');

        cVessels.find({"Name":"DENISE LK229"}).toArray(function(err, docs) {
            res.status(200).send(docs);
            client.close();
        });
    })
});


app.get('/positions', function (req, res) {
    connect(function (db, client) {
        const cPositions = db.collection('positions');

        cPositions.find({MMSI:235105729}).toArray(function(err, docs) {
            res.status(200).send(convertJsonToHtml(docs));
            client.close();
        });
    })
});

app.get('/towns', function (req, res) {
    connect(function (db, client) {
        const cPositions = db.collection('towns');

        cPositions.find().toArray(function(err, docs) {
            res.status(200).send(convertJsonToHtml(docs));
            client.close();
        });
    })
});

function convertJsonToHtml(data) {
    let html = '<table style="font-size:95%;">';
    let columnName = []
    if(data.length>0){
        html+='<tr>';
        for (let key in data[0]) {
            html+='<td>'+key+'</td>'
            columnName.push(key);
        }
        html+='</tr>\n';
    }
    for(let i=0; i<data.length; i++){
        html+='<tr>';
        for (let colIndex = 0; colIndex < columnName.length; colIndex++) {
            let cellValue = data[i][columnName[colIndex]];
            if (cellValue == null) cellValue = "null";
            html+='<td>'+cellValue+'</td>'
        }
        html+='</tr>\n';
    }
    html += '</table>'
    return html;
}


app.listen(port);
