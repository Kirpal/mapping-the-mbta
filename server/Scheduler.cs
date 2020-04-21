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
            // Populate the schedule for the first time, freeze thread until it's done
            Sources.Scheduled.Update().Wait();

            // Run the prediction updater now & every 30 seconds
            Schedule<UpdatePredictions>().ToRunNow().AndEvery(30).Seconds();

            // Run the data updater now & every 3 seconds
            Schedule<UpdateActual>().ToRunNow().AndEvery(3).Seconds();

            // Run the schedule updater every day at 4AM
            Schedule<UpdateScheduled>().ToRunEvery(1).Days().At(4, 00);
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
