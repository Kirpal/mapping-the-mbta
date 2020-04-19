import Chartist from 'chartist';
import moment from 'moment';
import {drawTrainsAtTime} from './map';

const getTimestamp = (timeRange, offset, width) => {
  return timeRange.min + ((timeRange.max - timeRange.min) * (offset / width));
}


const MareyTooltip = (map, mareyTrips) => {
  return (chart) => {
    if (chart instanceof Chartist.Line) {
      chart.on('created', (data) => {
        const tooltips = document.getElementsByClassName('marey-tooltip marey-tooltip-text');
        for (let index = 0; index < tooltips.length; index += 1) {
          tooltips.item(index).remove();
        }

        const line = document.createElement('div');
        line.className = 'marey-tooltip';
        line.style = `top: ${data.chartRect.y2}px; height: ${data.chartRect.height()}px`;
        chart.container.appendChild(line);

        const timeText = document.createElement('p');
        timeText.className = 'marey-tooltip-text';
        timeText.style = `top: ${data.chartRect.y2}px;`;
        line.after(timeText);
        const $svg = data.svg.getNode();

        chart.container.addEventListener('mouseenter', () => {
          line.style.display = 'block';
          timeText.style.display = 'block';
        });
        chart.container.addEventListener('mouseleave', () => {
          line.style.display = 'none';
          timeText.style.display = 'none';
          drawTrainsAtTime(map, new Date().getTime(), mareyTrips);
        });

        $svg.addEventListener('mousemove', ({target, offsetX, offsetY}) => {
          if (target.tagName != 'SPAN' && offsetY > data.chartRect.y2 && offsetY < data.chartRect.y1) {
            let lineX = Math.max(offsetX + chart.container.style['padding-left'], data.chartRect.x1);
            lineX = Math.min(lineX, data.chartRect.x1 + data.chartRect.width());
            let timestamp = getTimestamp(data.axisX.range, lineX - data.chartRect.x1, data.chartRect.width());

            line.style.left = lineX + 'px';
            timeText.style.left = (lineX + 1) + 'px';
            timeText.innerHTML = moment(timestamp).format('h:mm a');

            drawTrainsAtTime(map, timestamp, mareyTrips);
          }
        });
      });
    }
  }
}

export default MareyTooltip;