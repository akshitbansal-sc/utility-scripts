const DBDriverClientV2 = require('db-driver-v2-client').DBClientV2;
const dbDriverBase64Util = require('db-driver-v2-client').Base64EncodeDecodeUtil;
const crc32 = require('crc-32');
const {v4: uuidv4} = require('uuid');
const constants = require('../constants');

class InsertMauBTWithDbDriverV2 {

    constructor() {
        this.dbDriverConfiguration = {
            useSharedLibrary: true,
            serviceName: "job-update-attributes-mau",
            projectName: "SHARECHAT",
            environment: "STAGING",
        };

        this.dbDriver = new DBDriverClientV2(this.dbDriverConfiguration);
        this.tableName = constants.mauTableName;
        this.shard = constants.mau.shard;
		this.tableName = constants.mau.mauTableName;
    }


    async insertData(no) {
        const userIds = [];
        for (let i = 0; i < no; ++i) {
            userIds.push(Math.abs(crc32.str(uuidv4())));
        }
        const res = await this.batchUpdate(userIds);
        return res;
    }

    async batchUpdate(userIds) {
        const expire = Date.now() + 30 * 24 * 60 * 60 * 1000;
        const data = userIds.map(userId => {
            return this.getDbDriver2FormattedData(this.shard, {
                userId,
                state: 'Maharashtra',
                expire
            });
        });
        try {
            await this.dbDriver.batchUpdate(this.tableName, data);
            console.log('done inserted', data.length);
            return data;
        } catch (e) {
            console.error(e);
        }
    }

    async singleUpdate(userId) {
        const expire = Date.now() + 30 * 24 * 60 * 60 * 1000;
        const data = this.getDbDriver2FormattedData(this.shard, {
            userId,
            state: 'Maharashtra',
            expire
        });
        try {
            await this.dbDriver.update(this.tableName, key, data);
            return data;
            // console.log(data);
        } catch (e) {
            console.log(e.message);
        }
    }

    getDoubleBEBase64(num) {
		let integerBuffer = Buffer.alloc(8);
		integerBuffer.writeDoubleBE(num);
		return integerBuffer.toString('base64');
	}

    getDbDriver2FormattedData(langShard, data) {
		const formattedData = {};
		formattedData.key = this.getRowKeyForUserIdAndLanguageShard(data.userId, langShard);
		formattedData.updateSpecification = {};
		formattedData.updateSpecification.userId = this.getDoubleBEBase64(data.userId);
		formattedData.updateSpecification.language = dbDriverBase64Util.encodeStringToBase64(langShard);
		formattedData.updateSpecification.expire = this.getDoubleBEBase64(data.expire);
		if (data.state) {
			formattedData.updateSpecification.state = dbDriverBase64Util.encodeStringToBase64(data.state);
		}
		return formattedData;
	}

    getRowKeyForUserIdAndLanguageShard(userId, langShard) {
		const paddedUserId = userId.toString().padStart(19, '0');
		return [
            {
                name: 'rowKey',
                value: `${langShard}#${paddedUserId}`
            }
        ];
	}
}

// new InsertMauBTWithDbDriverV2().insertData(5);
module.exports = InsertMauBTWithDbDriverV2;