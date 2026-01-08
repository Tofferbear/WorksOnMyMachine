using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;

namespace Spotoffify.Shared;

public class SpotifyService
{
    private readonly HttpClient _httpClient;

    private const string TokenUrl = "https://accounts.spotify.com/api/token";

    private const string RecentlyPlayedUrl = "https://api.spotify.com/v1/me/player/recently-played?limit=50";

    public SpotifyService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    // Task 1: Get a fresh Access Token using your stored Refresh Token
    public async Task<(string AccessToken, string? NewRefreshToken)> RefreshAccessTokenAsync(
        string clientId, string clientSecret, string refreshToken)
    {
        var requestBody = new FormUrlEncodedContent(new[]
        {
            new KeyValuePair<string, string>("grant_type", "refresh_token"),
            new KeyValuePair<string, string>("refresh_token", refreshToken)
        });

        // Spotify requires Basic Auth header: base64(client_id:client_secret)
        var authHeader = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{clientId}:{clientSecret}"));
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", authHeader);

        var response = await _httpClient.PostAsync(TokenUrl, requestBody);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadFromJsonAsync<JsonElement>();

        return (
            json.GetProperty("access_token").GetString()!,
            json.TryGetProperty("refresh_token", out var newRef) ? newRef.GetString() : null
        );
    }

    // Task 2: Fetch the actual play data
    public async Task<List<TrackedPlay>> GetRecentlyPlayedAsync(string accessToken)
    {
        var request = new HttpRequestMessage(HttpMethod.Get, RecentlyPlayedUrl);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        var response = await _httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();

        var data = await response.Content.ReadFromJsonAsync<SpotifyRecentPlaysResponse>();

        if (data?.Items == null) return new List<TrackedPlay>();

        // Map the Spotify raw JSON to our clean "TrackedPlay" model
        return data.Items.Select(item => new TrackedPlay
        {
            TrackId = item.Track.Id,
            TrackName = item.Track.Name,
            ArtistName = item.Track.Artists.FirstOrDefault()?.Name ?? "Unknown",
            AlbumName = item.Track.Album.Name,
            AlbumImageUrl = item.Track.Album.Images.FirstOrDefault()?.Url ?? "",
            PlayedAt = item.PlayedAt
        }).ToList();
    }
}