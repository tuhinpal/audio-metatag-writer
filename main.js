const express = require('express');
const app = express();
const axios = require('axios');
const ID3Writer = require('browser-id3-writer');
const fs = require('fs');
const contentDisposition = require('content-disposition');
const serveStatic = require('serve-static');
const ffmpeg = require('fluent-ffmpeg');
const { exec } = require('child_process');
const port = process.env.PORT || 8080;
const cors = require('cors');
const bodyparser = require('body-parser')
const app_url = process.env.APP_URL || "https://tagwriter.musicder.net";
const deletekey = "ilovereact";
const converterkey = "ilovereact";

app.use(cors({
    origin: '*',
    optionsSuccessStatus: 200
}))

app.use(bodyparser.urlencoded({ extended: false }))
app.use(bodyparser.json())


app.post('/id3', async function(req, res) {

    if (req.body.name == undefined) {
        res.status(403).send("Not Allowed")
    } else if (req.body.song_url == undefined) {
        res.status(403).send("Not Allowed")
    } else if (req.body.cover_url == undefined) {
        res.status(403).send("Not Allowed")
    } else if (req.body.album == undefined) {
        res.status(403).send("Not Allowed")
    } else if (req.body.year == undefined) {
        res.status(403).send("Not Allowed")
    } else if (req.body.artist == undefined) {
        res.status(403).send("Not Allowed")
    } else {

        var name = req.body.name
        var song_buffer = await axios.get(`http://127.0.0.1:${port}/converter?filename=${name}&url=${req.body.song_url}&key=${converterkey}`, { responseType: 'arraybuffer' });
        var cover_buffer = await axios.get(req.body.cover_url, { responseType: 'arraybuffer' });
        var album = req.body.album;
        var year = req.body.year;
        var artist = req.body.artist;

        const writer = new ID3Writer(song_buffer.data);
        writer.setFrame('TIT2', name)
            .setFrame('TPE1', [artist])
            .setFrame('TALB', album)
            .setFrame('TYER', year)
            .setFrame('APIC', {
                type: 3,
                data: cover_buffer.data,
                description: name
            });
        writer.addTag();

        var savepath = `/public/${name.replace(/ /gi, '-').split("?").join("").split(":").join("").replace(/#/gi, '').replace(/;/gi, '')}-${await time()}.mp3`
        fs.writeFileSync(__dirname + savepath, Buffer.from(writer.arrayBuffer));
        res.status(200).json({
            path: savepath,
            url: app_url + savepath
        })
    }
});

app.get('/delete', async function(req, res) {

    if (req.query.key == deletekey) {

        exec("cd public && rm -r *", (error, stdout, stderr) => {
            if (error) {
                res.send("error")
            } else if (stderr) {
                res.send("stderr")
            } else {
                res.send("Done")
            }
        })
    } else {
        res.send("Unauthorized")
    }
})

app.get('/converter', (req, res) => {

    var url = req.query.url
    var filename = req.query.filename

    if (req.query.key == converterkey) {
        if (url == undefined) res.send("Url is Required")

        res.contentType('audio/mp3');
        res.attachment(filename + '.mp3');

        ffmpeg(url)
            .toFormat('mp3')
            .on('end', function(err) {
                if (err) {}
            })
            .on('error', function(err) {
                if (err) {}
            })
            .pipe(res, { end: true })
    } else {
        res.send("Unauthorized")
    }
});

app.get('/gaana', (req, res) => {

    res.contentType('audio/mpeg');
    res.attachment('audio.mp3');

    ffmpeg(req.body.url)
        .toFormat('mp3')
        .on('end', function(err) {
            if (err) {}
        })
        .on('error', function(err) {
            if (err) {}
        })
        .pipe(res, { end: true })

});


app.get('/', (req, res) => {

    res.send(`I am <a href="https://github.com/cachecleanerjeet/musicder">Musicder</a>'s Metatag writer. I firstly convert a file to mp3 and afterthat add Metatags.<br><a href="https://github.com/cachecleanerjeet">Made by Tuhin</a>`)
});

app.use('/public', (serveStatic('public', { 'index': false, 'setHeaders': setHeaders })))

function setHeaders(res, path) {
    res.setHeader('Content-Disposition', contentDisposition(path))
}


async function time() {
    return axios({
        method: 'get',
        url: 'https://time.akamai.com/'
    })

    .then(function(response) {
            return Number(response.data) + Number(19800) + randomString(3, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
        })
        .catch(function(error) {
            return randomString(6, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
        });

}

function randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

app.listen(port, () => {
    console.log(`Using PORT: ${port}`)
})
