const leveldown = require('leveldown');
const levelup = require('levelup');
const db = levelup(leveldown('./db'))


function put(k, v) {
    return new Promise((res, rej) => {
        db.put(k, v, (err) => {
            if (err) return rej(err);
            res();
        });
    });
}

async function get(k) {
    return new Promise((res, rej) => {
        db.get(k, (err, value) => {
            if (err && err.name === 'NotFoundError') return res(null);
            else if (err) rej(err);
            res(value.toString());
        });
    })
}
async function foo() {
    await put('a', 'b');
    console.log(await get('c').catch((err) => {
        console.log('nf');
    }));
    console.log(await get('a').catch((err) => {
        console.log('nf');
    }));
    console.log('done');
}

module.exports = {
    put, get,
};