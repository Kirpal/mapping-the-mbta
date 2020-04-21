using MappingTheMBTA.Models;
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
            public static void Update()
            {
                // 1. get vehicle json
                // 2. search for all trips with a vehicle status "stopped_at"
                // 3. if that trip hasn't been marked as complete, complete it and record time delta
                // 4. add the time difference to the departure time
                
            }
        }
    }
}
