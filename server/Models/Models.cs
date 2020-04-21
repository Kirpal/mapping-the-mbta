using MappingTheMBTA.Data;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MappingTheMBTA.Models
{
    public class Dataset
    {
        public int EffectiveDate { get; set; } // in unix days
        public List<Trip> Trips { get; set; }

        public Dataset Clone() => (Dataset)MemberwiseClone();
    }

    public class Trip
    {
        public List<Stop> Stations { get; set; }

        public string Line { get; set; }

        public string TripID { get; set; }
        public string VehicleID { get; set; }

        public ulong StartTime { get; set; } // time in unix
        public ulong EndTime { get; set; } // time in unix

        public int DirectionID { get; set; } // the direction the trip is facing (inbound / outbound)
        public string Destination { get; set; }
    }

    public class Stop
    {
        public Station Station { get; set; }

        public ulong Arrival { get; set; } // time in unix, scheduled time then arrived time
        public ulong Departure { get; set; } // time in unix, scheduled time then arrived time
        public ulong? Delta { get; set; } // [arrived time - scheduled time] filled in after a train arrives
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

        public static async Task Populate()
        {
            // 0 = light rail
            // 1 = subway
            int[] types = new int[] { 0, 1 };

            List<Tuple<Task<string>, int>> pending = new List<Tuple<Task<string>, int>>();

            // add each type to queue
            foreach (int type in types)
                pending.Add(Tuple.Create(new MBTAWeb().FetchJSONAsync(MBTAWeb.Endpoint.routes, $"?filter[type]={type}"), type));

            // process the queue
            foreach (var item in pending)
                ProcessLine(await item.Item1);
        }

        private static void ProcessLine(string jsonLine)
        {
            var data = JsonConvert.DeserializeObject<dynamic>(jsonLine).data;
            foreach (var route in data)
            {
                string id = route.id;

                // ignore Mattapan
                if (id != "Mattapan")
                {
                    string[] dirs = route.attributes.direction_destinations.ToObject<string[]>();
                    Routes.Add(id, dirs);
                }
            }
        }
    }
}