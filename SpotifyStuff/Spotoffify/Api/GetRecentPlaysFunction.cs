using Microsoft.Azure.Cosmos;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Spotoffify.Shared;
using System.Collections.Generic;
using System.ComponentModel;
using System.Numerics;

namespace Spotoffify.Api;

public class GetRecentPlaysFunction
{
    private readonly CosmosClient _cosmosClient;

    public GetRecentPlaysFunction(CosmosClient cosmosClient)
    {
        _cosmosClient = cosmosClient;
    }

    [Function("GetRecentPlays")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
    {
        // Get the container
        var container = _cosmosClient.GetContainer("SpotoffifyDB", "Plays");

        // Query the last 50 plays, ordered by time
        var query = new QueryDefinition("SELECT TOP 50 * FROM c ORDER BY c.playedAt DESC");
        using var iterator = container.GetItemQueryIterator<TrackedPlay>(query);

        var results = new List<TrackedPlay>();

        while (iterator.HasMoreResults)
        {
            var response = await iterator.ReadNextAsync();
            results.AddRange(response);
        }

        var res = req.CreateResponse(System.Net.HttpStatusCode.OK);
        await res.WriteAsJsonAsync(results);
        return res;
    }
}
