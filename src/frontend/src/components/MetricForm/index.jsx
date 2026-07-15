import React, { useState, useEffect } from "react";
import styles from "./style.module.css";

export function ConfigForm({
  onConfirm,
  currentConfig = {},
  selectedProfile,
  setSelectedProfile,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const initialData = {
    temp_min: "",
    temp_max: "",
    umid_min: "",
    umid_max: "",
    eco2_max: "",
    som_max: "",
    luminosidade_min: "",
    luminosidade_max: "",
  };

  const [formData, setFormData] = useState(initialData);

  const hasValues = Object.values(formData).some((value) => value !== "");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleConfirm = (e) => {
    e.preventDefault();

    const payload = {};
    for (const key in formData) {
      if (formData[key] !== "") {
        payload[key] = Number(formData[key]);
      }
    }

    const jsonOutput = JSON.stringify(payload, null, 2);
    console.log("JSON pronto para envio ao BD:", jsonOutput);

    if (onConfirm) onConfirm(payload);

    setIsOpen(false);
    setFormData(initialData);
  };

  const handleCancel = () => {
    setFormData(initialData);
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setFormData(initialData);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    // Função de limpeza (cleanup) do React.
    // Garante que, se o componente sumir da tela por algum motivo, a rolagem seja devolvida ao usuário!
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <button
        className={styles.floatingButton}
        onClick={() => setIsOpen(true)}
        title="Alterar Métricas"
      >
        <i className="fa-solid fa-sliders"></i>
      </button>

      {isOpen && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.headerModal}>
              <h2>Ajustar Limites</h2>
            </div>

            <form className={styles.form} onSubmit={handleConfirm}>
              <div className={styles.profileSelector}>
                <label htmlFor="profile-select">PERFIL SENSORIAL:</label>
                <select
                  id="profile-select"
                  value={selectedProfile}
                  onChange={(e) => setSelectedProfile(e.target.value)}
                >
                  <option value="padrao">PADRÃO</option>
                  <option value="tea">TEA - HIPERSENSIBILIDADE</option>
                  <option value="tdah">TDAH - FOCO</option>
                </select>
                <p className={styles.profileMessage}>
                  Ajusta o nível de conforto de acordo com o perfil sensorial
                  selecionado.
                </p>
              </div>

              {/* Linha divisória neo-brutalista opcional */}
              <hr className={styles.separator} />

              <div className={styles.inputGroup}>
                {/* TEMPERATURA */}
                <div className={styles.metricRow}>
                  <span className={styles.metricName}>Temp:</span>
                  <label>min</label>
                  <input
                    type="number"
                    name="temp_min"
                    value={formData.temp_min}
                    onChange={handleChange}
                    placeholder={currentConfig.temp_min}
                  />
                  <span className={styles.slash}>||</span>
                  <label>max</label>
                  <input
                    type="number"
                    name="temp_max"
                    value={formData.temp_max}
                    onChange={handleChange}
                    placeholder={currentConfig.temp_max}
                  />
                </div>

                {/* UMIDADE */}
                <div className={styles.metricRow}>
                  <span className={styles.metricName}>Umid:</span>
                  <label>min</label>
                  <input
                    type="number"
                    name="umid_min"
                    value={formData.umid_min}
                    onChange={handleChange}
                    placeholder={currentConfig.umid_min}
                  />
                  <span className={styles.slash}>||</span>
                  <label>max</label>
                  <input
                    type="number"
                    name="umid_max"
                    value={formData.umid_max}
                    onChange={handleChange}
                    placeholder={currentConfig.umid_max}
                  />
                </div>

                {/* LUMINOSIDADE */}
                <div className={styles.metricRow}>
                  <span className={styles.metricName}>Luz:</span>
                  <label>min</label>
                  <input
                    type="number"
                    name="luminosidade_min"
                    value={formData.luminosidade_min}
                    onChange={handleChange}
                    placeholder={currentConfig.luminosidade_min}
                  />
                  <span className={styles.slash}>||</span>
                  <label>max</label>
                  <input
                    type="number"
                    name="luminosidade_max"
                    value={formData.luminosidade_max}
                    onChange={handleChange}
                    placeholder={currentConfig.luminosidade_max}
                  />
                </div>

                {/* CO2 */}
                <div className={styles.metricRow}>
                  <span className={styles.metricName}>CO2:</span>
                  <label>máximo aceitável</label>
                  <input
                    type="number"
                    name="eco2_max"
                    value={formData.eco2_max}
                    onChange={handleChange}
                    placeholder={currentConfig.eco2_max}
                  />
                </div>

                {/* RUÍDO */}
                <div className={styles.metricRow}>
                  <span className={styles.metricName}>Som:</span>
                  <label>máximo aceitável</label>
                  <input
                    type="number"
                    name="som_max"
                    value={formData.som_max}
                    onChange={handleChange}
                    placeholder={currentConfig.som_max}
                  />
                </div>
              </div>

              <div className={styles.actions}>
                {!hasValues ? (
                  <button
                    type="button"
                    className={styles.closeActionButton}
                    onClick={handleClose}
                  >
                    Fechar
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className={styles.cancelButton}
                      onClick={handleCancel}
                    >
                      Cancelar
                    </button>
                    <button type="submit" className={styles.confirmButton}>
                      Confirmar Mudanças
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
