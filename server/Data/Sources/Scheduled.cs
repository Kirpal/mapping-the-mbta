using MappingTheMBTA.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MappingTheMBTA.Data
{
    public static partial class Sources
    {
        public static class Scheduled
        {
            public static async Task Update()
            {
                Dataset result = new Dataset()
                {
                    EffectiveDate = DateTime.Now.ConvertToEffective(),
                    Trips = new List<Trip>()
                };

                List<Tuple<Task<string>, KeyValuePair<string, string[]>>> pending = new List<Tuple<Task<string>, KeyValuePair<string, string[]>>>();

                // add each route to the queue
                foreach (var route in Route.Routes)
                    pending.Add(Tuple.Create(new MBTAWeb().FetchJSONAsync(MBTAWeb.Endpoint.schedules, $"?filter[route]={route.Key}"), route));

                // process the queue
                foreach (Tuple<Task<string>, KeyValuePair<string, string[]>> item in pending)
                    result.Trips.AddRange(ProcessData(await item.Item1, item.Item2));

                Today = result;
            }

            private static List<Trip> ProcessData(string jsonRoute, KeyValuePair<string, string[]> route)
            {
                List<Trip> trips = new List<Trip>();

                var dataSchedule = JsonConvert.DeserializeObject<dynamic>(jsonRoute).data;
                foreach (var schedule in dataSchedule)
                {
                    string tripID = schedule.relationships.trip.data.id;
                    // if the trip doesn't exist yet, add it
                    Trip tripToAdd = trips.SingleOrDefault(x => x.TripID == tripID);
                    if (tripToAdd == default)
                    {
                        tripToAdd = new Trip()
                        {
                            Stations = new List<Stop>(),
                            Line = route.Key,
                            TripID = tripID,
                            VehicleID = tripID, // vehicle ID = trip ID for the purposes of scheduled data

                            StartTime = 0,
                            EndTime = 0,

                            DirectionID = schedule.attributes.direction_id,
                            Destination = route.Value[schedule.attributes.direction_id]
                        };
                        trips.Add(tripToAdd);
                    }
                    string GTFS = schedule.relationships.stop.data.id;

                    var stopToAdd = new Stop()
                    {
                        Station = new Station()
                        {
                            GTFS = GTFS,
                            PlaceID = Utils.ResolveGTFS(GTFS)
                        },
                        Delta = null
                    };

                    if (schedule.attributes.arrival_time != null)
                        stopToAdd.Arrival = Utils.ConvertToSeconds(schedule.attributes.arrival_time);
                    if (schedule.attributes.departure_time != null)
                        stopToAdd.Departure = Utils.ConvertToSeconds(schedule.attributes.departure_time);

                    tripToAdd.Stations.Add(stopToAdd);
                }

                trips.ConfigTimes();

                return trips;
            }
        }
    }
}
