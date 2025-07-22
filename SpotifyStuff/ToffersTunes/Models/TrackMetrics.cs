using Newtonsoft.Json;

namespace ToffersTunes.Models
{
    public class TrackMetrics
    {
        [JsonProperty(PropertyName = "album")]
        public Album? Album { get; set; } = default;

        [JsonProperty(PropertyName = "duration_ms")]
        public int DurationMilliseconds { get; set; } = default;

        [JsonProperty(PropertyName = "play_count")]
        public int PlayCount { get; set; } = default;

        [JsonProperty(PropertyName = "played_at")]
        public DateTime PlayedAt { get; set; } = default;

        [JsonProperty(PropertyName = "name")]
        public string? Name { get; set; } = default;

        [JsonProperty(PropertyName = "id")]
        public string? TrackId { get; set; } = default;
    }
}
