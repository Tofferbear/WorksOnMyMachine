namespace Spotoffify.Shared
{
    public class DashboardStats
    {
        public int TotalPlays { get; set; }

        public double TotalMinutesListened { get; set; }

        public TrackedPlay? LongestTrack { get; set; }

        public TrackedPlay? ShortestTrack { get; set; }
    }
}
