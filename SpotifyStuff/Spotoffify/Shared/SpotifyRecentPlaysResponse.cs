namespace Spotoffify.Shared;

// The top-level response from Spotify's /recently-played endpoint
public record SpotifyRecentPlaysResponse(
    List<PlayHistoryItem> Items,
    string Next,
    string Href
);
