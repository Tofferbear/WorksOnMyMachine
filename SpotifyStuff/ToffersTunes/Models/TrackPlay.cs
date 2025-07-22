using Newtonsoft.Json;

namespace ToffersTunes.Models
{
    public class TrackPlay
    {
        [JsonProperty(PropertyName = "context")]
        public Context? Context { get; set; } = default;

        [JsonProperty(PropertyName = "played_at")]
        public DateTime PlayedAt { get; set; } = default;

        [JsonProperty(PropertyName = "track")]
        public Track? Track { get; set; } = default;
    }
}
