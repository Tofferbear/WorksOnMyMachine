using Newtonsoft.Json;

namespace ToffersTunes.Models
{
    public class Context
    {
        [JsonProperty(PropertyName = "type")]
        public string? ContextType { get; set; } = default;

        [JsonProperty(PropertyName = "external_urls")]
        public ExternalUrl? ExternalUrl { get; set; } = default;

        [JsonProperty(PropertyName = "href")]
        public string? Href { get; set; } = default;

        [JsonProperty(PropertyName = "uri")]
        public string? Uri { get; set; } = default;
    }
}
