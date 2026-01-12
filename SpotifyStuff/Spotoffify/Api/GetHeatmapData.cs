using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Azure.Cosmos;
using Spotoffify.Shared;

namespace Spotoffify.Api
{
    public class GetHeatmapData
    {
        private readonly ILogger _logger;
        private readonly CosmosClient _cosmosClient;

        public GetHeatmapData(ILoggerFactory loggerFactory, CosmosClient cosmosClient)
        {
            _logger = loggerFactory.CreateLogger<GetHeatmapData>();
            _cosmosClient = cosmosClient;
        }

        [Function("GetHeatmapData")]
        public async Task<HttpResponseData> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
        {
            _logger.LogInformation("Generating Heatmap Data...");

            try
            {
                // 1. Get Config
                string dbName = Environment.GetEnvironmentVariable("DatabaseName") ?? "SpotoffifyDB";
                string containerName = Environment.GetEnvironmentVariable("ContainerName") ?? "Plays";
                var container = _cosmosClient.GetContainer(dbName, containerName);

                // 2. The Magic Query
                // We extract the Day (0-6) and Hour (0-23) from the timestamp
                // and GROUP BY them to get counts.
                var queryText = @"
                    SELECT 
                        DateTimePart('wd', c.playedAt) as DayOfWeek, 
                        DateTimePart('hh', c.playedAt) as HourOfDay, 
                        COUNT(1) as PlayCount 
                    FROM c 
                    GROUP BY 
                        DateTimePart('wd', c.playedAt), 
                        DateTimePart('hh', c.playedAt)";

                var queryDef = new QueryDefinition(queryText);

                // 3. Execute
                var iterator = container.GetItemQueryIterator<HeatmapPoint>(queryDef);
                var points = new List<HeatmapPoint>();

                while (iterator.HasMoreResults)
                {
                    points.AddRange(await iterator.ReadNextAsync());
                }

                _logger.LogInformation($"Retrieved {points.Count} time slots.");

                // 4. Return
                var response = req.CreateResponse(HttpStatusCode.OK);
                await response.WriteAsJsonAsync(points);
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Heatmap query failed.");
                var error = req.CreateResponse(HttpStatusCode.InternalServerError);
                await error.WriteStringAsync(ex.Message);
                return error;
            }
        }
    }
}
