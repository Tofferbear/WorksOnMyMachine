using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Azure.Cosmos;
using Spotoffify.Shared;

namespace Spotoffify.Api
{
    public class GetTopTracks
    {
        private readonly ILogger _logger;
        private readonly CosmosClient _cosmosClient;

        public GetTopTracks(ILoggerFactory loggerFactory, CosmosClient cosmosClient)
        {
            _logger = loggerFactory.CreateLogger<GetTopTracks>();
            _cosmosClient = cosmosClient;
        }

        [Function("GetTopTracks")]
        public async Task<HttpResponseData> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "GetTopTracks/{count}")] HttpRequestData req,
            int count)
        {
            try
            {
                var container = _cosmosClient.GetContainer(
                    Environment.GetEnvironmentVariable("DatabaseName") ?? "SpotoffifyDB",
                    Environment.GetEnvironmentVariable("ContainerName") ?? "Plays");

                // Group by Track AND Artist to avoid collisions
                // Note: Using camelCase (trackName, artistName) to match Cosmos JSON
                var queryText = "SELECT c.trackName, c.artistName, COUNT(1) as PlayCount FROM c GROUP BY c.trackName, c.artistName";

                var queryDef = new QueryDefinition(queryText);
                var iterator = container.GetItemQueryIterator<TrackMetrics>(queryDef);
                var allMetrics = new List<TrackMetrics>();

                while (iterator.HasMoreResults)
                {
                    allMetrics.AddRange(await iterator.ReadNextAsync());
                }

                // Sort and Slice in memory
                var topTracks = allMetrics
                    .OrderByDescending(m => m.PlayCount)
                    .Take(count)
                    .ToList();

                var response = req.CreateResponse(HttpStatusCode.OK);
                await response.WriteAsJsonAsync(topTracks);
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetTopTracks failed");
                var error = req.CreateResponse(HttpStatusCode.InternalServerError);
                await error.WriteStringAsync(ex.Message);
                return error;
            }
        }
    }
}
