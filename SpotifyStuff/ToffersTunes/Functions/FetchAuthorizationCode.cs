using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using ToffersTunes.Handlers;

namespace ToffersTunes.Functions
{
    public class FetchAuthorizationCode
    {
        private readonly string _clientId;

        private readonly ILogger _logger;

        private readonly ISpotifyHandler _spotifyhandler;

        public FetchAuthorizationCode(ILoggerFactory loggerFactory, IConfiguration configuration, ISpotifyHandler spotifyhandler)
        {
            _clientId = configuration["SpotifyAppClientId"];
            _logger = loggerFactory.CreateLogger<FetchAuthorizationCode>();
            _spotifyhandler = spotifyhandler;
        }

        [Function("FetchAuthorizationCode")]
        public async Task<HttpResponseData> RunAsync([HttpTrigger(AuthorizationLevel.Function, "get")] HttpRequestData req)
        {
            _logger.LogInformation("ToffersTunes http trigger FetchAuthorizationCode function started processing a request.");

            var response = req.CreateResponse(HttpStatusCode.OK);
            var queryParams = GetQueryParams(req.Url.Query);

            if (!queryParams.TryGetValue("code", out var authorizationCode))
            {
                // Redirect the user to Spotify authorization URL
                var scopes = "user-read-recently-played";
                string authorizationUrl = $"https://accounts.spotify.com/authorize?response_type=code&client_id={_clientId}&redirect_uri={Uri.EscapeDataString(SpotifyHandler.REDIRECT_URI)}&scope={Uri.EscapeDataString(scopes)}";
                response.Headers.Add("Location", authorizationUrl);
                response.StatusCode = HttpStatusCode.Redirect;
            }
            else
            {
                _spotifyhandler.AuthorizationCode = authorizationCode;

                // Authorization code received from Spotify callback
                // Process the authorization code and perform further actions, such as exchanging it for an access token
                // You can store the authorization code securely for later use in the Timer Trigger function
                _logger.LogInformation($"Authorization code received: {authorizationCode}");

                // You can return a success message or perform additional operations as needed
                await response.WriteStringAsync("Authorization code received successfully.");
            }

            _logger.LogInformation("ToffersTunes http trigger FetchAuthorizationCode function finished processing a request.");

            return response;
        }

        private Dictionary<string, string> GetQueryParams(string query)
        {
            var queryParams = new Dictionary<string, string>();

            if (!string.IsNullOrEmpty(query))
            {
                var pairs = query.TrimStart('?').Split('&');

                foreach (var pair in pairs)
                {
                    var parts = pair.Split('=');
                    if (parts.Length == 2)
                    {
                        var key = Uri.UnescapeDataString(parts[0]);
                        var value = Uri.UnescapeDataString(parts[1]);
                        queryParams[key] = value;
                    }
                }
            }

            return queryParams;
        }
    }
}
