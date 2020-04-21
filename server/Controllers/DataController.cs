using System.Collections.Generic;
using MappingTheMBTA.Models;
using MappingTheMBTA.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace MappingTheMBTA.Controllers
{
    [ApiController]
    [Route("api")]
    public class DataController : ControllerBase
    {
        private readonly ILogger<DataController> _logger;

        public DataController(ILogger<DataController> logger)
        {
            _logger = logger;
        }

        public Dataset GetLiveVehicles() => GetActual(0, 0, 0);

        [HttpGet("actual")]
        // takes in yyyy, mm, dd
        public Dataset GetActual(int year, int month, int day)
        {
            return Sources.Today;
        }
    }
}
