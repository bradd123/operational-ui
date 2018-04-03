import { PieChart } from "@operational/visualizations"
import { IMarathon } from "../../components/Marathon"

const DonutRenderer = {
  type: "donut"
}

const data = {
  data: [
    { key: "Berlin", value: null },
    { key: "Dortmund", value: null },
    { key: "Bonn", value: null },
    { key: "Cologne", value: null }
  ],
  renderAs: [DonutRenderer]
}

const data1 = {
  data: [
    { key: "Berlin", value: 0 },
    { key: "Dortmund", value: 0 },
    { key: "Bonn", value: 0 },
    { key: "Cologne", value: 0 }
  ],
  renderAs: [DonutRenderer]
}

export const marathon = ({ test, afterAll, container }: IMarathon): void => {
  const viz = new PieChart(container)

  test("Renders the chart with no dataset", () => {
    viz.data({ renderAs: [DonutRenderer] })
    viz.draw()
  })

  test("Renders the chart with an empty dataset", () => {
    viz.data({ data: [], renderAs: [DonutRenderer] })
    viz.draw()
  })

  test("Renders the chart with only missing data", () => {
    viz.data(data)
    viz.draw()
  })

  test("Renders the chart with only 0 values", () => {
    viz.data(data1)
    viz.draw()
  })

  afterAll(() => {
    viz.close()
  })
}

export const title: string = "Empty/no data"