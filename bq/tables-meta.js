const { BigQuery } = require('@google-cloud/bigquery');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const csvWriter = createCsvWriter({
    path: 'output-sc.csv',
    header: [
      { id: 'name', title: 'Name' },
      { id: 'logicalBytes', title: 'LogicalBytes' },
      { id: 'physicalBytes', title: 'PhysicalBytes' },
      { id: 'partitioned', title: 'Partitioned' },
      { id: 'rows', title: 'Rows' },
      { id: 'partitions', title: 'Partitions' },
      { id: 'clustering', title: 'Clustering' },
      { id: 'partitionedBy', title: 'PartitionedBy' },
      { id: 'partitionedTill', title: 'PartitionedTill' },
      { id: 'clustered', title: 'Clustered' },
    ]
  });

async function filterTablesWithKeyword(projectId, datasetId, keyword) {
  const bigquery = new BigQuery({ projectId });

  const [tables] = await bigquery.dataset(datasetId).getTables();

  const filteredTables = [];
  for (let i = 0; i < tables.length; i++) {
    const table = tables[i];
    if (table.id.toLowerCase().includes(keyword.toLowerCase())) {
      filteredTables.push(table);
    }
  }

  return filteredTables;
}
function bytesToGB(bytes) {
    return bytes/(1024*1024*1024);
}

function toDays(ms) {
    return ms/(1000 * 60 * 60 * 24);
}

async function getTableMetadata(table) {
  const bigquery = new BigQuery({ projectId: table.metadata.tableReference.projectId });

  const [metadata] = await bigquery.dataset(table.metadata.tableReference.datasetId).table(table.metadata.tableReference.tableId).getMetadata();

  const partitioning = Boolean(metadata.timePartitioning);
  const clustered = Boolean(metadata.clustering);

  return {
    name: table.id,
    logicalBytes: bytesToGB(metadata.numActiveLogicalBytes),
    physicalBytes: bytesToGB(metadata.numActivePhysicalBytes),
    partitioned: Boolean(metadata.timePartitioning),
    rows: metadata.numRows,
    partitions: metadata.numPartitions,
    ...(partitioning ? { partitionedBy: metadata.timePartitioning.type } : {}),
    ...(partitioning ? { partitionedTill: toDays(metadata.timePartitioning.expirationMs) } : {}),
    clustered
  };
}

// Usage example
async function main(projectId, datasetId, keyword) {

  try {
    const filteredTables = await filterTablesWithKeyword(projectId, datasetId, keyword);

    const metas = [];
    for (let i = 0; i < filteredTables.length; i++) {
      const tableMetadata = await getTableMetadata(filteredTables[i]);
      metas.push(tableMetadata);
    }
    await csvWriter.writeRecords(metas);
    console.table(metas);
  } catch (error) {
    console.error('Error:', error);
  }
}

const projectId = 'maximal-furnace-783';
const datasetId = 'sc_analytics';
const keyword = 'notif';
main(projectId, datasetId, keyword);