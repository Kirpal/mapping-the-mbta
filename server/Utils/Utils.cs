using MappingTheMBTA.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace MappingTheMBTA
{
    public static class Utils
    {
        private static readonly Dictionary<string, string> Places = JsonConvert.DeserializeObject<Dictionary<string, string>>(File.ReadAllText(@"stations.json"));

        // Converts the dynamic DateTime format into unix time
        public static ulong ConvertToSeconds(dynamic timestamp)
        {
            var time = (DateTime)timestamp;
            return (ulong)time.Subtract(new DateTime(1970, 1, 1)).TotalSeconds;
        }

        // Converts the dynamic DateTime format into unix time
        public static int ConvertToDays(dynamic timestamp)
        {
            var time = (DateTime)timestamp;
            return (int)time.Subtract(new DateTime(1970, 1, 1)).TotalDays;
        }

        // Converts a given DateTime to the effective data date (adjusted for 4AM cutoff)
        public static int ConvertToEffective(this DateTime time)
        {
            DateTime effective = time;
            if (effective.Hour < 4)
                effective.AddDays(-1);
            return ConvertToDays(effective);
        }

        // Resolves the api's GTFS location into our place-ID format
        public static string ResolveGTFS(string GTFS)
        {
            if (!Places.TryGetValue(GTFS, out string result))
                return "";

            return result;
        }

        // enforces that each trip's start/end times are correct
        public static void ConfigTimes(this List<Trip> trips)
        {
            foreach (Trip trip in trips)
            {
                List<ulong> times = new List<ulong>();
                foreach (Stop pred in trip.Stations)
                {
                    times.Add(pred.Arrival);
                    times.Add(pred.Departure);
                }
                var nonzero = times.Where(x => x != 0);
                if (nonzero.Count() > 0)
                {
                    trip.StartTime = nonzero.Min(x => x);
                    trip.EndTime = nonzero.Max(x => x);
                }
            }
        }
    }
}
