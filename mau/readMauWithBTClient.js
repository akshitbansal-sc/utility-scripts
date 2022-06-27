const {Bigtable} = require('@google-cloud/bigtable');
const constants = require('../constants');
const { parseUserFromBTWithBTClient } = require('./utility');

class ReadMauWithBTClient {
    constructor() {
        this.mauBtClient = new Bigtable({ projectId: constants.mau.projectId })
            .instance(constants.mau.db).table(constants.mau.mauTableName);
            this.shard = constants.mau.shard;
    }


    async read() {
        const rows = [];
        let counter = 0;
        let invalid = 0;
        let moj = 0;
        let others = 0;
        const validateUser = (user) => {
            return user && user.expire >= Math.floor(Date.now() / 1000);
        }
        try {
            for (let i = 0; i < 19; i++) {
                const readStream = await this.mauBtClient.createReadStream({
                    decode: false,
                    prefix: i+'_English#',
                    // other filters
                    // filter: {
                    //     condition: {
                    //         test: [{value: 'Maharashtra'}],
                    //         pass: { all: true },
                    //         fail: { all: false }
                    //     }
                    // }
                });
                for await (const row of readStream) {
                    const user = await parseUserFromBTWithBTClient(row.data);
                    console.log(user);
                    if (counter >= 5) break;
                    if (!validateUser(user)) {
                        invalid++;
                    }
                    if (!user.tenant || user.tenant === 'moj') {
                        moj++;
                    } else {
                        others++;
                    }
                    counter++;
                }
                console.log(i, counter, invalid, moj, others);
                others = counter = moj = others = 0;
            }
        } catch (e) {
            console.log(e.message);
        }
        console.log(counter, invalid);
        return (rows);
    }

}
new ReadMauWithBTClient().read();
module.exports = ReadMauWithBTClient;