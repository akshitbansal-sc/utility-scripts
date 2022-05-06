const DBDriverClientV2 = require('db-driver-v2-client').DBClientV2;
const dbDriverBase64Util = require('db-driver-v2-client').Base64EncodeDecodeUtil;
const { default: Axios } = require('axios');
const constants = require('../constants');


class ReadBTWithDbDriverV2 {
    constructor() {

        this.dbDriverConfiguration = {
            useSharedLibrary: true,
            serviceName: "sc-update-mau-v2",
            projectName: "SHARECHAT",
            environment: "STAGING",
            // url: "http://localhost:9051"
        };

        this.dbDriver = new DBDriverClientV2(this.dbDriverConfiguration);

        // this.dbDriver.connect(constants.driver.dbDriver.url);
        this.tableName = 'mauNotifications';
        this.primaryKey = constants.mau.mauPrimaryKey
		this.tableName = constants.mau.mauTableName;
		this.indexName = null;
		this.onlyCount = null;
		this.limit = 500;
		this.sortAscending = true;
        this.numericFields = ['userId', 'expire'];
        this.serialisedFields = [];
    }

    async sidecarRead() {
        try {
            const data = await Axios.get(this.dbDriverConfiguration.url+'/v1/readByPrefix', {
                data: {
                    tableName: this.tableName,
                    prefix: this.primaryKey
                }
            });
            console.log(data.data);
        } catch (e) {
            console.error(e.message);
        }
    }

    async read() {
        try {
            const [{data}, err] = await this.dbDriver.fullTableScan(this.tableName).invoke();
            const result = [];
            if (err) throw err;
            // console.log(err, data);
            if (!data) {
                console.log('no data');
                return;
            }
             for (const row of data) {
                const user = this.parseUserFromBTRowData(row);
                result.push(user);
            }
            // console.log(result);
            return (result);
        } catch(e) {
            console.error(e.message);
        }
        
    }

    parseUserFromBTRowData(userInfo) {
        let parsedObject = {};
        // console.log(userInfo);
        // for (const [name, value] of Object.entries(userInfo.key[0])) {
        //     // console.log(name, value);
        //     if (!value) continue;
        //     parsedObject[name] = value;
		// }
		for (const [name, value] of Object.entries(userInfo.data)) {
            // console.log(name, value);
            if (!value) continue;
			if (this.numericFields.includes(name)) {
				parsedObject[name] = Buffer.from(value, 'base64').readDoubleBE(0);
			} else {
				parsedObject[name] = dbDriverBase64Util.decodeStringFromBase64(value);
			}
            // console.log(parsedObject);
			if (this.serialisedFields.includes(name)) {
				parsedObject[name] = JSON.parse(parsedObject[name])
			}
		}
        return parsedObject;
	}
}

new ReadBTWithDbDriverV2().read();
module.exports = ReadBTWithDbDriverV2;