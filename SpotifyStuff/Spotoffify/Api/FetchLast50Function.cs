using Microsoft.Azure.Cosmos;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using Spotoffify.Shared;

namespace Spotoffify.Api;

public class FetchLast50Function
{
    private readonly ILogger _logger;

    private readonly SpotifyService _spotify;

    private readonly CosmosClient _cosmosClient;

    public FetchLast50Function(ILoggerFactory loggerFactory, SpotifyService spotify, CosmosClient cosmosClient)
    {
        _logger = loggerFactory.CreateLogger<FetchLast50Function>();
        _spotify = spotify;
        _cosmosClient = cosmosClient;
    }

    // Runs every 30 minutes: "0 */30 * * * *"
    [Function("FetchLast50")]
    public async Task Run([TimerTrigger("0 */30 * * * *")] TimerInfo myTimer)
    {
        _logger.LogInformation($"Spotoffify Fetching started at: {DateTime.Now}");

        // 1. Get credentials from Environment Variables (Azure App Settings)
        var clientId = Environment.GetEnvironmentVariable("SpotifyClientId");
        var clientSecret = Environment.GetEnvironmentVariable("SpotifyClientSecret");
        var refreshToken = Environment.GetEnvironmentVariable("SpotifyRefreshToken");

        // 2. Refresh the token
        var (accessToken, newRefreshToken) = await _spotify.RefreshAccessTokenAsync(clientId, clientSecret, refreshToken);

        // 3. Fetch the plays
        var recentPlays = await _spotify.GetRecentlyPlayedAsync(accessToken);

        // 4. Update the DB (Logic for Phase 2: Historic Updates)
        _logger.LogInformation($"Successfully fetched {recentPlays.Count} tracks.");

        var container = _cosmosClient.GetContainer("SpotoffifyDB", "Plays");

        foreach (var play in recentPlays)
        {
            // This ensures we never have the same play twice
            await container.UpsertItemAsync(play, new Microsoft.Azure.Cosmos.PartitionKey(play.TrackId));
        }
    }
}
