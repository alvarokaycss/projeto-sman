import "./App.css";
import { History } from "./components/History";
import { GaugeChart } from "./components/Gauge";
import DynamicLineChart from "./components/DynamicLineChart";

// mock de dados
import {
  mockChartData,
  linesConfig,
  generalMediaConfig,
} from "./dashboardMock";

export function App() {
  return (
    <>
      <main className="dashboard">
        <section className="generalSection">
          <div className="generalGauge">
            <GaugeChart
              value={generalMediaConfig.currentValue}
              max={generalMediaConfig.max}
              min={generalMediaConfig.min}
              metric={generalMediaConfig.label}
              symbol={generalMediaConfig.symbol}
            />
          </div>
          <div className="historyContainer">
            <History />
          </div>
        </section>

        <section className="specificSection">
          <div className="timelineChart">
            <DynamicLineChart data={mockChartData} linesConfig={linesConfig} />
          </div>

          <div className="gaugesGrid">
            {linesConfig.map((sensor, index) => (
              <div className="gaugeContainer" key={index}>
                <GaugeChart
                  value={sensor.currentValue}
                  max={sensor.max}
                  min={sensor.min}
                  symbol={sensor.symbol}
                  metric={sensor.label}
                />
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
