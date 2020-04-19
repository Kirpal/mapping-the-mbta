using MappingTheMBTA.Data;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MappingTheMBTA
{
    public class LiveData
    {
        public List<Trip> Trips { get; set; }
    }

    public class Trip
    {
        public List<Prediction> Stations { get; set; }

        public string Line { get; set; }

        public string TripID { get; set; }
        public string VehicleID { get; set; }

        public ulong StartTime { get; set; } // time in unix
        public ulong EndTime { get; set; } // time in unix

        public string Destination { get; set; }
    }

    public class Prediction
    {
        public Station Station { get; set; }

        public ulong ArrivalEst { get; set; } // time in unix
        public ulong DepartureEst { get; set; } // time in unix
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
            // 0 = light rail (GL, Mattapan)
            // 1 = subway
            int[] types = new int[] { 0, 1 };

            foreach(int type in types)
            {
                string json = MBTA.FetchJSON(MBTA.Endpoint.routes, $"?filter[type]={type}");
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
