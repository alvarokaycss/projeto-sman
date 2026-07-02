import "./App.css";
import { History } from "./components/History";
import { GaugeChart } from "./components/Gauge";
import DynamicLineChart from "./components/DynamicLineChart";

export function App() {
  return (
    <>
      <main className="dashboard">
        <section className="generalSection">
          <div className="generalGauge">
            <GaugeChart value={21} max={100} min={0} metric={"MEDIA GERAL"} />
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
            <div className="gaugeContainer">
              <GaugeChart value={50} max={100} min={20} symbol={"C°"} metric={"Temperatura"} />
            </div>
            <div className="gaugeContainer">
              <GaugeChart value={10} max={100} min={0} metric={"Valor"} />
            </div>
            <div className="gaugeContainer">
              <GaugeChart value={10} max={100} min={0} metric={"Valor"} />
            </div>
            <div className="gaugeContainer">
              <GaugeChart value={10} max={100} min={0} metric={"Valor"} />
            </div>
            <div className="gaugeContainer">
              <GaugeChart value={10} max={100} min={0} metric={"Valor"} />
            </div>
            <div className="gaugeContainer">
              <GaugeChart value={10} max={100} min={0} metric={"Valor"} />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
