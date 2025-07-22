using Newtonsoft.Json;

namespace ToffersTunes.Models
{
    public class Track
    {
        [JsonProperty(PropertyName = "album")]
        public Album? Album { get; set; } = default;

        [JsonProperty(PropertyName = "artists")]
        public List<Artist>? Artists { get; set; } = default;

        [JsonProperty(PropertyName = "available_markets")]
        public List<string>? AvailableMarkets { get; set; } = default;

        [JsonProperty(PropertyName = "disc_number")]
        public int DiscNumber { get; set; } = default;

        [JsonProperty(PropertyName = "duration_ms")]
        public int DurationMilliseconds { get; set; } = default;

        [JsonProperty(PropertyName = "explicit")]
        public bool Explicit { get; set; } = default;

        [JsonProperty(PropertyName = "external_ids")]
        public ExternalIds? ExternalIds { get; set; } = default;

        [JsonProperty(PropertyName = "external_urls")]
        public ExternalUrl? ExternalUrl { get; set; } = default;

        [JsonProperty(PropertyName = "href")]
        public string? Href { get; set; } = default;

        [JsonProperty(PropertyName = "id")]
        public string? Id { get; set; } = default;

        [JsonProperty(PropertyName = "is_local")]
        public bool IsLocal { get; set; } = default;

        [JsonProperty(PropertyName = "name")]
        public string? Name { get; set; } = default;

        [JsonProperty(PropertyName = "popularity")]
        public int Popularity { get; set; } = default;

        [JsonProperty(PropertyName = "preview_url")]
        public string? PreviewUrl { get; set; } = default;

        [JsonProperty(PropertyName = "track_number")]
        public int TrackNumber { get; set; } = default;

        [JsonProperty(PropertyName = "type")]
        public string? TrackType { get; set; } = default;

        [JsonProperty(PropertyName = "uri")]
        public string? Uri { get; set; } = default;
    }
}
