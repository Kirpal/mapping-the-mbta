using FluentScheduler;
using MappingTheMBTA.Models;
using MappingTheMBTA.Data;

namespace MappingTheMBTA
{
    public class Scheduler : Registry
    {
        public Scheduler()
        {
            // Populate the routes model
            Schedule(() => Route.Populate()).ToRunNow();

            // Run the data updater now & every 30 seconds
            Schedule<UpdateData>().ToRunNow().AndEvery(30).Seconds();

            // Run the data capturer every minute
            Schedule<CaptureData>().ToRunEvery(1).Minutes();
        }

        private class UpdateData : IJob
        {
            public void Execute()
            {
                // Run all of the update methods
                Predictions.UpdateData();
            }
        }

        private class CaptureData : IJob
        {
            public void Execute()
            {
                Actual.CaptureData();
            }
        }
    }
}
