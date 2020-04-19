using System.Collections.Generic;
using MappingTheMBTA.Models;
using MappingTheMBTA.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace MappingTheMBTA.Controllers
{
    [ApiController]
    //[Route("[controller]")]
    public class DataController : ControllerBase
    {
        private readonly ILogger<DataController> _logger;

        public DataController(ILogger<DataController> logger)
        {
            _logger = logger;
        }

        [HttpGet("actual")]
        public Dataset GetLiveVehicles()
        {
            return Predictions.GetPredictions();
        }

        [HttpGet("scheduled")]
        public Dataset GetSchedule()
        {
            return Scheduled.GetSchedule();
        }
    }
}
