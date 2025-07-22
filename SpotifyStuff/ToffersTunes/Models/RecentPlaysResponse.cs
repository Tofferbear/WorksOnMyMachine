using Newtonsoft.Json;

namespace ToffersTunes.Models
{
    public class RecentPlaysResponse
    {
        [JsonProperty(PropertyName = "items")]
        public List<TrackPlay> Items { get; set; } = new List<TrackPlay>();
    }
}
