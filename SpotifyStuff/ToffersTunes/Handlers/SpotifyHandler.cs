using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Net.Http.Headers;
using ToffersTunes.Models;

namespace ToffersTunes.Handlers
{
    public class SpotifyHandler : ISpotifyHandler
    {
        public const string REDIRECT_URI = "http://localhost:7071/api/FetchAuthorizationCode";

        private readonly string _clientId;

        private readonly string _clientSecret;

        public SpotifyHandler(IConfiguration configuration)
        {
            _clientId = configuration["SpotifyAppClientId"];
            _clientSecret = configuration["SpotifyAppClientSecret"];

            AuthorizationCode = string.Empty;
            RefreshToken = string.Empty;
        }

        public string AuthorizationCode { get; set; }

        public List<TrackPlay> HistoricTrackPlays { get; set; } = new List<TrackPlay>();

        private string? RefreshToken { get; set; }

        public async Task<RecentPlaysResponse> GetRecentPlaysAsync(int playsToFetch = 20)
        {
            playsToFetch = playsToFetch < 1 ? 1 : playsToFetch > 50 ? 50 : playsToFetch;
            var recentPlaysResponse = new RecentPlaysResponse();
            var accessToken = await GetAccessToken();

            if (!string.IsNullOrWhiteSpace(accessToken))
            {
                using (var httpClient = new HttpClient())
                {
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
                    var apiUrl = $"https://api.spotify.com/v1/me/player/recently-played?limit={playsToFetch}";

                    var getResponse = await httpClient.GetAsync(apiUrl);
                    var contentString = await getResponse.Content.ReadAsStringAsync();

                    if (getResponse.IsSuccessStatusCode)
                    {
                        recentPlaysResponse = JsonConvert.DeserializeObject<RecentPlaysResponse>(contentString);
                    }
                }

                if (recentPlaysResponse == null)
                {
                    recentPlaysResponse = new RecentPlaysResponse();
                }
            }

            return recentPlaysResponse;
        }

        public List<TrackPlay> UpdateHistoricPlaysWithNewPlays(List<TrackPlay> newPlays, List<TrackPlay> historicPlays)
        {
            var updatedPlays = new List<TrackPlay>();

            if (historicPlays.Count == 0)
            {
                for (var i = newPlays.Count - 1; i >= 0; --i)
                {
                    updatedPlays.Add(newPlays[i]);
                }

                return updatedPlays;
            }

            for (var i = 0; i < historicPlays.Count; ++i)
            {
                updatedPlays.Add(historicPlays[i]);
            }

            var addEndIndex = -1;
            var lastUpdatedIndex = updatedPlays.Count - 1;

            for (var i = 0; i < newPlays.Count; ++i)
            {
                if (newPlays[i].Track?.Id == historicPlays[lastUpdatedIndex].Track?.Id &&
                    newPlays[i].PlayedAt == historicPlays[lastUpdatedIndex].PlayedAt)
                {
                    break;
                }
                else
                {
                    addEndIndex = i;
                    continue;
                }
            }

            if (addEndIndex > -1)
            {
                for (var i = addEndIndex; i >= 0; --i)
                {
                    updatedPlays.Add(newPlays[i]);
                }
            }

            return updatedPlays;
        }

        public async Task UpdateTrackMetricsAsync(string historicPlaysFullPath, string playCountsFullPath)
        {
            var historicTrackPlays = new List<TrackPlay>();
            var trackMetrics = new TrackMetricsList();

            if (File.Exists(historicPlaysFullPath))
            {
                historicTrackPlays = JsonConvert.DeserializeObject<List<TrackPlay>>(File.ReadAllText(historicPlaysFullPath)) ?? new List<TrackPlay>();
            }

            foreach (var trackPlay in historicTrackPlays)
            {
                if (trackMetrics.ContainsTrackId(trackPlay.Track.Id))
                {
                    trackMetrics[trackPlay.Track.Id].PlayCount++;
                }
                else
                {
                    trackMetrics.Add(new TrackMetrics
                    {
                        Album = trackPlay.Track.Album,
                        DurationMilliseconds = trackPlay.Track.DurationMilliseconds,
                        Name = trackPlay.Track.Name,
                        PlayCount = 1,
                        PlayedAt = trackPlay.PlayedAt,
                        TrackId = trackPlay.Track.Id
                    });
                }
            }

            File.Delete(playCountsFullPath);
            await File.WriteAllTextAsync(playCountsFullPath, JsonConvert.SerializeObject(trackMetrics));
        }

        private async Task<string> GetAccessToken()
        {
            var accessToken = string.Empty;
            var formValues = new Dictionary<string, string>();

            if (string.IsNullOrWhiteSpace(this.RefreshToken))
            {
                formValues.Add("grant_type", "authorization_code");
                formValues.Add("code", this.AuthorizationCode);
                formValues.Add("redirect_uri", REDIRECT_URI);
                formValues.Add("client_id", _clientId);
                formValues.Add("client_secret", _clientSecret);
            }
            else
            {
                formValues.Add("grant_type", "refresh_token");
                formValues.Add("refresh_token", this.RefreshToken);
                formValues.Add("client_id", _clientId);
                formValues.Add("client_secret", _clientSecret);
            }

            using (var httpClient = new HttpClient())
            {
                var postResponse = await httpClient.PostAsync("https://accounts.spotify.com/api/token", new FormUrlEncodedContent(formValues));
                var contentString = await postResponse.Content.ReadAsStringAsync();

                if (postResponse.IsSuccessStatusCode)
                {
                    var jsonResponse = JObject.Parse(contentString);
                    accessToken = jsonResponse["access_token"]?.ToString();

                    if (string.IsNullOrWhiteSpace(this.RefreshToken))
                    {
                        this.RefreshToken = jsonResponse["refresh_token"]?.ToString();
                    }
                }

                if (accessToken == null)
                {
                    accessToken = string.Empty;
                }
            }

            return accessToken;
        }
    }
}
