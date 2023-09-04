sourcePath=~/sharechat/repos/nsj/notification-service-jobs
destPath=~/sharechat/github/moj/notification-service-jobs

# function
akshit() {
    folderName=$1
    source=$2
    env=$3
    infraF=$source/infra/$env
    # echo $infraF
    destination=$destPath/$folderName
    rm -rf $destination/deployment
    mkdir -p $destination/infra/$env
    if [ -d $infraF ]; then
        files=$(find $infraF -name moj*.yaml);
        for file in $files; do
            fileName=$(basename $file)
            # strip moj prefix from file name
            normal="${fileName#*-}"
            cp -R $file $destination/infra/$env/$normal
        done
    fi
}

for dir in $destPath/*/; do
    folderName=$(basename $dir)
    source=$sourcePath/$folderName
    if [ -d $source ]; then
        akshit $folderName $source "staging";
        akshit $folderName $source "production";
    fi
done