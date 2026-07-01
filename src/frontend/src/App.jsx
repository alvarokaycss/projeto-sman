import "./App.css";
import { History } from "./components/History";
import { GaugeChart } from "./components/Gauge";

export function App() {
  return (
    <>
      <main className="dashboard">
        <section className="generalSection">
          <div className="generalGauge">
            <GaugeChart value={20} max={100} min={0} metric={"Valor"} />
          </div>
          <div className="historyContainer">
            <History />
          </div>
        </section>
        <section className="specificSection">
          <div className="timelineChart">
            <div className="placeholder-chart">Gráfico de Linha Temporal</div>
          </div>
          <div className="gaugesGrid">
            <div className="gaugeContainer">
              <GaugeChart value={10} max={100} min={0} metric={"Temperatura"} />
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
