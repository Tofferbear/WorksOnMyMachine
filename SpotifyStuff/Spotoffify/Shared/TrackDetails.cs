using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json.Serialization;

namespace Spotoffify.Shared;

// The track information we actually care about
public record TrackDetails(
    string Id,
    string Name,
    [property: JsonPropertyName("duration_ms")] int DurationMs,
    List<Artist> Artists,
    Album Album
);
