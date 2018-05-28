import { compact, defaults, filter, get, includes, isFinite, map } from "lodash/fp"
import Series from "../series"
import * as styles from "./styles"
import { withD3Element, setRectAttributes } from "../../../utils/d3_utils"
import {
  AxesData,
  AxisType,
  AxisPosition,
  BarsRendererAccessors,
  D3Selection,
  Datum,
  EventBus,
  Object,
  RendererAccessor,
  RendererClass,
  RendererType,
  SingleRendererOptions,
  State,
} from "../../typings"
import Events from "../../../utils/event_catalog"

export type Options = SingleRendererOptions<BarsRendererAccessors>

const defaultAccessors: Partial<BarsRendererAccessors> = {
  color: (series: Series, d: Datum) => series.legendColor(),
  barWidth: (series: Series, d: Datum) => undefined,
}

class Bars implements RendererClass<BarsRendererAccessors> {
  barWidth: RendererAccessor<number>
  color: RendererAccessor<string>
  data: Datum[]
  el: D3Selection
  events: EventBus
  options: Options
  series: Series
  state: any
  type: RendererType = "bars"
  x: RendererAccessor<number | Date | string>
  x0: RendererAccessor<number>
  x1: RendererAccessor<number>
  xIsBaseline: boolean
  xScale: any
  y: RendererAccessor<number | Date | string>
  y0: RendererAccessor<number>
  y1: RendererAccessor<number>
  yScale: any

  constructor(state: State, events: EventBus, el: D3Selection, data: Datum[], options: Options, series: Series) {
    this.state = state
    this.events = events
    this.series = series
    this.el = this.appendSeriesGroup(el)
    this.update(data, options)
  }

  // Public methods
  update(data: Datum[], options: Options): void {
    this.options = options
    this.assignAccessors(options.accessors)
    this.data = data
  }

  draw(): void {
    this.setAxisScales()
    const data: Datum[] = filter(this.validate.bind(this))(this.data)
    const duration: number = this.state.current.get("config").duration

    this.el
      .transition()
      .duration(!!this.el.attr("transform") ? duration : 0)
      .attr("transform", this.seriesTranslation())

    const attributes: Object<any> = this.attributes()
    const startAttributes: Object<any> = this.startAttributes(attributes)

    const bars = this.el.selectAll("rect").data(data)

    bars
      .enter()
      .append("svg:rect")
      .call(setRectAttributes, startAttributes)
      .merge(bars)
      .on("mouseenter", withD3Element(this.onMouseOver.bind(this)))
      .on("mouseout", this.onMouseOut.bind(this))
      .on("click", withD3Element(this.onClick.bind(this)))
      .call(setRectAttributes, attributes, duration)

    bars
      .exit()
      .transition()
      .duration(duration)
      .call(setRectAttributes, startAttributes)
      .remove()
  }

  close(): void {
    this.el.remove()
  }

  dataForAxis(axis: "x" | "y"): any[] {
    const data: any[] = map((this as any)[axis])(this.data)
      .concat(map(get(`${axis}0`))(this.data))
      .concat(map(get(`${axis}1`))(this.data))
    return compact(data)
  }

  // Private methods
  private appendSeriesGroup(el: D3Selection): D3Selection {
    return el.append("g").attr("class", `series:${this.series.key()} ${styles.bar}`)
  }

  private setAxisScales(): void {
    this.xIsBaseline = this.state.current.get("computed").axes.baseline === "x"
    this.xScale = this.state.current.get("computed").axes.computed[this.series.xAxis()].scale
    this.yScale = this.state.current.get("computed").axes.computed[this.series.yAxis()].scale
    this.x0 = (d: Datum): any => this.xScale(this.xIsBaseline ? this.x(d) : d.x0 || (this.x(d) > 0 ? 0 : this.x(d)))
    this.x1 = (d: Datum): any => this.xScale(this.xIsBaseline ? this.x(d) : d.x1 || (this.x(d) > 0 ? this.x(d) : 0))
    this.y0 = (d: Datum): any => this.yScale(this.xIsBaseline ? d.y0 || (this.y(d) > 0 ? 0 : this.y(d)) : this.y(d))
    this.y1 = (d: Datum): any => this.yScale(this.xIsBaseline ? d.y1 || (this.y(d) > 0 ? this.y(d) : 0) : this.y(d))
  }

  private validate(d: Datum): boolean {
    return isFinite(this.xScale(this.x(d))) && isFinite(this.yScale(this.y(d)))
  }

  private assignAccessors(customAccessors: Partial<BarsRendererAccessors>): void {
    const accessors: BarsRendererAccessors = defaults(defaultAccessors)(customAccessors)
    this.x = (d: Datum): any => this.series.x(d) || d.injectedX
    this.y = (d: Datum): any => this.series.y(d) || d.injectedY
    this.color = (d?: Datum): string => accessors.color(this.series, d)
    this.barWidth = (d?: Datum): number => accessors.barWidth(this.series, d)
  }

  private seriesTranslation(): string {
    const seriesBars: Object<any> = this.state.current.get("computed").axes.computedBars[this.series.key()]
    return this.xIsBaseline ? `translate(${seriesBars.offset}, 0)` : `translate(0, ${seriesBars.offset})`
  }

  private startAttributes(attributes: Object<any>): Object<any> {
    return {
      x: this.xIsBaseline ? this.x0 : 0,
      y: this.xIsBaseline ? this.yScale(0) : this.y0,
      width: this.xIsBaseline ? attributes.width : 0,
      height: this.xIsBaseline ? 0 : attributes.height,
      color: attributes.color,
    }
  }

  private attributes(): Object<any> {
    const barWidth: number = this.state.current.get("computed").axes.computedBars[this.series.key()].width
    return {
      x: this.x0,
      y: this.y1,
      width: this.xIsBaseline ? barWidth : (d: Datum): number => this.x1(d) - this.x0(d),
      height: this.xIsBaseline ? (d: Datum): number => this.y0(d) - this.y1(d) : barWidth,
      color: this.color.bind(this),
    }
  }

  private onMouseOver(d: Datum, el: HTMLElement): void {
    const isNegative: boolean = this.xIsBaseline ? this.y(d) < 0 : this.x(d) < 0
    const position: string = this.xIsBaseline ? (isNegative ? "below" : "above") : isNegative ? "toLeft" : "toRight"
    const dimensions = el.getBoundingClientRect()
    const barOffset = this.state.current.get("computed").axes.computedBars[this.series.key()].offset

    const focusPoint = {
      position,
      element: this.xIsBaseline ? this.x(d) : this.y(d),
      value: this.xIsBaseline ? this.y(d) : this.x(d),
      seriesName: this.series.legendName(),
      seriesColor: this.series.legendColor(),
      offset: 0,
      focus: {
        x: this.x1(d) + (this.xIsBaseline ? barOffset + dimensions.width / 2 : 0), // @TODO check if works for isNegative (stacked and non-stacked)
        y: this.y1(d) + (this.xIsBaseline ? 0 : barOffset + dimensions.height / 2),
      },
    }

    this.events.emit(Events.FOCUS.ELEMENT.HOVER, focusPoint)
  }

  private onMouseOut(): void {
    this.events.emit(Events.FOCUS.ELEMENT.OUT)
  }

  private onClick(d: Datum, el: HTMLElement): void {
    this.events.emit(Events.FOCUS.ELEMENT.CLICK, { d, el })
  }
}

export default Bars
