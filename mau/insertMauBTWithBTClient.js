const dbDriver = require('dbdriver');
const crc32 = require('crc-32');
const {v4: uuidv4} = require('uuid');
const constants = require('../constants');
const { Bigtable, v2 } = require("@google-cloud/bigtable");

class InsertMauBTWithBTClient {

    constructor() {
        this.dbDriver = dbDriver;
        this.dbDriver.connect(constants.driver.dbDriver.url);
        this.tableName = 'mauNotifications';
        const bigtable = new Bigtable({ projectId: constants.mau.projectId });
        const instance = bigtable.instance(constants.mau.db);
        this.langShard = constants.mau.mauLang;
        this.table = instance.table(this.tableName);
    }


    async insertData(no) {
        const userIds = [];
        for (let i = 0; i < no; ++i) {
            userIds.push(Math.abs(crc32.str(uuidv4())));
        }
        // console.log(userIds);
        return await this.#insertUsers(userIds);
    }

    doubleToByteArray(number) {
        const buffer = new ArrayBuffer(8); // JS numbers are 8 bytes long, or 64 bits
        // console.log(buffer);
        const longNum = new Float64Array(buffer); // so equivalent to Float64
        // console.log(longNum, buffer);
        longNum[0] = number;
        // console.log(longNum, buffer);
        const res = Array.from(new Uint8Array(buffer)).reverse(); // reverse to get little endian
        // console.log(longNum, buffer, res);
        return res;
    }

    async #insertUsers(userIds) {
        const expire = Date.now() + 1 * 60 * 1000;
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
        // console.log(rowsToInsert[0].data.a1);
        // console.log(rowsToInsert.map(row => row.key));
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