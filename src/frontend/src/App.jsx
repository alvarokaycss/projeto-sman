import { History } from "./components/History";
import "./App.css";

function App() {
  return (
    <>
      <main className="dashboard">
        <section className="generalSection">
          <div className="generalGauge">
          </div>
          <History />
        </section>
        <section className="specificSection">
          <div className="timelineChart">
          </div>
          <div className="gaugesGrid">
            <div className="gauge">
            </div>
            <div className="gauge">
            </div>
            <div className="gauge">
            </div>
            <div className="gauge">
            </div>
            <div className="gauge">
            </div>
            <div className="gauge">
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default App;
