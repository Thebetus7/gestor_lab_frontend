'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useUbicacion } from '../_hooks/useUbicacion';
import styles from './UbicacionModal.module.css';

// Importar dinámicamente el componente del mapa para desactivar Server-Side Rendering (SSR)
const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className={styles.mapPlaceholder}>
      <span className={styles.spinner}></span>
      <p>Cargando mapa interactivo...</p>
    </div>
  )
});

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function UbicacionModal({ isOpen, onClose }: Props) {
  const { ubicacion, loading, saving, error, success, setSuccess, guardar } = useUbicacion();

  // Estados locales para interactividad rápida e inputs
  const [lat, setLat] = useState(-17.783);
  const [lng, setLng] = useState(-63.182);
  const [radio, setRadio] = useState(100);

  // Sincronizar datos locales con el hook cuando se carguen de la API
  useEffect(() => {
    if (ubicacion) {
      setLat(ubicacion.lat);
      setLng(ubicacion.lng);
      setRadio(ubicacion.radio);
    }
  }, [ubicacion, isOpen]);

  if (!isOpen) return null;

  const handleMapChange = (newLat: number, newLng: number) => {
    setLat(Number(newLat.toFixed(6)));
    setLng(Number(newLng.toFixed(6)));
    setSuccess(false);
  };

  const handleSave = async () => {
    try {
      await guardar({ lat, lng, radio });
      setTimeout(() => {
        setSuccess(false);
      }, 3000); // Ocultar mensaje tras 3s
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>📍 Coordenadas de la Institución</h2>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}
        {success && (
          <div className={styles.successMessage}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            ¡Ubicación de la institución configurada correctamente!
          </div>
        )}

        {loading ? (
          <div className={styles.loadingState}>
            <span className={styles.spinner}></span>
            <p>Obteniendo ubicación guardada...</p>
          </div>
        ) : (
          <div className={styles.content}>
            <p className={styles.helperText}>
              Selecciona en el mapa el punto central de la institución. Las asistencias sólo serán válidas si los alumnos se encuentran dentro del radio configurado.
            </p>

            <div className={styles.mapWrapper}>
              <MapComponent
                lat={lat}
                lng={lng}
                radio={radio}
                onChange={handleMapChange}
              />
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Latitud</label>
                <input
                  type="number"
                  step="any"
                  value={lat}
                  onChange={(e) => {
                    setLat(parseFloat(e.target.value) || 0);
                    setSuccess(false);
                  }}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Longitud</label>
                <input
                  type="number"
                  step="any"
                  value={lng}
                  onChange={(e) => {
                    setLng(parseFloat(e.target.value) || 0);
                    setSuccess(false);
                  }}
                  className={styles.formInput}
                />
              </div>
            </div>

            <div className={styles.formGroup} style={{ marginTop: 'var(--sp-2)' }}>
              <div className={styles.radioLabelWrapper}>
                <label className={styles.formLabel}>Radio de Validez: <strong>{radio} metros</strong></label>
              </div>
              <input
                type="range"
                min="10"
                max="1000"
                step="5"
                value={radio}
                onChange={(e) => {
                  setRadio(parseInt(e.target.value) || 10);
                  setSuccess(false);
                }}
                className={styles.rangeInput}
              />
              <span className={styles.rangeLabels}>
                <span>10m</span>
                <span>500m</span>
                <span>1000m (1km)</span>
              </span>
            </div>

            <div className={styles.footer}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onClose}
                disabled={saving}
              >
                Cerrar
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Guardar Ubicación'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
