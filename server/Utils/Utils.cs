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
        // key = gtfs id
        // value = place id
        private static readonly Dictionary<string, string> Places = JsonConvert.DeserializeObject<Dictionary<string, string>>(File.ReadAllText(@"stations.json"));

        // Converts the dynamic DateTime format into unix time
        public static long ConvertToSeconds(dynamic timestamp) => ((DateTime)timestamp).ToUnixSeconds();

        // Converts the dynamic DateTime format into unix time
        public static int ConvertToDays(dynamic timestamp) => ((DateTime)timestamp).ToUnixDays();

        // Converts a given DateTime to the effective data date (adjusted for 4AM cutoff)
        public static int ConvertToEffective(this DateTime time)
        {
            DateTime effective = time;
            if (effective.Hour < 4)
                effective.AddDays(-1);
            return ConvertToDays(effective);
        }

        public static long ToUnixSeconds(this DateTime time) => (long)time.Subtract(new DateTime(1970, 1, 1)).TotalSeconds;
        public static int ToUnixDays(this DateTime time) => (int)time.Subtract(new DateTime(1970, 1, 1)).TotalDays;

        // Resolves the api's GTFS location to place-ID format
        public static string ResolveGTFS(string GTFS)
        {
            if (!Places.TryGetValue(GTFS, out string result))
                return "";

            return result;
        }

        // To complete a Stop:
        // 1. Delta = [now - arrival]
        // 2. Departure time = now
        // 3. Arrival time = now
        public static void Complete(this Stop stop)
        {
            stop.Delta = DateTime.Now.ToUnixSeconds() - stop.Arrival;
            if (stop.Departure != 0)
                stop.Departure = DateTime.Now.ToUnixSeconds();
            stop.Arrival = DateTime.Now.ToUnixSeconds();
        }

        // This stop has already completed, but the vehicle is still there
        // Update the departed field
        public static void ContinueCompletion(this Stop stop)
        {
            if (stop.Departure != 0)
                stop.Departure = DateTime.Now.ToUnixSeconds();
        }

        // enforces that each trip's start/end times are correct
        public static void ConfigTimes(this List<Trip> trips)
        {
            foreach (Trip trip in trips)
            {
                List<long> times = new List<long>();
                foreach (Stop pred in trip.Stops)
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
