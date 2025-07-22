using Newtonsoft.Json;

namespace ToffersTunes.Models
{
    public class Image
    {
        [JsonProperty(PropertyName = "height")]
        public int Height { get; set; } = default;

        [JsonProperty(PropertyName = "url")]
        public string? Url { get; set; } = default;

        [JsonProperty(PropertyName = "width")]
        public int Width { get; set; } = default;
    }
}
