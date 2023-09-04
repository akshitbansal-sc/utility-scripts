/**
 * Creates and processes batches
 * @param {Array} batchArray 
 * @param {number} batchSize 
 * @param {Function} opsOnBatch 
 * @param {Function} postBatchProcessor 
 * @param {number} postBatchProcessorCount 
 * @returns 
 */
async function batchProcessor(batchArray, batchSize, opsOnBatch, postBatchProcessor, postBatchProcessorCount = 1) {
    if (!this.isArrayAndNotEmpty(batchArray)) {
        return;
    }
    if (isNaN(batchSize) || batchSize === 0) {
        throw new Error('Invalid batch size');
    }
    if (isNaN(postBatchProcessorCount) || postBatchProcessorCount === 0) {
        throw new Error('Invalid post batch processor count');
    }
    if (opsOnBatch && typeof opsOnBatch !== 'function') {
        throw new Error('Function required for opsOnBatch');
    }
    if (postBatchProcessor && typeof postBatchProcessor !== 'function') {
        throw new Error('Function required for postBatchProcessor');
    }
    let awaitOpsOnBatch = false;
    if (opsOnBatch && opsOnBatch.constructor.name === 'AsyncFunction') {
        awaitOpsOnBatch = true;
    }
    let awaitPostBatchProcessor = false;
    if (postBatchProcessor && postBatchProcessor.constructor.name === 'AsyncFunction') {
        awaitPostBatchProcessor = true;
    }
    
    const batchLength = batchArray.length;
    const batches = Math.ceil(batchLength / batchSize);
    const batchAccumulator = [];
    for (let batchNo = 0; batchNo < batches; batchNo++) {
        const batch = batchArray.slice(batchNo, Math.min(batchLength, (batchNo + 1) * batchSize));
        if (opsOnBatch) {
            batchAccumulator.push(awaitOpsOnBatch ? await opsOnBatch(batch) : opsOnBatch(batch));
        } else {
            batchAccumulator.push(batch);
        }
        if (batchAccumulator.length === postBatchProcessorCount) {
            if (postBatchProcessor) {
                awaitPostBatchProcessor ? await postBatchProcessor(batchAccumulator) : postBatchProcessor(batchAccumulator);
            }
            batchAccumulator = [];
        }
    }
}

function sort(object){
    if (typeof object != "object" || object instanceof Array) // Not to sort the array
        return object;
    var keys = Object.keys(object);
    keys.sort();
    var newObject = {};
    for (var i = 0; i < keys.length; i++){
        newObject[keys[i]] = sort(object[keys[i]])
    }
    return newObject;
}

module.exports = {
    batchProcessor
};