namespace Spotoffify.Shared;

public class HeatmapPoint
{
    // 0 = Sunday, 1 = Monday, ... 6 = Saturday
    public int DayOfWeek { get; set; }

    // 0 to 23
    public int HourOfDay { get; set; }

    public int PlayCount { get; set; }
}
