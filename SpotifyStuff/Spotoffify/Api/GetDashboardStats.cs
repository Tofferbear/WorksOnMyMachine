using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Azure.Cosmos;
using Spotoffify.Shared;

namespace Spotoffify.Api
{
    public class GetDashboardStats
    {
        private readonly ILogger _logger;
        private readonly CosmosClient _cosmosClient;

        public GetDashboardStats(ILoggerFactory loggerFactory, CosmosClient cosmosClient)
        {
            _logger = loggerFactory.CreateLogger<GetDashboardStats>();
            _cosmosClient = cosmosClient;
        }

        [Function("GetDashboardStats")]
        public async Task<HttpResponseData> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
        {
            try
            {
                // 1. Setup
                string dbName = Environment.GetEnvironmentVariable("DatabaseName") ?? "SpotoffifyDB";
                string containerName = Environment.GetEnvironmentVariable("ContainerName") ?? "Plays";
                var container = _cosmosClient.GetContainer(dbName, containerName);
                var stats = new DashboardStats();

                // 2. Query A: Total Counts & Time
                var sumQuery = "SELECT COUNT(1) AS PlayCount, SUM(c.durationMs) AS TotalMs FROM c";

                var sumIterator = container.GetItemQueryIterator<dynamic>(new QueryDefinition(sumQuery));

                if (sumIterator.HasMoreResults)
                {
                    var result = (await sumIterator.ReadNextAsync()).FirstOrDefault();
                    if (result != null)
                    {
                        stats.TotalPlays = (int)result.PlayCount;

                        double totalMs = (double?)result.TotalMs ?? 0;
                        stats.TotalMinutesListened = totalMs / 60000.0;
                    }
                }

                // 3. Query B: Longest Track
                // We assume 'DurationMs' exists. We verify it's not null.
                var longQuery = "SELECT TOP 1 * FROM c WHERE IS_DEFINED(c.durationMs) ORDER BY c.durationMs DESC";
                var longIter = container.GetItemQueryIterator<TrackedPlay>(new QueryDefinition(longQuery));
                if (longIter.HasMoreResults) stats.LongestTrack = (await longIter.ReadNextAsync()).FirstOrDefault();

                // 4. Query C: Shortest Track (Filter > 30s to avoid glitches/skips)
                var shortQuery = "SELECT TOP 1 * FROM c WHERE c.durationMs > 30000 ORDER BY c.durationMs ASC";
                var shortIter = container.GetItemQueryIterator<TrackedPlay>(new QueryDefinition(shortQuery));
                if (shortIter.HasMoreResults) stats.ShortestTrack = (await shortIter.ReadNextAsync()).FirstOrDefault();

                // 5. Return
                var response = req.CreateResponse(HttpStatusCode.OK);
                await response.WriteAsJsonAsync(stats);
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Stats calculation failed.");
                var err = req.CreateResponse(HttpStatusCode.InternalServerError);
                await err.WriteStringAsync(ex.Message);
                return err;
            }
        }
    }
}
