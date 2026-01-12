using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Spotoffify.Shared;
using System.Net;

namespace Spotoffify.Api
{
    public class ShuffleMix
    {
        private readonly SpotifyService _spotify;

        public ShuffleMix(SpotifyService spotify)
        {
            _spotify = spotify;
        }

        [Function("ShuffleMix")]
        public async Task<HttpResponseData> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req)
        {
            string clientId = Environment.GetEnvironmentVariable("SpotifyClientId");
            string clientSecret = Environment.GetEnvironmentVariable("SpotifyClientSecret");
            string refreshToken = Environment.GetEnvironmentVariable("SpotifyRefreshToken");

            if (string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(clientSecret) || string.IsNullOrEmpty(refreshToken))
            {
                var error = req.CreateResponse(HttpStatusCode.InternalServerError);
                await error.WriteStringAsync("Server Error: Missing Spotify Config (ClientId/Secret/Token).");
                return error;
            }

            try
            {
                // Self-Service Auth: Generate our own Access Token
                var (accessToken, _) = await _spotify.RefreshAccessTokenAsync(clientId, clientSecret, refreshToken);

                var body = await req.ReadFromJsonAsync<MixRequest>();

                // Shuffle Logic
                var allTracks = await _spotify.GetPlaylistTrackUris(body.SourcePlaylistId, accessToken);

                if (!allTracks.Any()) return req.CreateResponse(HttpStatusCode.NotFound);

                var random = new Random();
                var selectedTracks = allTracks.OrderBy(x => random.Next()).Take(50).ToList();

                await _spotify.ReplacePlaylistTracks(body.TargetPlaylistId, selectedTracks, accessToken);

                var response = req.CreateResponse(HttpStatusCode.OK);
                await response.WriteAsJsonAsync(new { message = "Reforged", count = selectedTracks.Count });
                return response;
            }
            catch (Exception ex)
            {
                var error = req.CreateResponse(HttpStatusCode.InternalServerError);
                await error.WriteStringAsync($"Shuffle failed: {ex.Message}");
                return error;
            }
        }
    }

    public class MixRequest
    {
        public string SourcePlaylistId { get; set; }
        public string TargetPlaylistId { get; set; }
    }
}