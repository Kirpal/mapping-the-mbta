import Chartist from 'chartist';
import moment from 'moment';
import {drawTrainsAtTime} from './map';

// Get the timestamp for a given offset in the time range
const getTimestamp = (timeRange, offset, width) => {
  return timeRange.min + ((timeRange.max - timeRange.min) * (offset / width));
}

// Get the scroll offset for a given timestamp
const getScrollOffset = (timestamp, timeRange, scrollWidth) => {
  return scrollWidth * (timestamp - timeRange.min) / (timeRange.max - timeRange.min);
}

// The tooltip that shows on the marey chart
class MareyTooltip {
  constructor(map, mareyTrips, containerId, timestamp) {
    this.map = map;
    this.mareyTrips = mareyTrips;
    this.timestamp = timestamp;
    this.container = document.getElementById(containerId);
    this.mouseOver = false;

    const tooltips = document.querySelectorAll('.marey-tooltip, .marey-tooltip-text');
    for (let index = 0; index < tooltips.length; index += 1) {
      tooltips.item(index).remove();
    }

    this.line = document.createElement('div');
    this.line.className = 'marey-tooltip';

    this.timeText = document.createElement('p');
    this.timeText.className = 'marey-tooltip-text';

    this.container.appendChild(this.line);
    this.line.after(this.timeText);

    let mouseEnter = () => this.mouseEnter();
    let mouseLeave = () => this.mouseLeave();

    this.container.removeEventListener('mouseenter', mouseEnter);
    this.container.removeEventListener('mouseleave', mouseLeave);
    
    this.container.addEventListener('mouseenter', mouseEnter);
    this.container.addEventListener('mouseleave', mouseLeave);
  }

  mouseEnter() {
    this.mouseOver = true;
  }

  mouseLeave() {
    this.line.style.display = 'none';
    this.timeText.style.display = 'none';
    drawTrainsAtTime(this.map, this.timestamp, this.mareyTrips);
    this.mouseOver = false;
  }

  updateTrips(mareyTrips, timestamp) {
    this.mareyTrips = mareyTrips;
    this.timestamp = timestamp;
  }

  tooltip() {
    return (chart) => {
      if (chart instanceof Chartist.Line) {
        chart.on('created', (data) => {
          if (!this.mouseOver) {
            this.line.style = `top: ${data.chartRect.y2}px; height: ${data.chartRect.height()}px`;
  
            this.timeText.style = `top: ${data.chartRect.y2}px;`;
            
            chart.container.scrollLeft = getScrollOffset(
              this.timestamp,
              data.axisX.range,
              chart.container.scrollWidth - chart.container.clientWidth - data.chartRect.x1);
            drawTrainsAtTime(this.map, this.timestamp, this.mareyTrips);
          }
          
          const $svg = data.svg.getNode();
          $svg.addEventListener('mousemove', ({target, offsetX, offsetY}) => {
            if (target.tagName != 'SPAN' && offsetY > data.chartRect.y2 && offsetY < data.chartRect.y1) {
              let lineX = Math.max(offsetX + chart.container.style['padding-left'], data.chartRect.x1);
              lineX = Math.min(lineX, data.chartRect.x1 + data.chartRect.width());
              let timestamp = getTimestamp(data.axisX.range, lineX - data.chartRect.x1, data.chartRect.width());

              this.line.style.display = 'block';
              this.timeText.style.display = 'block';
              this.line.style.left = lineX + 'px';
              this.timeText.style.left = (lineX + 1) + 'px';
              this.timeText.innerHTML = moment(timestamp).format('h:mm a');

              drawTrainsAtTime(this.map, timestamp, this.mareyTrips);
            }
          });
        });
      }
    }
  }
}

export default MareyTooltip;