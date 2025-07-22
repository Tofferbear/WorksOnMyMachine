using Newtonsoft.Json;

namespace ToffersTunes.Models
{
    public class Album
    {
        [JsonProperty(PropertyName = "album_type")]
        public string? AlbumType { get; set; } = default;

        [JsonProperty(PropertyName = "type")]
        public string? AlbumType2 { get; set; } = default;

        [JsonProperty(PropertyName = "artists")]
        public List<Artist>? Artists { get; set; } = default;

        [JsonProperty(PropertyName = "available_markets")]
        public List<string>? AvailableMarkets { get; set; } = default;

        [JsonProperty(PropertyName = "external_urls")]
        public ExternalUrl? ExternalUrl { get; set; } = default;

        [JsonProperty(PropertyName = "href")]
        public string? Href { get; set; } = default;

        [JsonProperty(PropertyName = "id")]
        public string? Id { get; set; } = default;

        [JsonProperty(PropertyName = "images")]
        public List<Image>? Images { get; set; } = default;

        [JsonProperty(PropertyName = "name")]
        public string? Name { get; set; } = default;

        [JsonProperty(PropertyName = "release_date")]
        public string? ReleaseDate { get; set; } = default;

        [JsonProperty(PropertyName = "release_date_precision")]
        public string? ReleaseDatePrecision { get; set; } = default;

        [JsonProperty(PropertyName = "total_tracks")]
        public int TotalTracks { get; set; } = default;

        [JsonProperty(PropertyName = "uri")]
        public string? Uri { get; set; } = default;
    }
}
