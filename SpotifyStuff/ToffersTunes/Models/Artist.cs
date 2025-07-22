using Newtonsoft.Json;

namespace ToffersTunes.Models
{
    public class Artist
    {
        [JsonProperty(PropertyName = "type")]
        public string? ArtistType { get; set; } = default;

        [JsonProperty(PropertyName = "external_urls")]
        public ExternalUrl? ExternalUrl { get; set; } = default;

        [JsonProperty(PropertyName = "href")]
        public string? Href { get; set; } = default;

        [JsonProperty(PropertyName = "id")]
        public string? Id { get; set; } = default;

        [JsonProperty(PropertyName = "name")]
        public string? Name { get; set; } = default;

        [JsonProperty(PropertyName = "uri")]
        public string? Uri { get; set; } = default;
    }
}
