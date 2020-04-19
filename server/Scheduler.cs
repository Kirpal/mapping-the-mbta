using FluentScheduler;
using MappingTheMBTA.Models;
using MappingTheMBTA.Data;
using System.Threading;
using System.Threading.Tasks;

namespace MappingTheMBTA
{
    public class Scheduler : Registry
    {
        public Scheduler()
        {
            // Populate the routes model, freeze thread until it's done
            Task t = Route.Populate();
            t.Wait();

            // Run the data updater now & every 30 seconds
            Schedule<UpdateData>().ToRunNow().AndEvery(30).Seconds();

            // Run the data capturer every minute
            Schedule<CaptureData>().ToRunEvery(1).Minutes();

            // Run the schedule capturer now & every day at 4AM
            Schedule<CaptureSchedule>().ToRunNow().AndEvery(1).Days().At(4, 00);
        }

        private class UpdateData : IJob
        {
            public void Execute()
            {
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

        private class CaptureSchedule : IJob
        {
            public void Execute()
            {
                Scheduled.CaptureSchedule();
            }
        }
    }
}
