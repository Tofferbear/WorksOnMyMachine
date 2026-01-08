using System;
using System.Collections.Generic;
using System.Text;

namespace Spotoffify.Shared;

public record Album(string Id, string Name, List<SpotifyImage> Images);
