using Spotoffify.Shared;
using System.Net.Http.Json;

namespace Spotoffify.Client.Services
{
    public class UiSpotifyService
    {
        private readonly HttpClient _http;

        public UiSpotifyService(HttpClient http)
        {
            _http = http;
        }

        // This calls your Azure Function: /api/GetRecentPlays
        public async Task<List<TrackedPlay>> GetMyHistory()
        {
            try
            {
                // The BaseAddress is already handled in Program.cs
                var result = await _http.GetFromJsonAsync<List<TrackedPlay>>("api/GetRecentPlays");
                return result ?? new List<TrackedPlay>();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching history: {ex.Message}");
                return new List<TrackedPlay>();
            }
        }

        public async Task<List<ArtistMetrics>> GetTopArtists(int count = 5)
        {
            try
            {
                // 👇 Passes the count to the API
                var result = await _http.GetFromJsonAsync<List<ArtistMetrics>>($"api/GetTopArtists?count={count}");
                return result ?? new List<ArtistMetrics>();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching metrics: {ex.Message}");
                return new List<ArtistMetrics>();
            }
        }

        public async Task<List<HeatmapPoint>> GetHeatmapData()
        {
            // Calls our new API endpoint
            return await _http.GetFromJsonAsync<List<HeatmapPoint>>("api/GetHeatmapData")
                   ?? new List<HeatmapPoint>();
        }

        public async Task<DashboardStats> GetDashboardStats()
        {
            return await _http.GetFromJsonAsync<DashboardStats>("api/GetDashboardStats")
                   ?? new DashboardStats();
        }

        public async Task<List<TrackMetrics>> GetTopTracks(int count)
        {
            return await _http.GetFromJsonAsync<List<TrackMetrics>>($"api/GetTopTracks/{count}")
                   ?? new List<TrackMetrics>();
        }

        public async Task ShuffleMix(string sourceId, string targetId)
        {
            // Just send the IDs. The API handles the auth internally.
            await _http.PostAsJsonAsync("api/ShuffleMix", new { SourcePlaylistId = sourceId, TargetPlaylistId = targetId });
        }
    }
}
