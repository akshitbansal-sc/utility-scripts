const DBDriverClientV2 = require('db-driver-v2-client').DBClientV2;
const constants = require('../constants');

class DeleteBTMauKeys {

    constructor() {
        const dbDriverConfiguration = {
            useSharedLibrary: true,
            serviceName: constants.project.serviceName,
            projectName: constants.project.id,
            environment: constants.project.env,
        };

        this.dbDriverV2 = new DBDriverClientV2(dbDriverConfiguration);
        this.shard = constants.mau.shard;
		this.tableName = constants.mau.mauTableName;
    }


    async deleteUsers() {
        const [{data}, err] = await this.dbDriverV2.fullTableScan(this.tableName).invoke();
        if (!data) {
            console.log('no data');
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
            await this.dbDriverV2.deleteRow(this.tableName, [{name: 'key', value: k}]);
        } catch (err) {
            console.log("Error occurred while inserting row", err);
            process.exit(1);
        }
    }
}

// new DeleteBTMauKeys().deleteUsers();
module.exports = DeleteBTMauKeys;