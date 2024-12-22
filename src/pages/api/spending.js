// pages/api/spending.js
// Ideally would rewrite this in express
import { CosmosClient } from '@azure/cosmos';

const cosmosConfig = {
  endpoint: process.env.COSMOS_ENDPOINT,
  key: process.env.COSMOS_KEY,
  databaseId: process.env.COSMOS_DATABASE,
  containerId: process.env.COSMOS_CONTAINER
};

// Function to format data consistently
const formatSpendingData = (data) => {
  return data.map(item => ({
    department: String(item.department),
    year: Number(item.year),
    amount: Number(item.amount)
  })).filter(item => 
    // Validate that each item has the required fields and proper types
    item.department && 
    !isNaN(item.year) && 
    !isNaN(item.amount)
  );
};

async function queryCosmosDB() {
  try {
    console.group('📊 Cosmos DB Query');
    console.time('Cosmos DB Query Duration');

    const client = new CosmosClient({
      endpoint: cosmosConfig.endpoint,
      key: cosmosConfig.key
    });
    const database = client.database(cosmosConfig.databaseId);
    const container = database.container(cosmosConfig.containerId);
    const querySpec = {
      query: "SELECT c.department, c.year, c.amount FROM c"
    };
    const { resources } = await container.items.query(querySpec).fetchAll();
    return formatSpendingData(resources);
  } catch (error) {
    console.error('Cosmos DB Query Error,:', error);
    return error
  }
}

