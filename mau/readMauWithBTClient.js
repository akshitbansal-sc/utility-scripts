const {Bigtable} = require('@google-cloud/bigtable');
const constants = require('../constants');
const { parseUserFromBTWithBTClient } = require('./utility');

class ReadMauWithBTClient {
    constructor() {
        this.mauBtClient = new Bigtable({ projectId: constants.mau.projectId })
            .instance(constants.mau.db).table(constants.mau.mauTableName);
    }


    async read() {
        const rows = [];
        await new Promise(async (resolve, reject) => {
            this.mauBtClient.createReadStream({decode: false})
            .on('error', (err) => {
                this.utility.logError(`Error occurred while reading monthly active users langShard ${langShard}`, err, { isDebugLog: true });
                return reject(err);
            }).on('data', async (row) => {;
            // for (const row of rows) {
                rows.push(await parseUserFromBTWithBTClient(row.data));
                resolve(true);
            });
        }).invoke();
        // console.log(rows);
        return (rows);
    }

}
// new ReadMauWithBTClient().read();
module.exports = ReadMauWithBTClient;