Promise.prototype.invoke = function() {
    return this.then(res => [res, null]).catch(err => [null, err]);
}

module.exports = {

    driver: {
        dbDriver: {
            url: 'http://db-driver.staging.sharechat.internal'
        }
    },
    mau: {
        mauLang: 'dbDriverPOC',
        shard: 'dbDriverPOC',
        mauTableName: 'mauNotifications',
        db: 'sharechat-bt-test',
        projectId: "sharechat-migration-test"
    }
}