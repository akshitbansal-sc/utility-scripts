const dbDriver = require('dbdriver');
const crc32 = require('crc-32');
const {v4: uuidv4} = require('uuid');
const constants = require('../constants');

class InsertMauBTWithDbDriverV1 {

    constructor() {
        this.dbDriver = dbDriver;
        this.dbDriver.connect(constants.driver.dbDriver.url);
        this.tableName = constants.mau.mauTableName;
        this.langShard = constants.mau.shard;
    }

    async insertData(no) {
        const userIds = [];
        for (let i = 0; i < no; ++i) {
            userIds.push(Math.abs(crc32.str(uuidv4())));
        }
        try {
            return await this.#insertUsers(userIds);
        } catch (e) {
            console.log(e.message);
        }
    }

    async singleUpdate(userId, lang, state) {
        const expire = (Date.now() + 100000).toString();
        const objects = [
            {
                userId: {N: userId.toString()},
                language: {S: lang},
                expire,
                state
            }
        ];
        await new Promise((resolve, reject) => {
            this.dbDriver.batchPut(this.tableName, objects, (err, data) => {
                if (err) {
                    console.error(err);
                    reject(err);
                }
                resolve(true);
            });
        });
        console.log('done');
    }

    async #insertUsers(userIds) {
        const expire = Date.now() + 1 * 60 * 1000;
        const rowsToInsert = userIds.map((userId) => ({
            userId: { N: userId.toString() },
            expire: { N : expire.toString() },
            language: { S: this.langShard.toString() },
            state: {S: 'Punjab'}
        }));
        try {
            return new Promise((resolve, reject) => {
                this.dbDriver.batchPut(this.tableName, rowsToInsert, (err) => {
                    if (err) {
                        return reject(err);
                    }
                    console.log('done inserted', rowsToInsert.length);
                    return resolve(rowsToInsert);
                });
            });
        } catch (err) {
            console.log(err.message);
        }
    }
}

// new InsertMauBTWithDbDriverV1().insertData(5);
module.exports = InsertMauBTWithDbDriverV1;