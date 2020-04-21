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
                    EffectiveDate = DateTime.Today,
                    Trips = new List<Trip>()
                };

                List<Trip> trips = new List<Trip>();

                List<Tuple<Task<string>, KeyValuePair<string, string[]>>> pending = new List<Tuple<Task<string>, KeyValuePair<string, string[]>>>();

                // foreach route in route -> foreach trip in schedule -> add trip
                foreach (var route in Route.Routes)
                {
                    pending.Add(Tuple.Create(new MBTAWeb().FetchJSONAsync(MBTAWeb.Endpoint.schedules, $"?filter[route]={route.Key}"), route));
                }

                // unpack the pending queue
                // await each tuple's json -> process it -> store it
                foreach (Tuple<Task<string>, KeyValuePair<string, string[]>> item in pending)
                {
                    string json = await item.Item1;
                    trips.AddRange(ProcessRoute(json, item.Item2));
                }

                // add start/end times to each trip
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

                result.Trips = trips;
                Today = result;
            }

            private static List<Trip> ProcessRoute(string jsonRoutes, KeyValuePair<string, string[]> route)
            {
                List<Trip> trips = new List<Trip>();

                var dataSchedule = JsonConvert.DeserializeObject<dynamic>(jsonRoutes).data;
                foreach (var schedule in dataSchedule)
                {
                    string tripId = schedule.relationships.trip.data.id;
                    if (!trips.Any(x => x.TripID == tripId))
                    {
                        trips.Add(new Trip()
                        {
                            Stations = new List<Stop>(),
                            Line = route.Key,
                            VehicleID = tripId, // vehicle ID == trip ID for the purposes of scheduled data
                            StartTime = 0,
                            EndTime = 0,
                            TripID = tripId,
                            Destination = route.Value[schedule.attributes.direction_id],
                        });
                    }

                    var tripToAdd = trips.Single(x => x.TripID == tripId);
                    string GTFS = schedule.relationships.stop.data.id;
                    var scheduleToAdd = new Stop()
                    {
                        Station = new Station()
                        {
                            GTFS = GTFS,
                            PlaceID = Utils.ResolveGTFS(GTFS)
                        }
                    };

                    if (schedule.attributes.arrival_time != null)
                        scheduleToAdd.Arrival = Utils.ParseTime(schedule.attributes.arrival_time);
                    if (schedule.attributes.departure_time != null)
                        scheduleToAdd.Departure = Utils.ParseTime(schedule.attributes.departure_time);

                    tripToAdd.Stations.Add(scheduleToAdd);
                }

                return trips;
            }
        }
    }
}
