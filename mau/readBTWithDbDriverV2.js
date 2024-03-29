const DBDriverClientV2 = require("db-driver-v2-client").DBClientV2;
const constants = require("../constants");

const {
  parseUserFromBTWithDbDriverV2,
  getLanguageShardForUserId,
  getRowKeyForUserIdAndLanguageShard,
  getRowKeyForUserAndLanguage,
} = require("./utility");

class ReadBTWithDbDriverV2 {
  constructor() {
    const dbDriverConfiguration = {
      useSharedLibrary: true,
      serviceName: constants.project.serviceName,
      projectName: constants.project.id,
      environment: constants.project.env,
    };

    this.dbDriver = new DBDriverClientV2(dbDriverConfiguration);
    this.primaryKey = constants.mau.shard;
    this.tableName = constants.mau.mauTableName;
    this.numericFields = ["userId", "expire"];
    this.serialisedFields = [];
  }

  async read() {
    try {
      const [{ data }, err] = await this.dbDriver
        .fullTableScan(this.tableName)
        .invoke();
      const result = [];
      if (err) throw err;
    // console.log(err, data);
      if (!data) {
        console.log("no data");
        return;
      }
      for (const row of data) {
        const user = parseUserFromBTWithDbDriverV2(row);
        result.push(user);
      }
    // console.log(result);
      return result;
    } catch (e) {
      console.error(e);
    }
  }

  async getUserIdForAllLanguages(userId) {
    const languages = constants.mau.languages;
    // const rowKeys = [getRowKeyForUserAndLanguage(userId, langua)]
    
    const rowKeys = languages.map((language) => {
      const langShard = getLanguageShardForUserId(userId, language);
      return getRowKeyForUserIdAndLanguageShard(userId, langShard);
    });


    try {
      const data = await this.dbDriver.batchReadRow(this.tableName, rowKeys);
      console.log(data.rows.map(parseUserFromBTWithDbDriverV2));
    } catch (e) {
      console.log(e);
    }
  }
}

new ReadBTWithDbDriverV2().getUserIdForAllLanguages(93659421421);
// new ReadBTWithDbDriverV2().getUserIdForAllLanguages(96169465521);
module.exports = ReadBTWithDbDriverV2;
