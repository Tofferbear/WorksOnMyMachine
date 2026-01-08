using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json.Serialization;

namespace Spotoffify.Shared;

// A single play instance
public record PlayHistoryItem(
    TrackDetails Track,
    [property: JsonPropertyName("played_at")] DateTime PlayedAt,
    Context? Context
);
