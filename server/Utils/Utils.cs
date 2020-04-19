using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;

namespace MappingTheMBTA
{
    public static class Utils
    {
        private static Dictionary<string, string> Places = JsonConvert.DeserializeObject<Dictionary<string, string>>(File.ReadAllText(@"stations.json"));

        // Converts the dynamic DateTime format into unix time
        public static ulong ParseTime(dynamic timestamp)
        {
            var time = (DateTime)timestamp;

            return (ulong)time.Subtract(new DateTime(1970, 1, 1)).TotalSeconds;
        }

        // Resolves the api's GTFS location into our place-ID format
        public static string ResolveGTFS(string GTFS)
        {
            string result;
            if (!Places.TryGetValue(GTFS, out result))
                return "";

            return result;
        }
    }
}
