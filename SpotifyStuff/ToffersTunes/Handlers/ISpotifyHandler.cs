using ToffersTunes.Models;

namespace ToffersTunes.Handlers
{
    public interface ISpotifyHandler
    {
        string AuthorizationCode { get; set; }

        List<TrackPlay> HistoricTrackPlays { get; set; }

        Task<RecentPlaysResponse> GetRecentPlaysAsync(int playsToFetch = 20);

        List<TrackPlay> UpdateHistoricPlaysWithNewPlays(List<TrackPlay> newPlays, List<TrackPlay> historicPlays);

        Task UpdateTrackMetricsAsync(string historicPlaysFullPath, string playCountsFullPath);
    }
}
