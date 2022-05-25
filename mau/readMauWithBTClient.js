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
        const validateUser = (user) => {
            return user && user.expire >= Math.floor(Date.now() / 1000);
        }
        try {
            const readStream = await this.mauBtClient.createReadStream({
                prefix: this.shard,
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
                if (!validateUser(user)) {
                    invalid++;
                }
				counter++;
			}
        } catch (e) {
            console.log(e.message);
        }
        console.log(counter, invalid);
        return (rows);
    }

}
// new ReadMauWithBTClient().read();
module.exports = ReadMauWithBTClient;