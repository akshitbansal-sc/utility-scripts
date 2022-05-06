const DBDriverClientV2 = require('db-driver-v2-client').DBClientV2;
const dbDriverBase64Util = require('db-driver-v2-client').Base64EncodeDecodeUtil;
const dbDriver = require('dbDriver')
const crc32 = require('crc-32');
const {v4: uuidv4} = require('uuid');
const constants = require('../constants');

class DeleteBTMauKeys {

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
        this.langShard = constants.mau.mauLang;
		this.indexName = null;
		this.onlyCount = null;
		this.limit = 500;
		this.sortAscending = true;

        this.dbDriverV1 = dbDriver;
        this.dbDriverV1.connect(constants.driver.dbDriver.url);
    }


    async deleteUsers() {
        const [{data}, err] = await this.dbDriver.fullTableScan(this.tableName).invoke();
        if (!data) {
            console.log('done');
            return;
        }
        const keys = [];
        for (const row of data) {
            keys.push(row.key[0].value);
        }
        for (let key of keys) {await this.#deleteUsers(key)};
        console.error('deleted ', keys.length);
    }

    async #deleteUsers(k) {
        try {
            await this.dbDriver.deleteRow(this.tableName, [{name: 'key', value: k}]);
            // console.log('done');
            // console.log(rowsToInsert.map(row => row.key));
        } catch (err) {
            console.log("Error occurred while inserting row", err);
            process.exit(1);
        }
    }
}

// new DeleteBTMauKeys().deleteUsers();
module.exports = DeleteBTMauKeys;