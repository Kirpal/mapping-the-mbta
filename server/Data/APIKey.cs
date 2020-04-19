using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MappingTheMBTA.Data
{
    public static class APIKey
    {
        public static string Key = Environment.GetEnvironmentVariable("MBTA_KEY");
        public static string Encoded = $"&api_key={Key}";
    }
}
