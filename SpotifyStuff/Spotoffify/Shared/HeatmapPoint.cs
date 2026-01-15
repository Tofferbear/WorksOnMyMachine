namespace Spotoffify.Shared
{
    public class HeatmapPoint
    {
        // Raw Data from Cosmos (Integers)
        public int DayId { get; set; }  // 0=Sunday, 1=Monday...
        public int HourId { get; set; } // 0-23
        public int PlayCount { get; set; }

        // Helper for the Chart Label
        // Converts "1" to "Monday" automatically
        public string DayName => System.Globalization.CultureInfo.CurrentCulture.DateTimeFormat.GetDayName((DayOfWeek)DayId);
    }
}
