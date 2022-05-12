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
        };

        this.dbDriver = new DBDriverClientV2(this.dbDriverConfiguration);
        this.primaryKey = constants.mau.shard;
		this.tableName = constants.mau.mauTableName;
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
            console.error(e);
        }
        
    }

    async readRowsWithKeys() {
        const keys = [
            [ { name: 'rowKey', value: 'dbDriverPOC#0000000000295780963' } ],
            [ { name: 'rowKey', value: 'dbDriverPOC#0000000000519872324' } ],
            [ { name: 'rowKey', value: 'dbDriverPOC#0000000001096406963' } ],
            [ { name: 'rowKey', value: 'dbDriverPOC#0000000001290550226' } ],
            [ { name: 'rowKey', value: 'dbDriverPOC#0000000001849322531' } ]
        ];
        try {
            const data = await this.dbDriver.batchReadRow(this.tableName, keys);
            console.log(data.rows.map(this.parseUserFromBTRowData));
        } catch (e) {
            console.log(e);
        }
    }

    parseUserFromBTRowData(data) {
        if (!data || Object.keys(data).length === 0) {
			return null;
		}
		const user = {};
		for (const [ name, value ] of Object.entries(data.data)) { //remove .data for readRowsWithKeys
			if (!value) { continue; }
			let parsedValue;
			switch (name) {
			case 'expire':
            case 'userId':
            // the integer will be read by double BE
            parsedValue = Buffer.from(value, 'base64').readDoubleBE(0);
            break;
			default:
				// string will be read by decoding the string
				parsedValue = dbDriverBase64Util.decodeStringFromBase64(value);
			}
			user[name] = parsedValue;
		}
		return user;
	}
}

// new ReadBTWithDbDriverV2().read();
module.exports = ReadBTWithDbDriverV2;