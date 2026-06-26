import "./App.css";
import { History } from "./components/History";
import { GaugeChart } from "./components/Gauge";

export function App() {
  return (
    <>
      <main className="dashboard">
        <section className="generalSection">
          <div className="generalGauge">
            <div className="placeholder-gauge">Gauge Principal (1:1)</div>
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
            <div className="gauge">
              <div className="placeholder-gauge">Gauge 1</div>
            </div>
            <div className="gauge">
              <div className="placeholder-gauge">Gauge 2</div>
            </div>
            <div className="gauge">
              <div className="placeholder-gauge">Gauge 3</div>
            </div>
            <div className="gauge">
              <div className="placeholder-gauge">Gauge 4</div>
            </div>
            <div className="gauge">
              <div className="placeholder-gauge">Gauge 5</div>
            </div>
            <div className="gauge">
              <div className="placeholder-gauge">Gauge 6</div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
