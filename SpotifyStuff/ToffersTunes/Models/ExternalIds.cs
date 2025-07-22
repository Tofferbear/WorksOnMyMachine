using Newtonsoft.Json;

namespace ToffersTunes.Models
{
    public class ExternalIds
    {
        [JsonProperty(PropertyName = "isrc")]
        public string? Isrc { get; set; } = default;
    }
}
