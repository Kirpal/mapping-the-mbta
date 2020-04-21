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
        public static class Actual
        {
            // updates the current state of the network based on vehicle statuses
            // will modify the Sources.Today dataset
            public static async Task Update()
            {
                // 1. get vehicle json
                // 2. search for all trips with a vehicle status "stopped_at"
                // 3. if that trip hasn't been marked as complete, complete it
                List<Task<string>> pending = new List<Task<string>>();

                // add each route to the queue
                foreach (var route in Route.Routes)
                    pending.Add(new MBTAWeb().FetchJSONAsync(MBTAWeb.Endpoint.vehicles, $"?filter[route]={route.Key}"));

                // process the queue
                foreach (var item in pending)
                    ProcessData(await item);
            }

            private static void ProcessData(string jsonVehicles)
            {
                var dataVehicles = JsonConvert.DeserializeObject<dynamic>(jsonVehicles).data;
                foreach (var vehicle in dataVehicles)
                {
                    // only concerned with vehicles currently at stations
                    if (vehicle.attributes.current_status == "STOPPED_AT")
                    {
                        string tripID = vehicle.relationships.trip.data.id;
                        // get this vehicle's trip (if it doesn't exist, ignore it)
                        Trip curTrip = Today.Trips.SingleOrDefault(x => x.TripID == tripID);
                        if (curTrip != null)
                        {
                            string gtfs = vehicle.relationships.stop.data.id;
                            // get this vehicle's stop (if it doesn't exist, ignore it)
                            // also make sure it has an arrival time (if not, ignore it)
                            Stop curStop = curTrip.Stops.SingleOrDefault(x => x.Station.GTFS == gtfs);
                            if (curStop != null && curStop.Arrival != 0)
                            {
                                // complete it only if it has not already been completed (delta is null)
                                // otherwise, continue completion (update departure time)
                                if (curStop.Delta == null)
                                    curStop.Complete();
                                else
                                    curStop.ContinueCompletion();
                            }
                        }
                    }
                }
            }
        }
    }
}