const DBDriverClientV2 = require('db-driver-v2-client').DBClientV2;
const dbDriverBase64Util = require('db-driver-v2-client').Base64EncodeDecodeUtil;
const crc32 = require('crc-32');
const {v4: uuidv4} = require('uuid');
const constants = require('./constants');
const { Bigtable, v2 } = require("@google-cloud/bigtable");

class InsertMauBTWithDbDriverV2 {

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
    }


    async insertData(no) {
        const userIds = [];
        for (let i = 0; i < no; ++i) {
            userIds.push(Math.abs(crc32.str(uuidv4())));
        }
        // console.log(userIds);
        const res = [];
        for(let id of userIds) res.push(await this.singleUpdate(id));
        return res;
    }

    async singleUpdate(userId) {
        const expire = Date.now() + 30 * 24 * 60 * 60 * 1000;
        // console.log(expire);
        const key = [
            {
                name: 'rowKey',
                value: `${this.langShard}#${userId}`
            }
        ];
        const toHex = (d) => {
            let integerBuffer = Buffer.alloc(8);
            integerBuffer.writeDoubleBE((d));
            return integerBuffer.toString('base64');
        }
        const data = {
            userId: toHex((userId)),
            expire: toHex((expire)),
            language: dbDriverBase64Util.encodeStringToBase64(this.langShard),
            state: dbDriverBase64Util.encodeStringToBase64('Punjab')
        };
        try {
            await this.dbDriver.update(this.tableName, key, data);
            return data;
            // console.log(data);
        } catch (e) {
            console.log(e.message);
        }
    }

    async #insertUsers(userIds) {
        const expire = Date.now() + 30 * 24 * 60 * 60 * 1000;
        const rowsToInsert = userIds.map((userId) => {
            // console.log(dbDriverBase64Util.encodeBigIntToBase64(Number(userId)));
            // console.log(this.doubleToByteArray(Number(userId)));
            
            return {
                key: `${this.langShard}#${userId}`,
                data: {
                a1: {
                    userId: {
                        value: dbDriverBase64Util.encodeBigIntToBase64(BigInt(userId)),
                        timestamp: new Date(),
                    },
                    expire: {
                        value: dbDriverBase64Util.encodeBigIntToBase64(BigInt(expire)),
                        timestamp: new Date(),
                    },
                    language: {
                        value: dbDriverBase64Util.encodeStringToBase64(this.langShard),
                        timestamp: new Date(),
                    },
                },
                },
            }
        });
        const keys = rowsToInsert.map(row => row.key);
        try {
            console.log(await this.dbDriver.update(this.tableName, keys, rowsToInsert));
            console.log(rowsToInsert.map(row => row.key));
        } catch (err) {
            console.log("Error occurred while inserting row", err);
            process.exit(1);
        }
    }
}

// new InsertMauBTWithDbDriverV2().insertData();
module.exports = InsertMauBTWithDbDriverV2;