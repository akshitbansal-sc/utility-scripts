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
        shard: '0_Hindi',
        mauTableName: 'mauNotificationsV2',
        db: 'production-bt-3',
        projectId: "moj-prod",
        languages: [ "Malayalam", "Kannada", "Hindi", "Urdu", "Marathi", "Bengali", "Gujarati", "Punjabi", "Odia", "Bhojpuri", "Assamese", "Haryanvi", "Rajasthani", "Telugu", "Tamil", "Pidgin", "Bangladeshi",]
    },
    project: {
        env: 'PRODUCTION',
        id: 'MOJ',
        serviceName: 'job-update-attributes-mau',
        // name: 'moj-prod'
    }
}