using FluentScheduler;
using MappingTheMBTA.Models;
using MappingTheMBTA.Data;
using System.Threading.Tasks;

namespace MappingTheMBTA
{
    public class Scheduler : Registry
    {
        public Scheduler()
        {
            // Populate the routes model, freeze thread until it's done
            Route.Populate().Wait();

            // Run the data updater now & every 30 seconds
            Schedule<UpdatePredictions>().ToRunNow().AndEvery(30).Seconds();

            // Run the data updater now & every 10 seconds
            Schedule<UpdateActual>().ToRunNow().AndEvery(10).Seconds();

            // Run the schedule updater now & every day at 4AM
            Schedule<UpdateScheduled>().ToRunNow().AndEvery(1).Days().At(4, 00);
        }

        private class UpdatePredictions : IJob
        {
            public void Execute()
            {
                Predicted.Update();
            }
        }

        private class UpdateActual : IJob
        {
            public void Execute()
            {
                Sources.Actual.Update();
            }
        }

        private class UpdateScheduled : IJob
        {
            public void Execute()
            {
                Sources.Scheduled.Update();
            }
        }
    }
}
