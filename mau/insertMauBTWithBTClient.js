const dbDriver = require('dbdriver');
const crc32 = require('crc-32');
const {v4: uuidv4} = require('uuid');
const constants = require('../constants');
const { Bigtable, v2 } = require("@google-cloud/bigtable");

class InsertMauBTWithBTClient {

    constructor() {
        this.dbDriver = dbDriver;
        this.dbDriver.connect(constants.driver.dbDriver.url);
        this.tableName = constants.mau.mauTableName;
        const bigtable = new Bigtable({ projectId: constants.mau.projectId });
        const instance = bigtable.instance(constants.mau.db);
        this.langShard = constants.mau.shard;
        this.table = instance.table(this.tableName);
    }


    async insertData(no) {
        const userIds = [];
        for (let i = 0; i < no; ++i) {
            userIds.push(Math.abs(crc32.str(uuidv4())));
        }
        return await this.#insertUsers(userIds);
    }

    doubleToByteArray(number) {
        const buffer = new ArrayBuffer(8);
        const longNum = new Float64Array(buffer);
        longNum[0] = number;
        const res = Array.from(new Uint8Array(buffer)).reverse();
        return res;
    }

    async #insertUsers(userIds) {
        const expire = Date.now() + 60 * 60 * 1000;
        const rowsToInsert = userIds.map((userId) => ({
            key: `${this.langShard}#${userId}`,
            data: {
                a1: {
                    userId: {
                        value: this.doubleToByteArray(Number(userId)),
                        timestamp: new Date(),
                    },
                    expire: {
                        value: this.doubleToByteArray(expire),
                        timestamp: new Date(),
                    },
                    language: {
                        value: Buffer.from(this.langShard),
                        timestamp: new Date(),
                    },
                    state: {
                        value: Buffer.from('Punjab')
                    }
                },
            }
        }));
        try {
            await this.table.insert(rowsToInsert);
            return rowsToInsert;
        } catch (err) {
            console.log("Error occurred while inserting row", err);
            process.exit(1);
        }
    }
}

// new InsertMauBTWithDbDriverV1().insertData();
module.exports = InsertMauBTWithBTClient;