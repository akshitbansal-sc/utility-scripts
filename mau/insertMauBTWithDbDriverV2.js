const DBDriverClientV2 = require("db-driver-v2-client").DBClientV2;
const dbDriverBase64Util =
  require("db-driver-v2-client").Base64EncodeDecodeUtil;
const crc32 = require("crc-32");
const { v4: uuidv4 } = require("uuid");
const constants = require("../constants");
const { getRowKeyForUserIdAndLanguageShard, getDoubleBEBase64 } = require("./utility");

class InsertMauBTWithDbDriverV2 {
  constructor() {
    const dbDriverConfiguration = {
        useSharedLibrary: true,
        serviceName: constants.project.serviceName,
        projectName: constants.project.id,
        environment: constants.project.env,
    };

    this.dbDriver = new DBDriverClientV2(dbDriverConfiguration);
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
    const data = userIds.map((userId) => {
      return getDbDriver2FormattedData(this.shard, {
        userId,
        state: "Maharashtra",
        expire,
      });
    });
    try {
      await this.dbDriver.batchUpdate(this.tableName, data);
      console.log("done inserted", data.length);
      return data;
    } catch (e) {
      console.error(e);
    }
  }

  async singleUpdate(userId, langShard, state) {
    const expire = Date.now() + 30 * 24 * 60 * 60 * 1000;
    const data = {
        userId: getDoubleBEBase64(userId),
        language: dbDriverBase64Util.encodeStringToBase64(langShard),
        state: dbDriverBase64Util.encodeStringToBase64(state),
        expire: getDoubleBEBase64(expire)
    };
    const key = getRowKeyForUserIdAndLanguageShard(userId,
        langShard);
    try {
        await this.dbDriver.update(this.tableName, key, data);
        return data;
    } catch (e) {
        console.log(e.message);
    }
  }

}

// new InsertMauBTWithDbDriverV2().insertData(5);
module.exports = InsertMauBTWithDbDriverV2;
