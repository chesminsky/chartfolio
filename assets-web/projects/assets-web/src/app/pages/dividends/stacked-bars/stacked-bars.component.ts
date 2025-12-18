import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  ViewChild
} from '@angular/core';
import { axisBottom, axisLeft, formatPrefix, scaleBand, scaleLinear, select, stack } from 'd3';
import { getMonth } from 'date-fns';
import { DividendInfo } from '../../../core/stocks/stocks.model';
import { getColor } from '../../../shared/helper';

export interface StackedItem {
  [key: string]: string | number;
  group: string;
}

export const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

@Component({
  selector: 'anms-stacked-bars',
  templateUrl: './stacked-bars.component.html',
  styleUrls: ['./stacked-bars.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StackedBarsComponent implements OnChanges {
  @ViewChild('chart')
  svgHost: ElementRef;

  @Input()
  data: Array<DividendInfo>;

  getColor = getColor;

  constructor(private el: ElementRef) {}

  @HostListener('window:resize')
  onResize() {
    this.render();
  }

  ngOnChanges() {
    setTimeout(() => {
      this.render();
    });
  }

  convertData(dividendsInfo: Array<DividendInfo>): Array<StackedItem> {
    return months.map((key, i) => {
      const stackedItem = {
        group: key
      };

      dividendsInfo.forEach(d => {
        stackedItem[d.code] = stackedItem[d.code] || 0;
        if (getMonth(new Date(d.date)) === i) {
          stackedItem[d.code] += d.value;
        }
      });

      return stackedItem;
    });
  }

  render() {
    const data = this.convertData(this.data);

    // set the dimensions and margins of the graph
    const margin = { top: 50, right: 30, bottom: 20, left: 40 },
      width = this.el.nativeElement.getBoundingClientRect().width - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

    this.svgHost.nativeElement.innerHTML = '';

    // append the svg object to the body of the page
    const svg = select<SVGElement, StackedItem>(this.svgHost.nativeElement)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // List of groups = species here = value of the first column called group -> I show them on the X axis
    const groups = data.map(d => d.group);

    const AXIS_X_PADDING = 0.2;

    // Add X axis
    const x = scaleBand()
      .domain(groups)
      .range([0, width])
      .padding(AXIS_X_PADDING);
    svg
      .append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .call(axisBottom(x).tickSizeOuter(0));

    const max = Math.max(
      ...this.data
        .reduce((acc, item) => {
          const found = acc.find(d => getMonth(new Date(d.date)) === getMonth(new Date(item.date)));

          if (!found) {
            acc.push(item);
          } else {
            found.value += item.value;
          }
          return acc;
        }, [])
        .map(d => d.value)
    );

    // Add Y axis
    const y = scaleLinear()
      .domain([0, max])
      .range([height, 0]);

    svg.append('g').call(axisLeft(y).tickFormat(formatPrefix('.0', max)));

    const subgroups = Object.keys(data[0]).filter(d => d !== 'group');
    const stackedData = stack<StackedItem>().keys(subgroups)(data);

    svg
      .append('g')
      .selectAll('g')
      .data(stackedData)
      .enter()
      .append('g')
      .attr('fill', d => this.getColor(d.key))
      .selectAll('rect')
      .data(d => d)
      .enter()
      .append('rect')
      .attr('x', d => x(d.data.group))
      .attr('y', d => y(d[1]))
      .attr('height', d => y(d[0]) - y(d[1]))
      .attr('width', x.bandwidth());
  }
}
