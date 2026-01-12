using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json.Serialization;

namespace Spotoffify.Shared;

public record TrackedPlay
{
    // We use a composite ID (TrackId + PlayedAt) to prevent duplicates in the DB
    public string Id => $"{TrackId}_{PlayedAt:yyyyMMddHHmmss}";

    public string TrackId { get; init; } = string.Empty;

    public string TrackName { get; init; } = string.Empty;

    public string ArtistName { get; init; } = string.Empty;

    public string AlbumName { get; init; } = string.Empty;

    public string AlbumImageUrl { get; init; } = string.Empty;

    public int DurationMs { get; init; }

    [JsonPropertyName("played_at")]
    public DateTime PlayedAt { get; init; }

    // custom "Toffer" metadata
    public int TofferVibeScore { get; set; } // Example custom property
}
