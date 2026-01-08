using System;
using System.Collections.Generic;
using System.Text;

namespace Spotoffify.Shared;

// The track information we actually care about
public record TrackDetails(
    string Id,
    string Name,
    int DurationMs,
    List<Artist> Artists,
    Album Album
);
