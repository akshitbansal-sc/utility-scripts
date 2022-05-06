const {Bigtable} = require('@google-cloud/bigtable');
const constants = require('../constants');

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
                rows.push(await this.parseUserFromBTRowData(row.data));
                resolve(true);
            });
        }).invoke();
        return (rows);
    }

    async parseUserFromBTRowData(data) {
        const columnFamilies = Object.keys(data);
		if (!columnFamilies || !columnFamilies.length) {
			return null;
		}
		const colFamilyData = data[columnFamilies[0]];
		const user = {};
		for (const colQualifier of Object.keys(colFamilyData)) {
			let parsedValue;
			const value = colFamilyData[colQualifier][0].value;
			switch (colQualifier) {
                case 'expire':
                case 'userId':
                    parsedValue = ((value).readDoubleBE(0));
                    break;
                default:
                    parsedValue = value.toString();
			}
			user[colQualifier] = parsedValue;
		}
		return user;
    }




}
// new ReadMauWithBTClient().read();
module.exports = ReadMauWithBTClient;