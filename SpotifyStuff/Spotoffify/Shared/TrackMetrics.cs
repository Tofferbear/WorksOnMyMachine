using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Spotoffify.Shared
{
    public class TrackMetrics
    {
        public string TrackName { get; set; } = string.Empty;
        public string ArtistName { get; set; } = string.Empty;
        public int PlayCount { get; set; }

        // Helper for the chart label: "Song Title - Artist"
        public string Label => $"{TrackName} ({ArtistName})";
    }
}
