import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  ViewChild
} from '@angular/core';
import { arc, pie, select } from 'd3';
import { cloneDeep } from 'lodash';
import { AssetCategoryMap, CategoryMap, Option } from '../../../core/categories/categories.model';
import { LocalStorageService } from '../../../core/core.module';
import { Asset, GroupedAsset } from '../../../core/data/data.model';
import { getColor, getCurrencyFormat } from '../../../shared/helper';
import { OPTIONS_TRANSLATIONS } from '../../categories/translations';
import { TranslateService } from '@ngx-translate/core';

const NO_CATEGORY = 'No category';
const NO_ASSET_NAME = 'Unnamed';
const DISABLED_KEY = 'DISABLED';

@Component({
  selector: 'anms-donut',
  templateUrl: './donut.component.html',
  styleUrls: ['./donut.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DonutComponent implements OnChanges {
  @Input()
  data: Asset[];

  @Input()
  currency: string;

  @Input()
  priceMap: Map<string, number>;

  @Input()
  categoryId: string;

  @Input()
  categoryMap: CategoryMap;

  @Input()
  options: Option[];

  @Input()
  loading = true;

  @ViewChild('donut')
  svgHost: ElementRef;

  getCurrencyFormat = getCurrencyFormat;

  readonly OPTIONS_TRANSLATIONS = OPTIONS_TRANSLATIONS;

  private readonly COLOR_MAR = {
    gold: '#FDD835',
    stocks: '#2196F3',
    bonds: '#B2FF59',
    cash: '#66BB6A',
    reit: '#FF5722',
    crypto: '#8C9EFF',
    usa: '#002868',
    developed: '#003399',
    emerging: '#EE1C25',
    russia: '#2A9AF6'
  };

  constructor(private storageService: LocalStorageService, private translate: TranslateService) {}

  get total(): number {
    return this.groupedData
      .filter(gd => !this.hiddenSet.has(gd.category))
      .reduce((acc: number, curr: GroupedAsset) => (acc += curr.value), 0);
  }

  get hiddenSet(): Set<string> {
    const saved = this.storageService.getItem(DISABLED_KEY);
    return saved ? new Set(saved) : new Set();
  }

  get hostWidth() {
    return this.svgHost?.nativeElement.clientWidth;
  }

  get groupedData(): GroupedAsset[] {
    if (!this.data) {
      return [];
    }

    if (this.categoryId) {
      return this.getGroupedByCategoryId();
    }

    return this.getGroupedByAssetName();
  }

  get legend(): GroupedAsset[] {
    return this.groupedData.sort((a, b) => (a.value > b.value ? -1 : 1)).filter(a => a.value > 0);
  }

  @HostListener('window:resize')
  onResize() {
    this.render();
  }

  ngOnChanges() {
    if (!this.data) {
      setTimeout(() => {
        this.render(true);
      });
      return;
    }

    this.loading = false;

    setTimeout(() => {
      this.render();
    });
  }

  toggleAsset(asset: GroupedAsset): void {
    const clone = cloneDeep(this.hiddenSet);
    if (clone.has(asset.category)) {
      clone.delete(asset.category);
    } else {
      clone.add(asset.category);
    }
    this.storageService.setItem(DISABLED_KEY, Array.from(clone));
    this.render();
  }

  getPercent(category: string): number {
    if (!this.groupedData) {
      return 0;
    }
    return (100 * this.groupedData.find(gd => gd.category === category)?.value) / this.total;
  }

  getColor(str: string): string {
    if ([NO_CATEGORY, NO_ASSET_NAME].includes(str)) {
      return '#ccc';
    }

    const cc = this.getOptionNameByCode(str).toLowerCase();
    const color = this.COLOR_MAR[cc];

    if (color) {
      return color;
    }

    return getColor(str);
  }

  getOptionNameByCode(code: string): string {
    const oo = this.options.find(o => o.code === code);

    const translateKey = this.OPTIONS_TRANSLATIONS[oo?.code];
    const name = translateKey ? this.translate.instant(translateKey) : oo?.name;
    return oo ? name : code;
  }

  render(skeleton = false) {
    const width = this.hostWidth,
      height = this.hostWidth,
      radius = Math.min(width, height) / 2;

    this.svgHost.nativeElement.innerHTML = '';

    const pieEl = pie<GroupedAsset>()
      .value(function(d) {
        return d.value;
      })
      .sort(null);

    const arcEl = arc<GroupedAsset>()
      .innerRadius(radius - 50)
      .outerRadius(radius);

    const svgEl = select<SVGElement, GroupedAsset>(this.svgHost.nativeElement)
      .append('svg')
      .style('display', 'block')
      .style('margin', '0 auto')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${radius})`);

    const renderData =
      this.data?.length && !skeleton ? this.groupedData.filter(gd => !this.hiddenSet.has(gd.category)) : [{ value: 1 }];

    const path = svgEl
      .datum(renderData)
      .selectAll('path')
      .data(pieEl)
      .enter()
      .append('path')
      .attr('fill', (d, i) => {
        if (renderData.length && !skeleton) {
          return this.getColor(d.data.category);
        } else {
          return '#eee';
        }
      })
      .attr('d', arcEl as any);
  }

  private getGroupedByAssetName() {
    return this.data.reduce(
      (acc: GroupedAsset[], curr: Asset) => {
        const found = acc.find(item => item.category === curr.name);

        if (curr.name) {
          if (!found) {
            acc.push({
              category: curr.name,
              value: this.priceMap.get(curr._id)
            });
          } else {
            found.value += this.priceMap.get(curr._id);
          }
        } else {
          const noData = acc.find(item => item.category === NO_ASSET_NAME);
          noData.value += this.priceMap.get(curr._id);
        }

        return acc;
      },
      [
        {
          category: NO_ASSET_NAME,
          value: 0
        }
      ]
    );
  }

  private getGroupedByCategoryId() {
    return this.data.reduce(
      (acc: GroupedAsset[], curr: Asset) => {
        const assetMap: AssetCategoryMap = this.categoryMap[curr.code];

        if (assetMap && assetMap[this.categoryId]) {
          const optionMap: { [key: string]: number } = assetMap[this.categoryId];

          Object.keys(optionMap).forEach(optionCode => {
            const found = acc.find(item => item.category === optionCode);
            const percentage = optionMap[optionCode] / 100;

            if (!found) {
              acc.push({
                category: optionCode,
                value: this.priceMap.get(curr._id) * percentage
              });
            } else {
              found.value += this.priceMap.get(curr._id) * percentage;
            }
          });
        } else {
          const noData = acc.find(item => item.category === NO_CATEGORY);
          noData.value += this.priceMap.get(curr._id);
        }

        return acc;
      },
      [
        {
          category: NO_CATEGORY,
          value: 0
        }
      ]
    );
  }
}
