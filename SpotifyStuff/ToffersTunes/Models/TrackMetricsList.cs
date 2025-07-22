using System;

namespace ToffersTunes.Models
{
    public class TrackMetricsList : List<TrackMetrics>
    {
        public TrackMetricsList() : base(new TrackMetrics[0]) { }

        public TrackMetricsList(IEnumerable<TrackMetrics> trackMetricsCollection) : base(trackMetricsCollection) { }

        public bool ContainsTrackId(string trackId)
        {
            foreach (var listItem in this)
            {
                if (listItem.TrackId == trackId)
                {
                    return true;
                }
            }

            return false;
        }

        public TrackMetrics this[string trackId]
        {
            get
            {
                if (!string.IsNullOrWhiteSpace(trackId) && this.ContainsTrackId(trackId))
                {
                    return this.FirstOrDefault(tm => tm.TrackId == trackId)!;
                }

                return default!;
            }
        }
    }
}
