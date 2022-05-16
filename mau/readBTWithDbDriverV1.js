const dbDriver = require('dbdriver');
const constants = require('../constants');
const { parseUserFromBTWithDbDriverV1 } = require('./utility');


class ReadBTWithDbDriverV1 {

    constructor() {
        this.dbDriver = dbDriver;
        this.dbDriver.connect(constants.driver.dbDriver.url);
        this.tableName = constants.mau.mauTableName;
        this.shard = constants.mau.shard;
        this.language = constants.mau.mauLang;
    }

    async read() {
        try {
            const [err, items] = await new Promise((resolve, reject) => 
                this.dbDriver.scanTable(this.tableName, (err, data) => {
                    if (err){
                        return reject(err);
                    }
                    return resolve(data);
            })).invoke();
            if (items.length == 0) {
                console.log('no data');
                return;
            }
            const result = [];
            for (const row of items) {
                const user = parseUserFromBTWithDbDriverV1(row);
                result.push(user);
            }
            // console.log(result);
            return (result);
        } catch(e) {
            console.error(e.message);
        }
    }
}

// new ReadBTWithDbDriverV1().read();
module.exports = ReadBTWithDbDriverV1;