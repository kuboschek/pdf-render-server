import express = require('express')
import multer = require('multer')
import reqid = require('express-request-id')
import RenderPDF from 'chrome-headless-render-pdf'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import del = require('del')

const app = express()

const BASE_DIR = process.env.TMP_DIR || os.tmpdir()

console.info(`Starting pdf-render-server (BASE_DIR = ${BASE_DIR}`)

const upload = multer({
    storage: multer.diskStorage({
        filename: (req, file, cb) => {
            cb(null, file.originalname)
        },
        destination: async (req, file, cb) => {
            
            // @ts-ignore
            const dir = BASE_DIR + path.sep + req.id

            fs.mkdir(dir, {recursive: true}, () => {
                cb(null, dir)
            })
        }
    })
})


app.post("/", reqid(), upload.array('files'), async (req, res) => {
    // @ts-ignore
    const indexFile = req.files.find((file) => file.originalname === 'index.html')
    const pdf = await RenderPDF.generatePdfBuffer('file://' + path.resolve(indexFile.path))

    res.header('Content-Type', 'application/pdf')
    res.write(pdf)
    res.end()

    del(indexFile.destination)
})

app.listen(3000)