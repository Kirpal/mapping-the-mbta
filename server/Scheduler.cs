using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluentScheduler;

namespace MappingTheMBTA
{
    public class Scheduler : Registry
    {
        public Scheduler()
        {
            // Run the data updater now & every 30 seconds
            Schedule<UpdateFeed>().ToRunNow().AndEvery(30).Seconds();
        }
    }

    public class UpdateFeed : IJob
    {
        public void Execute()
        {
            // Run all of the update methods
            Data.Live.UpdateData();
        }
    }
}
