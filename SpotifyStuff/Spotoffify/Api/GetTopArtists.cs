using System.Net;
using System.Web;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Azure.Cosmos;
using Spotoffify.Shared;

namespace Spotoffify.Api
{
    public class GetTopArtists
    {
        private readonly ILogger _logger;
        private readonly CosmosClient _cosmosClient;

        public GetTopArtists(ILoggerFactory loggerFactory, CosmosClient cosmosClient)
        {
            _logger = loggerFactory.CreateLogger<GetTopArtists>();
            _cosmosClient = cosmosClient;
        }

        [Function("GetTopArtists")]
        public async Task<HttpResponseData> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
        {
            _logger.LogInformation("Executing Top Artists Query via DI Client...");

            try
            {
                var container = _cosmosClient.GetContainer("SpotoffifyDB", "Plays");

                var queryText = "SELECT c.artistName AS ArtistName, COUNT(1) AS PlayCount FROM c GROUP BY c.artistName";
                var queryDef = new QueryDefinition(queryText);

                var iterator = container.GetItemQueryIterator<ArtistMetrics>(queryDef);
                var allStats = new List<ArtistMetrics>();

                while (iterator.HasMoreResults)
                {
                    allStats.AddRange(await iterator.ReadNextAsync());
                }

                var query = HttpUtility.ParseQueryString(req.Url.Query);
                int topN = int.TryParse(query["count"], out int c) ? c : 5;

                var topArtists = allStats
                    .OrderByDescending(a => a.PlayCount)
                    .Take(topN)
                    .ToList();

                var response = req.CreateResponse(HttpStatusCode.OK);
                await response.WriteAsJsonAsync(topArtists);
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get top artists");
                var error = req.CreateResponse(HttpStatusCode.InternalServerError);
                await error.WriteStringAsync($"Error: {ex.Message}");
                return error;
            }
        }
    }
}
