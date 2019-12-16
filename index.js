const express = require('express');
const app = express();
const router = new express.Router();
const {Worker, parentPort, workerData, isMainThread} = require('worker_threads');
const query = require('./query');
const path = require ('path');
var bodyParser = require('body-parser');
const { performance } = require('perf_hooks');
const NS_PER_SEC = 1e9;
process.env.UV_THREADPOOL_SIZE = 128;

async function callWorkers(workerPath, options, t0) {

    const nWorkers = options.nWorkers;

    //Simulate the acquisition of the tubes
    let workLoads = [];

    console.log(`nWorkers: ${nWorkers}`);

    for(let i = 0; i < nWorkers; i++) {
        workLoads[i] = i;
        console.log(i<nWorkers);
    }

    // Worker configuration

    let promisses = workLoads.map(index => new Promise((resolve, reject) => {

        process.dlopen = () => {
            throw new Error('La carga del módulo nativo no es segura');
        }

        let load = {
            workerIndex: index+1,
            tMin: options.tMin,
            tMax: options.tMax,
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
        let t1 = performance.now();
        return (t1 - t0);   
    }).catch(() => {
        return 0;
    });

}

async function benchmarkFunc(workerPath, options) {

    let t0 = performance.now();
    let t = await callWorkers(workerPath, options, t0);

    console.log(`-------------------------------- > ${t} < --------------------------------`);
    console.log(`----------------------------------------------------------------`);
    console.log(`----------------------------------------------------------------`);
    console.log(`----------------------------------------------------------------`);
    console.log(`----------------------------------------------------------------`);
    console.log(`----------------------------------------------------------------`);
    console.log(`----------------------------------------------------------------`);
    console.log(`----------------------------------------------------------------`);
    console.log(`----------------------------------------------------------------`);
    console.log(`----------------------------------------------------------------`);
    
    return t;

}

// Gets'

app.use(bodyParser.json());

app.listen(8081, () => console.log('Listening on port 8081'));

app.post('/api/acquisition', async (req, res) => {
    let workerPath = path.resolve('workers/acquisitionWorker.js');
    const tDeploy = await benchmarkFunc(workerPath, req.body.options);
    console.log(`Results of simulation: ${tDeploy}`);
    res.send(JSON.stringify([tDeploy]));
});

app.post('/api/analysis', async (req, res) => {
    let workerPath = path.resolve('workers/analysisWorker.js');
    const tDeploy = await benchmarkFunc(workerPath, req.body.options);
    res.send(JSON.stringify([tDeploy]));
});


app.post('/api/resolution', async (req, res) => {
    let workerPath = path.resolve('workers/resolutionWorker.js');
    const tDeploy = await benchmarkFunc(workerPath, req.body.options);
    res.send(JSON.stringify([tDeploy]));
});

app.get('/', (req, res) => {
    res.send('Hello World');
});






