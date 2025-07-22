using Newtonsoft.Json;

namespace ToffersTunes.Models
{
    public class ExternalUrl
    {
        [JsonProperty(PropertyName = "spotify")]
        public string? Spotify { get; set; } = default;
    }
}
