using MappingTheMBTA.Data;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;

namespace MappingTheMBTA.Models
{
    public class Dataset
    {
        public List<Trip> Trips { get; set; }
        public DateTime EffectiveDate { get; set; }
    }

    public class Trip
    {
        public List<Stop> Stations { get; set; }

        public string Line { get; set; }

        public string TripID { get; set; }
        public string VehicleID { get; set; }

        public ulong StartTime { get; set; } // time in unix
        public ulong EndTime { get; set; } // time in unix

        public string Destination { get; set; }
    }

    public class Stop
    {
        public Station Station { get; set; }

        public ulong Arrival { get; set; } // time in unix
        public ulong Departure { get; set; } // time in unix
        public Boolean OnTime { get; set; } // did this train arrive +- 3 minutes of its scheduled time?
    }

    public class Station
    {
        public string GTFS { get; set; } // gtfs id
        public string PlaceID { get; set; } // front end format (i.e "place-<station code>")
    }

    // at startup, fetches the list of routes & their termini from the mbta
    public static class Route
    {
        public static Dictionary<string, string[]> Routes = new Dictionary<string, string[]>();

        public static void Populate()
        {
            // 0 = light rail
            // 1 = subway
            int[] types = new int[] { 0, 1 };

            foreach(int type in types)
            {
                string json = MBTAWeb.FetchJSON(MBTAWeb.Endpoint.routes, $"?filter[type]={type}");
                var data = JsonConvert.DeserializeObject<dynamic>(json).data;
                foreach (var route in data)
                {
                    string id = route.id;
                    string[] dirs = route.attributes.direction_destinations.ToObject<string[]>();
                    Routes.Add(id, dirs);
                }
            }
        }
    }
}
