using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using ToffersTunes.Handlers;
using ToffersTunes.Models;

namespace ToffersTunes.Functions
{
    public class FetchRecentPlays
    {
        private readonly string _historicPlaysFullPath;

        private readonly ILogger _logger;

        private readonly string _playCountsFullPath;

        private readonly ISpotifyHandler _spotifyhandler;

        public FetchRecentPlays(ILoggerFactory loggerFactory, ISpotifyHandler spotifyhandler, IConfiguration configuration)
        {
            _historicPlaysFullPath = configuration["HistoricPlaysFullPath"];
            _logger = loggerFactory.CreateLogger<FetchRecentPlays>();
            _playCountsFullPath = configuration["PlayCountsFullPath"];
            _spotifyhandler = spotifyhandler;
        }

        [Function("FetchRecentPlays")]
        public async Task RunAsync([TimerTrigger("0 */5 * * * *", RunOnStartup = true)] MyInfo myTimer)
        {
            if (!string.IsNullOrWhiteSpace(_spotifyhandler.AuthorizationCode))
            {
                if (File.Exists(_historicPlaysFullPath) && _spotifyhandler.HistoricTrackPlays.Count == 0)
                {
                    _spotifyhandler.HistoricTrackPlays = JsonConvert.DeserializeObject<List<TrackPlay>>(File.ReadAllText(_historicPlaysFullPath)) ?? new List<TrackPlay>();
                }

                var recentPlaysResponse = await _spotifyhandler.GetRecentPlaysAsync(50);
                _spotifyhandler.HistoricTrackPlays = _spotifyhandler.UpdateHistoricPlaysWithNewPlays(recentPlaysResponse.Items, _spotifyhandler.HistoricTrackPlays);
                await _spotifyhandler.UpdateTrackMetricsAsync(_historicPlaysFullPath, _playCountsFullPath);

                File.Delete(_historicPlaysFullPath);
                await File.WriteAllTextAsync(_historicPlaysFullPath, JsonConvert.SerializeObject(_spotifyhandler.HistoricTrackPlays));

                _logger.LogInformation($"Tracking Historic Plays of {_spotifyhandler.HistoricTrackPlays.Count} tracks.");
                _logger.LogInformation($"Next timer schedule at: {myTimer.ScheduleStatus?.Next.AddMinutes(5)}");
            }
        }
    }

    public class MyInfo
    {
        public MyScheduleStatus? ScheduleStatus { get; set; }

        public bool IsPastDue { get; set; }
    }

    public class MyScheduleStatus
    {
        public DateTime Last { get; set; }

        public DateTime Next { get; set; }

        public DateTime LastUpdated { get; set; }
    }
}
