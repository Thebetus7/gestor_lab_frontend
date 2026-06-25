'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchProfile } from '@/lib/api/auth';
import PageHeader from '@/components/ui/PageHeader';
import Badge from '@/components/ui/Badge';

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();

  // Estados de los filtros reactivos
  const [filtroPeriodo, setFiltroPeriodo] = useState<'This Week' | 'This Month' | 'This Semester'>('This Week');
  const [filtroLab, setFiltroLab] = useState<'All' | 'Lab 1' | 'Lab 2' | 'Lab 3'>('All');

  useEffect(() => {
    const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('access_token='));
    const token = tokenCookie ? tokenCookie.split('=')[1] : null;

    if (!token) { router.push('/login'); return; }

    fetchProfile(token)
      .then(data => setProfile(data))
      .catch(() => router.push('/login'));
  }, [router]);

  // --- CÁLCULO DE DATOS REACTIVOS BASADO EN LOS FILTROS DEL USUARIO ---
  const obtenerDatosReactivos = () => {
    // Valores base para una semana y laboratorio "All"
    let baseAsistencias = 142;
    let baseActividades = 35;
    let baseReportesSem = 4;
    let basePcsTotales = 185;
    let tiempoRespMinutos = 14;
    let tasaResolucion = 96.5;
    let tasaResolucionVariacion = '+2.4% este mes';

    // 1. Variaciones por Laboratorio seleccionado
    if (filtroLab === 'Lab 1') {
      baseAsistencias = 68;
      baseActividades = 15;
      baseReportesSem = 2;
      basePcsTotales = 45;
      tiempoRespMinutos = 11;
      tasaResolucion = 98.2;
      tasaResolucionVariacion = '+3.1% este mes';
    } else if (filtroLab === 'Lab 2') {
      baseAsistencias = 48;
      baseActividades = 12;
      baseReportesSem = 1;
      basePcsTotales = 60;
      tiempoRespMinutos = 18;
      tasaResolucion = 93.8;
      tasaResolucionVariacion = '-1.2% este mes';
    } else if (filtroLab === 'Lab 3') {
      baseAsistencias = 26;
      baseActividades = 8;
      baseReportesSem = 1;
      basePcsTotales = 80;
      tiempoRespMinutos = 15;
      tasaResolucion = 95.5;
      tasaResolucionVariacion = '+0.8% este mes';
    }

    // 2. Multiplicadores según el Periodo de tiempo
    let mult = 1;
    if (filtroPeriodo === 'This Month') {
      mult = 4.2;
      tiempoRespMinutos = Math.round(tiempoRespMinutos * 1.08);
    } else if (filtroPeriodo === 'This Semester') {
      mult = 24.5;
      tiempoRespMinutos = Math.round(tiempoRespMinutos * 1.25);
    }

    // Cálculos dinámicos finales
    const totalAsistencias = Math.round(baseAsistencias * (filtroPeriodo === 'This Week' ? 1 : mult * 0.95));
    const totalActividades = Math.round(baseActividades * (filtroPeriodo === 'This Week' ? 1 : mult * 0.92));
    const reportesPCs = filtroPeriodo === 'This Week' 
      ? baseReportesSem 
      : Math.round(baseReportesSem * mult * 0.75);

    // Datos del gráfico de barras apiladas (puntual vs retraso)
    const barrasSemanales = [
      { dia: 'Lun', punctual: Math.round(18 * (totalAsistencias / 142) + 2), retraso: Math.round(3 * (totalAsistencias / 142) + 0.5) },
      { dia: 'Mar', punctual: Math.round(25 * (totalAsistencias / 142) + 4), retraso: Math.round(2 * (totalAsistencias / 142) + 0.5) },
      { dia: 'Mié', punctual: Math.round(28 * (totalAsistencias / 142) + 3), retraso: Math.round(5 * (totalAsistencias / 142) + 1) },
      { dia: 'Jue', punctual: Math.round(15 * (totalAsistencias / 142) + 1), retraso: Math.round(1 * (totalAsistencias / 142)) },
      { dia: 'Vie', punctual: Math.round(22 * (totalAsistencias / 142) + 2), retraso: Math.round(4 * (totalAsistencias / 142) + 0.5) },
      { dia: 'Sáb', punctual: Math.round(15 * (totalAsistencias / 142) + 1), retraso: Math.round(2 * (totalAsistencias / 142)) },
      { dia: 'Dom', punctual: Math.round(5 * (totalAsistencias / 142) + 0.5), retraso: Math.round(0) }
    ];

    // Encontrar el valor máximo para normalizar la escala de las barras semanales
    const maxBarValue = Math.max(...barrasSemanales.map(b => b.punctual + b.retraso), 1);

    // Curva spline SVG dinámica dependiente del Lab seleccionado
    let pathD = "M 0 130 C 50 140, 100 80, 150 100 C 200 120, 250 50, 300 70 C 350 90, 400 140, 450 110 L 500 60";
    if (filtroLab === 'Lab 1') {
      pathD = "M 0 160 C 50 130, 100 140, 150 120 C 200 100, 250 110, 300 80 C 350 100, 400 70, 450 90 L 500 50";
    } else if (filtroLab === 'Lab 2') {
      pathD = "M 0 100 C 50 120, 100 70, 150 90 C 200 60, 250 80, 300 50 C 350 70, 400 110, 450 80 L 500 40";
    } else if (filtroLab === 'Lab 3') {
      pathD = "M 0 140 C 50 150, 100 110, 150 130 C 200 140, 250 80, 300 100 C 350 110, 400 130, 450 120 L 500 100";
    }

    // Variación del alto de la curva según el Periodo de tiempo
    if (filtroPeriodo === 'This Month') {
      pathD = pathD.replace(/130/g, '95').replace(/140/g, '105').replace(/80/g, '45').replace(/120/g, '85').replace(/100/g, '65').replace(/150/g, '115').replace(/110/g, '75').replace(/160/g, '125');
    } else if (filtroPeriodo === 'This Semester') {
      pathD = pathD.replace(/130/g, '65').replace(/140/g, '75').replace(/80/g, '35').replace(/120/g, '55').replace(/100/g, '45').replace(/150/g, '85').replace(/110/g, '55').replace(/160/g, '95');
    }
    const areaD = `${pathD} L 500 180 L 0 180 Z`;

    // Tareas totales (Donut de 3 estados)
    const tareasTotal = Math.round(totalAsistencias * 1.07);
    const tareasCompleto = Math.round(tareasTotal * 0.41);
    const tareasEnCurso = Math.round(tareasTotal * 0.36);
    const tareasNoIniciado = tareasTotal - tareasCompleto - tareasEnCurso;

    // Perímetro del círculo donut (radio = 40, circunferencia = 251.2)
    const circ = 251.2;
    const strokeCompleto = circ * 0.41;
    const strokeEnCurso = circ * 0.36;
    const strokeNoIniciado = circ * 0.23;

    // Presupuesto simulado dinámico
    const presProyectado = Math.round(250000 * (filtroPeriodo === 'This Week' ? 0.08 : (filtroPeriodo === 'This Month' ? 0.25 : 1)));
    const presReal = Math.round(presProyectado * (tasaResolucion / 100) * 0.97);
    const presResto = presProyectado - presReal;

    // Riesgos (Imagen 1 - Centro abajo)
    const riesgos = [
      { label: 'BAJO', cantidad: Math.round(3 * (totalAsistencias / 142) * 1.1 + 1), color: '#b2ebf2', max: 50 },
      { label: 'MEDIO', cantidad: Math.round(2 * (totalAsistencias / 142) * 0.95 + 1), color: '#ffb74d', max: 50 },
      { label: 'ALTO', cantidad: Math.round(1 * (totalAsistencias / 142) * 0.8), color: '#e53935', max: 50 }
    ];
    const maxRiesgo = Math.max(...riesgos.map(r => r.cantidad), 1);

    // Problemas (Imagen 1 - Centro abajo)
    const problemas = [
      { label: 'ACCIONES PEND.', cantidad: Math.round(3 * (totalAsistencias / 142) * 1.05 + 1), color: '#b0bec5', max: 50 },
      { label: 'REVISIONES', cantidad: Math.round(1 * (totalAsistencias / 142) * 0.9 + 1), color: '#8bc34a', max: 50 },
      { label: 'PENDIENTES', cantidad: Math.round(3 * (totalAsistencias / 142) * 1.2), color: '#4fc3f7', max: 50 }
    ];
    const maxProblema = Math.max(...problemas.map(p => p.cantidad), 1);

    // Semestrales/Trimestrales (Imagen 1 - Derecha)
    const trimestrales = [
      { label: 'SEMESTRE 2', valor: Math.round(150000 * (totalAsistencias / 142) + 2000), color: '#ffe0b2', max: 200000 },
      { label: 'SEMESTRE 1', valor: Math.round(180000 * (totalAsistencias / 142) + 3000), color: '#c5cae9', max: 200000 },
      { label: 'TRIMESTRE 2', valor: Math.round(80000 * (totalAsistencias / 142) + 1500), color: '#fff9c4', max: 200000 },
      { label: 'TRIMESTRE 1', valor: Math.round(88000 * (totalAsistencias / 142) + 1000), color: '#dcedc8', max: 200000 }
    ];
    const maxTrimValue = Math.max(...trimestrales.map(t => t.valor), 1);

    // Rendimiento individual por auxiliar
    const auxiliares = [
      { nombre: 'Carlos Mendoza', rol: 'Auxiliar Principal', progreso: Math.min(100, Math.round(96 * (tasaResolucion / 96.5))), asistencias: Math.round(48 * (totalAsistencias / 142)), estado: 'Excelente' },
      { nombre: 'Ana Rivas', rol: 'Auxiliar Turno Tarde', progreso: Math.min(100, Math.round(92 * (tasaResolucion / 96.5))), asistencias: Math.round(42 * (totalAsistencias / 142)), estado: 'Excelente' },
      { nombre: 'Jorge Peralta', rol: 'Auxiliar Turno Mañana', progreso: Math.min(100, Math.round(88 * (tasaResolucion / 96.5))), asistencias: Math.round(35 * (totalAsistencias / 142)), estado: 'Bueno' },
      { nombre: 'Elena Gómez', rol: 'Auxiliar de Apoyo', progreso: Math.min(100, Math.round(82 * (tasaResolucion / 96.5))), asistencias: Math.round(17 * (totalAsistencias / 142)), estado: 'Bueno' }
    ];

    return {
      totalAsistencias,
      totalActividades,
      reportesPCs,
      tiempoResp: `${tiempoRespMinutos} min`,
      tasaResolucion,
      tasaResolucionVariacion,
      pcsTotales: basePcsTotales,
      barrasSemanales,
      maxBarValue,
      pathD,
      areaD,
      tareasTotal,
      tareasCompleto,
      tareasEnCurso,
      tareasNoIniciado,
      circ,
      strokeCompleto,
      strokeEnCurso,
      strokeNoIniciado,
      presProyectado,
      presReal,
      presResto,
      riesgos,
      maxRiesgo,
      problemas,
      maxProblema,
      trimestrales,
      maxTrimValue,
      auxiliares
    };
  };

  const datos = obtenerDatosReactivos();

  // KPIs de bloques (Imagen 2) actualizados dinámicamente
  const kpiBlocks = [
    { title: 'Asistencias', value: datos.totalAsistencias.toString(), change: '↑ 12%', subtitle: 'vs anterior' },
    { title: 'Actividades', value: datos.totalActividades.toString(), change: '↑ 3', subtitle: 'vs anterior' },
    { title: 'Reportes (Semana)', value: datos.reportesPCs.toString(), change: '↓ 2', subtitle: 'vs anterior' },
    { title: 'PCs Totales', value: datos.pcsTotales.toString(), change: '↑ 1.5%', subtitle: 'vs anterior' }
  ];

  return (
    <div className="container" style={{ paddingBottom: 'var(--sp-12)' }}>
      {/* Cabecera del Dashboard - Sin el subtítulo global */}
      <PageHeader
        tag="Panel de Control"
        title="Dashboard"
      />

      {/* Selectores de Filtro de Rango (Simulación Imagen 2 - Reactivos) */}
      <div style={{
        display: 'flex',
        gap: 'var(--sp-4)',
        marginBottom: 'var(--sp-6)',
        flexWrap: 'wrap',
        background: 'var(--white)',
        padding: '12px var(--sp-4)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Auto date range</span>
          <select
            value={filtroPeriodo}
            onChange={(e: any) => setFiltroPeriodo(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--outline-variant)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              background: 'var(--surface-container-lowest)',
              color: 'var(--on-surface)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
            <option value="This Semester">This Semester</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Laboratorios</span>
          <select
            value={filtroLab}
            onChange={(e: any) => setFiltroLab(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--outline-variant)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              background: 'var(--surface-container-lowest)',
              color: 'var(--on-surface)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="All">All</option>
            <option value="Lab 1">Lab 1 (Redes)</option>
            <option value="Lab 2">Lab 2 (Programación)</option>
            <option value="Lab 3">Lab 3 (Sistemas)</option>
          </select>
        </div>
      </div>

      {/* --- FILA 1: GRÁFICOS SUPERIORES --- */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 'var(--sp-5)',
        marginBottom: 'var(--sp-6)'
      }}>
        {/* Gráfico de Barras Apiladas (Imagen 2 - Izquierda) */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <div>
            <p style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--on-surface)' }}>
              Puntualidad de Asistencias ({filtroPeriodo === 'This Week' ? 'Semana' : filtroPeriodo === 'This Month' ? 'Mes' : 'Semestre'})
            </p>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Registros de entradas a tiempo vs tardanzas de auxiliares
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: 180, gap: 'var(--sp-3)', paddingBottom: 'var(--sp-2)' }}>
            {datos.barrasSemanales.map((item, idx) => {
              const total = item.punctual + item.retraso;
              // Altura en base al valor máximo dinámico calculado
              const totalHeightPct = (total / datos.maxBarValue) * 100;
              const punctualPct = (item.punctual / total) * 100;
              const retrasoPct = (item.retraso / total) * 100;

              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
                  {/* Contenedor de la barra apilada */}
                  <div style={{
                    width: 22,
                    height: '130px',
                    display: 'flex',
                    flexDirection: 'column-reverse',
                    justifyContent: 'flex-start',
                    background: 'var(--surface-container-high)',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    {/* Contenedor con la altura total proporcional */}
                    <div style={{
                      height: `${totalHeightPct}%`,
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column-reverse',
                      transition: 'height 0.4s ease'
                    }}>
                      {/* Segmento 1: A tiempo (Azul) */}
                      <div style={{
                        height: `${punctualPct}%`,
                        width: '100%',
                        background: '#5c93e2',
                      }} title={`A tiempo: ${item.punctual}`} />

                      {/* Segmento 2: Tardanza (Naranja) */}
                      <div style={{
                        height: `${retrasoPct}%`,
                        width: '100%',
                        background: '#ffb74d',
                      }} title={`Tardanzas: ${item.retraso}`} />
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{item.dia}</span>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 'var(--sp-4)', fontSize: '0.75rem', fontWeight: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: 2, background: '#5c93e2' }} />
              <span>A Tiempo (Puntual)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: 2, background: '#ffb74d' }} />
              <span>Tardanza (Retraso)</span>
            </div>
          </div>
        </div>

        {/* Gráfico de Áreas Suavizadas con Gradiente SVG (Imagen 2 - Derecha) */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <div>
            <p style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--on-surface)' }}>
              Tendencia de Incidencias en Computadoras
            </p>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Frecuencia de reportes de fallas (Filtro: {filtroLab === 'All' ? 'Todos los Labs' : filtroLab})
            </span>
          </div>

          <div style={{ position: 'relative', height: 180, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
            <svg width="100%" height="180" viewBox="0 0 500 180" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0 }}>
              <defs>
                <linearGradient id="splineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9b6b9d" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#5c93e2" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Área rellena dinámicamente con transiciones CSS en path */}
              <path
                d={datos.areaD}
                fill="url(#splineGradient)"
                style={{ transition: 'd 0.5s ease' }}
              />
              {/* Línea principal */}
              <path
                d={datos.pathD}
                fill="none"
                stroke="#9b6b9d"
                strokeWidth="3.5"
                strokeLinecap="round"
                style={{ transition: 'd 0.5s ease' }}
              />
            </svg>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            <span>LUN</span>
            <span>MAR</span>
            <span>MIÉ</span>
            <span>JUE</span>
            <span>VIE</span>
            <span>SÁB</span>
          </div>
        </div>
      </div>

      {/* --- FILA 2: BLOQUE DE KPIs UNITARIOS (Imagen 2 - Reactivo) --- */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 'var(--sp-4)',
        marginBottom: 'var(--sp-8)'
      }}>
        {kpiBlocks.map((kpi, idx) => (
          <div key={idx} className="card" style={{
            padding: 'var(--sp-4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            background: 'var(--white)'
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {kpi.title}
            </span>
            <span style={{ fontFamily: 'Manrope', fontSize: '1.625rem', fontWeight: 800, color: 'var(--on-surface)' }}>
              {kpi.value}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success)' }}>
                {kpi.change}
              </span>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                {kpi.subtitle}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* --- FILA 3: GRÁFICOS INFERIORES (Estilo Imagen 1 - Reactivos) --- */}
      <div style={{ marginBottom: 'var(--sp-4)' }}>
        <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--on-surface)' }}>
          Plantillas de Desempeño y Control de Calidad
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Métricas del plan de soporte basadas en la plantilla KPI (Datos de {filtroLab === 'All' ? 'Todos los laboratorios' : filtroLab})
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 'var(--sp-5)',
        marginBottom: 'var(--sp-8)'
      }}>
        {/* Tareas / Donut de 3 colores (Imagen 1 - Centro - Reactivo) */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <p style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: '0.9375rem', borderBottom: '2px solid #8bc34a', paddingBottom: 6 }}>
            PROYECTOS / TAREAS
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '12px 0' }}>
            <div style={{ position: 'relative', width: 140, height: 140 }}>
              <svg width="140" height="140" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                {/* 1. Completo (Verde Oscuro - 41%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#00c853"
                  strokeWidth="12"
                  strokeDasharray={`${datos.strokeCompleto} ${datos.circ}`}
                  strokeDashoffset="0"
                  style={{ transition: 'stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease' }}
                />
                {/* 2. En Curso (Verde Claro - 36%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#8bc34a"
                  strokeWidth="12"
                  strokeDasharray={`${datos.strokeEnCurso} ${datos.circ}`}
                  strokeDashoffset={-datos.strokeCompleto}
                  style={{ transition: 'stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease' }}
                />
                {/* 3. No Iniciado (Verde Pálido - 23%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#dcedc8"
                  strokeWidth="12"
                  strokeDasharray={`${datos.strokeNoIniciado} ${datos.circ}`}
                  strokeDashoffset={-(datos.strokeCompleto + datos.strokeEnCurso)}
                  style={{ transition: 'stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease' }}
                />
              </svg>
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column'
              }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, transition: 'all 0.3s' }}>{datos.tareasTotal}</span>
                <span style={{ fontSize: '0.625rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Tareas</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', fontSize: '0.6875rem', fontWeight: 700 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 10, height: 10, background: '#dcedc8' }} />
              <span>NO INICIADO ({datos.tareasNoIniciado})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 10, height: 10, background: '#8bc34a' }} />
              <span>EN CURSO ({datos.tareasEnCurso})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 10, height: 10, background: '#00c853' }} />
              <span>COMPLETO ({datos.tareasCompleto})</span>
            </div>
          </div>
        </div>

        {/* Riesgos y Problemas (Imagen 1 - Centro abajo - Reactivos) */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          {/* Riesgos */}
          <div>
            <p style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: '0.9375rem', borderBottom: '2px solid #ffb74d', paddingBottom: 6, marginBottom: 12 }}>
              RIESGOS
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {datos.riesgos.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, width: 60 }}>{item.label}</span>
                  <div style={{ flex: 1, height: 16, background: 'var(--surface-container-high)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${(item.cantidad / datos.maxRiesgo) * 100}%`, height: '100%', background: item.color, transition: 'width 0.4s ease' }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{item.cantidad}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Problemas */}
          <div style={{ marginTop: 'var(--sp-2)' }}>
            <p style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: '0.9375rem', borderBottom: '2px solid #4fc3f7', paddingBottom: 6, marginBottom: 12 }}>
              PROBLEMAS
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {datos.problemas.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, width: 90 }}>{item.label}</span>
                  <div style={{ flex: 1, height: 16, background: 'var(--surface-container-high)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${(item.cantidad / datos.maxProblema) * 100}%`, height: '100%', background: item.color, transition: 'width 0.4s ease' }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{item.cantidad}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

       
      </div>

      {/* --- FILA 4: TABLA DE DATOS DEL PANEL (Imagen 1 - Bottom - Reactiva) --- */}
      <div style={{ marginBottom: 'var(--sp-4)' }}>
        <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--on-surface)' }}>
          Datos del Panel (Tablas Resumen)
        </h2>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 'var(--sp-4)'
      }}>
        {/* Tabla Proyectos / Tareas */}
        <div className="card" style={{ padding: 'var(--sp-4)' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
            PROYECTOS / TAREAS (TOTAL: {datos.tareasTotal})
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'center' }}>
            <thead>
              <tr>
                <th style={{ background: '#dcedc8', padding: '6px 4px', fontWeight: 700, border: '1px solid var(--border)' }}>NO INICIADO</th>
                <th style={{ background: '#8bc34a', padding: '6px 4px', fontWeight: 700, border: '1px solid var(--border)', color: 'var(--white)' }}>EN CURSO</th>
                <th style={{ background: '#00c853', padding: '6px 4px', fontWeight: 700, border: '1px solid var(--border)', color: 'var(--white)' }}>COMPLETO</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: 10, border: '1px solid var(--border)', fontWeight: 700, transition: 'all 0.3s' }}>{datos.tareasNoIniciado}</td>
                <td style={{ padding: 10, border: '1px solid var(--border)', fontWeight: 700, transition: 'all 0.3s' }}>{datos.tareasEnCurso}</td>
                <td style={{ padding: 10, border: '1px solid var(--border)', fontWeight: 700, transition: 'all 0.3s' }}>{datos.tareasCompleto}</td>
              </tr>
            </tbody>
          </table>
        </div>

  

        {/* Tabla Riesgos */}
        <div className="card" style={{ padding: 'var(--sp-4)' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
            RIESGOS DETECTADOS
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'center' }}>
            <thead>
              <tr>
                <th style={{ background: '#e53935', padding: '6px 4px', fontWeight: 700, border: '1px solid var(--border)', color: 'var(--white)' }}>ALTO</th>
                <th style={{ background: '#ffb74d', padding: '6px 4px', fontWeight: 700, border: '1px solid var(--border)', color: 'var(--white)' }}>MEDIO</th>
                <th style={{ background: '#b2ebf2', padding: '6px 4px', fontWeight: 700, border: '1px solid var(--border)' }}>BAJO</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: 10, border: '1px solid var(--border)', fontWeight: 700, transition: 'all 0.3s' }}>{datos.riesgos.find(r => r.label === 'ALTO')?.cantidad || 0}</td>
                <td style={{ padding: 10, border: '1px solid var(--border)', fontWeight: 700, transition: 'all 0.3s' }}>{datos.riesgos.find(r => r.label === 'MEDIO')?.cantidad || 0}</td>
                <td style={{ padding: 10, border: '1px solid var(--border)', fontWeight: 700, transition: 'all 0.3s' }}>{datos.riesgos.find(r => r.label === 'BAJO')?.cantidad || 0}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
