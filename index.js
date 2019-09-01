const express = require('express');
const app = express();
const {Worker, parentPort, workerData, isMainThread} = require('worker_threads');
const query = require('./query');
const path = require ('path');
var bodyParser = require('body-parser')
const NS_PER_SEC = 1e9;
process.env.UV_THREADPOOL_SIZE = 128;


async function callWorkers(workerPath, options) {

    const nWorkers = options.nWorkers;

    //Simulate the adquisition of the tubes
    let workLoads = [];

    for(let i = 1; i < nWorkers+1; i++) {
        workLoads[i] = i;
    }

    // Worker configuration

    let promisses = workLoads.map(index => new Promise((resolve, reject) => {

        process.dlopen = () => {
            throw new Error('La carga del módulo nativo no es segura');
        }

        let load = {
            workerIndex: index,
            tMin: options.tMin,
            tMax: options.tMax
        }

        const worker = new Worker(workerPath, {
            workerData: load 
        });

        workerIndex++;

        // Fin copiado
        worker.on("message", resolve);
        worker.on("error", (error) => {
            reject(new Error(`Worker stopped by catched error ${error}`));
        });
        worker.on("exit", (code) => {
            if(code!=0) {
                reject(new Error(`Worker stoped with exit code ${code}`));
            }
        });

    }));

    return Promise.all(promisses).then((values) => {
        return values;
    }).catch(() => {
        return 0;
    });

}

async function benchmarkFunc(workerPath, options) {

    const tStart = process.hrtime();
    var variable = await callWorkers(workerPath, options);
    const tDiff = process.hrtime(tStart);
    const t = tDiff[0] * NS_PER_SEC + tDiff[1];
    return t;

}

// Gets'

 app.use(bodyParser.json());

app.listen(8081, () => console.log('Listening on port 8081'));

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.post('/api/adquisition', async (req, res) => {
    let workerPath = path.resolve('workers/adquisitionWorker.js');
    const tDeploy = await benchmarkFunc(workerPath, req.body.options);
    res.send(JSON.stringify([tDeploy]));
});

app.get('/api/analisis', async (req, res) => {
    let workerPath = path.resolve('workers/analisisWorker.js');
    const tDeploy = await benchmarkFunc(workerPath);
    res.send(JSON.stringify([tDeploy]));
});


app.get('/api/resolution', async (req, res) => {
    let workerPath = path.resolve('workers/resolutionWorker.js');
    const tDeploy = await benchmarkFunc(workerPath);
    res.send(JSON.stringify([tDeploy]));
});


