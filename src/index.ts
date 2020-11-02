#!/usr/bin/env node

import express = require('express')
import multer = require('multer')
import reqid = require('express-request-id')
import RenderPDF from 'chrome-headless-render-pdf'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import del = require('del')

const app = express()

const PORT = process.env.PORT || 3000
const BASE_DIR = process.env.TMP_DIR || os.tmpdir()

console.info(`Starting pdf-render-server (BASE_DIR = ${BASE_DIR}, PORT = ${PORT})`)

const upload = multer({
    storage: multer.diskStorage({
        filename: (req, file, cb) => {
            cb(null, file.originalname)
        },
        destination: async (req, file, cb) => {

            // @ts-ignore
            const dir = BASE_DIR + path.sep + req.id

            fs.mkdir(dir, { recursive: true }, () => {
                cb(null, dir)
            })
        }
    })
})

app.post("/", reqid(), upload.array('files'), async (req, res) => {
    // @ts-ignore
    const indexFile = req.files.find((file) => file.originalname === 'index.html')
    const renderDir = path.resolve(indexFile.destination)

    console.debug(`Rendering ${renderDir}`)

    const pdf = await RenderPDF.generatePdfBuffer('file://' + path.resolve(indexFile.path), {
        chromeOptions: ['--no-sandbox', '--headless', '--disable-gpu', 'disable-web-security', '--allow-file-access-from-files']
    })

    res.header('Content-Type', 'application/pdf')
    res.write(pdf)
    res.end()

    del(renderDir, { force: true })
})

const server = app.listen(PORT)


// Set up graceful shutdown, from https://medium.com/@becintec/building-graceful-node-applications-in-docker-4d2cd4d5d392
var signals: Record<string, number> = {
    'SIGHUP': 1,
    'SIGINT': 2,
    'SIGTERM': 15
}

const shutdown = (signal: string, value: number) => {
    console.info("Stopping pdf-render-server")
    server.close(() => {
        console.log("Stopped pdf-render-server")
        process.exit(128 + value)
    })
}

Object.keys(signals).forEach((signal) => {
    process.on(signal, () => {
        console.log(`process received a ${signal} signal`)
        shutdown(signal, signals[signal])
    })
})