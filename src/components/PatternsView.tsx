import React, { useState, useMemo, useEffect } from "react";
import { DashboardData, businessUnits, appSelections } from "../data";
import { 
  Info, 
  TrendingUp, 
  Calendar, 
  Filter, 
  Award, 
  Trophy, 
  Flame, 
  User, 
  Users,
  Cpu, 
  Building2, 
  Sparkles, 
  Search, 
  ArrowUpDown, 
  ChevronRight, 
  HelpCircle, 
  TrendingDown, 
  X 
} from "lucide-react";

// Color maps for different lines using a sleek, cohesive scale of blues and grays
const AREA_COLORS: Record<string, string> = {
  "Transformación digital": "#1D4ED8", // Royal Blue
  "TI": "#3B82F6",                     // Electric Blue
  "Recursos Humanos": "#64748B",        // Cool Gray/Slate
  "Comercial Electrolit": "#1E3A8A",   // Deep Navy Blue
  "Finanzas": "#334155",               // Dark Slate Gray
  "Calidad": "#0EA5E9",                // Light Sky Blue
  "Logística": "#94A3B8",              // Silver Gray
  "Comercial Farma": "#0284C7",         // Ocean Blue
  "Manufactura": "#475569"             // Solid Slate
};

const APP_COLORS: Record<string, string> = {
  "Exploración abierta": "#1E40AF",    // Dark Blue
  "biblioteca Pisa": "#475569",        // Slate Gray
  "análisis de datos": "#2563EB",      // Cobalt Blue
  "Productividad y oficina": "#788896",// Slate Steel
  "Hada": "#1E293B",                   // Charcoal Navy
  "Agentes especializados": "#0284C7",  // Medium Ocean Blue
  "Investigación": "#94A3B8",          // Cool Silver Gray
  "Imágenes y videos": "#0EA5E9"       // Sky Blue
};

// Static user templates with proportional queries scaling
const userTemplates = [
  { name: "Sofía Martínez", email: "smartinez@corpcab.com.mx", unit: "Transformación digital", pct: 1.2 },
  { name: "Adrián de Ávila", email: "adeavila@corpcab.com.mx", unit: "TI", pct: 1.0 },
  { name: "Ricardo Rocha", email: "rrocha@corpcab.com.mx", unit: "Comercial Electrolit", pct: 0.8 },
  { name: "Mariana Gómez", email: "mgomez@corpcab.com.mx", unit: "Calidad", pct: 0.6 },
  { name: "Valeria Ochoa", email: "vochoa@corpcab.com.mx", unit: "TI", pct: 0.5 },
  { name: "Alejandro Ruiz", email: "aruiz@corpcab.com.mx", unit: "Recursos Humanos", pct: 0.4 },
  { name: "Carlos Mendoza", email: "cmendoza@corpcab.com.mx", unit: "Finanzas", pct: 0.3 },
  { name: "Lorena Flores", email: "lflores@corpcab.com.mx", unit: "Manufactura", pct: 0.2 },
  { name: "Beatriz Corona", email: "bcorona@corpcab.com.mx", unit: "Logística", pct: 0.15 },
  { name: "Héctor Salinas", email: "hsalinas@corpcab.com.mx", unit: "Comercial Farma", pct: 0.1 },
];

// Proportional Area consumption mapping
const areaPercentages: Record<string, number> = {
  "Transformación digital": 32,
  "TI": 24,
  "Recursos Humanos": 15,
  "Comercial Electrolit": 10,
  "Finanzas": 7,
  "Calidad": 5,
  "Logística": 3,
  "Comercial Farma": 2,
  "Manufactura": 2,
};

// Proportional App consumption mapping
const appPercentages: Record<string, number> = {
  "Exploración abierta": 35,
  "biblioteca Pisa": 25,
  "análisis de datos": 18,
  "Productividad y oficina": 10,
  "Hada": 5,
  "Agentes especializados": 4,
  "Investigación": 2,
  "Imágenes y videos": 1,
};

interface PatternsViewProps {
  data: DashboardData;
  selectedUnit: string;
  selectedApp: string;
  timeframe?: 'Mes' | 'Trimestre' | 'Año';
}

/**
 * [Organism] Vista de Patrones de Uso basada exactamente en el Sketch del Usuario.
 * Muestra únicamente la Evolución Histórica de Consultas y el Mapa de Calor de Picos de Uso,
 * controlados por filtros de Área y Aplicación.
 * Ahora incluye desglose del gráfico para ver múltiples líneas por Área o por Aplicación de forma interactiva.
 */
export const PatternsView = ({ data, selectedUnit, selectedApp, timeframe = "Mes" }: PatternsViewProps) => {
  const { timelineData } = data;

  // Local ranking filter selections (combines with general page filters)
  const [localSelectedArea, setLocalSelectedArea] = useState<string>("Todas");
  const [localSelectedApp, setLocalSelectedApp] = useState<string>("Todas");
  const [localSelectedUser, setLocalSelectedUser] = useState<string | null>(null);

  // Sync with main page-level filters when they change
  useEffect(() => {
    setLocalSelectedArea(selectedUnit);
  }, [selectedUnit]);

  useEffect(() => {
    setLocalSelectedApp(selectedApp);
  }, [selectedApp]);

  // Combined selected entities
  const selectedArea = localSelectedArea !== "Todas" ? localSelectedArea : selectedUnit;
  const selectedAppLocal = localSelectedApp !== "Todas" ? localSelectedApp : selectedApp;

  // Dynamic filter multiplier based on selection to make both remaining charts fully reactive
  const filterFactor = useMemo(() => {
    let factor = 1.0;
    if (selectedArea !== "Todas") {
      // Clean deterministic variation based on the area name
      const code = selectedArea.charCodeAt(0) + selectedArea.charCodeAt(selectedArea.length - 1);
      factor *= (0.5 + (code % 5) * 0.12);
    }
    if (selectedAppLocal !== "Todas") {
      // Clean deterministic variation based on the application name
      const code = selectedAppLocal.charCodeAt(0) + selectedAppLocal.charCodeAt(selectedAppLocal.length - 1);
      factor *= (0.55 + (code % 4) * 0.15);
    }
    if (localSelectedUser) {
      const userObj = userTemplates.find(u => u.name === localSelectedUser);
      if (userObj) {
        factor *= (userObj.pct / 1.5); // single user scale factor
      } else {
        factor *= 0.05;
      }
    }
    return factor;
  }, [selectedArea, selectedAppLocal, localSelectedUser]);

  // Chart series view option state: 'consolidated' | 'byArea' | 'byApp'
  const [chartViewMode, setChartViewMode] = useState<'consolidated' | 'byArea' | 'byApp'>('consolidated');

  // List of series turned off manually in legend
  const [visibleSeriesIds, setVisibleSeriesIds] = useState<Record<string, boolean>>({});

  // Hover point tooltip details
  const [hoveredPoint, setHoveredPoint] = useState<{
    seriesName: string;
    label: string;
    value: number;
    color: string;
    x: number;
    y: number;
  } | null>(null);

  // Granularity selector state
  const [timelineGranularity, setTimelineGranularity] = useState<'Día' | 'Semana' | 'Mes'>("Semana");

  // Heatmap hourly hover details state
  const [hoveredCell, setHoveredCell] = useState<{ day: string; hour: number; val: number } | null>(null);

  // --- RANKINGS STATE & COMPUTATIONS ---
  const [activeAreaTab, setActiveAreaTab] = useState<"top" | "bottom">("top");
  const [activeAppTab, setActiveAppTab] = useState<"top" | "bottom">("top");
  const [activeUserTab, setActiveUserTab] = useState<"top" | "bottom">("top");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [selectedRankingDetail, setSelectedRankingDetail] = useState<{
    type: 'area' | 'app' | 'user';
    name: string;
    queries: number;
    extra: Record<string, any>;
  } | null>(null);

  // Dynamic calculations based on current data and active filters
  const totalQueriesMeasured = useMemo(() => {
    const base = data.weeklyConsumptionUnit?.reduce((sum, item) => sum + item.queries, 0) || 12000;
    
    // Scale based on area selection
    let factor = 1.0;
    if (localSelectedArea !== "Todas") {
      const pct = areaPercentages[localSelectedArea] || 15;
      factor *= (pct / 100);
    }
    // Scale based on app selection
    if (localSelectedApp !== "Todas") {
      const pct = appPercentages[localSelectedApp] || 15;
      factor *= (pct / 100);
    }
    // Scale based on user selection
    if (localSelectedUser) {
      const userObj = userTemplates.find(u => u.name === localSelectedUser);
      if (userObj) {
        factor *= (userObj.pct / 100);
      } else {
        factor *= 0.01;
      }
    }
    
    return Math.round(base * factor);
  }, [data, localSelectedArea, localSelectedApp, localSelectedUser]);

  // Average weekly queries per active user calculation
  const avgQueriesPerWeekPerActiveUser = useMemo(() => {
    if (!data || !data.timelineData || data.timelineData.length === 0) {
      return 15.4;
    }
    const ratios = data.timelineData
      .map(pt => pt.activos > 0 ? pt.consultas / pt.activos : 0)
      .filter(r => r > 0);
    if (ratios.length === 0) return 15.4;
    const avgRatio = ratios.reduce((sum, r) => sum + r, 0) / ratios.length;
    
    // Scale based on selections
    let localModifier = 1.0;
    if (localSelectedArea !== "Todas") {
      const code = localSelectedArea.charCodeAt(0) + localSelectedArea.charCodeAt(localSelectedArea.length - 1);
      localModifier *= (0.75 + (code % 4) * 0.1); 
    }
    if (localSelectedApp !== "Todas") {
      const code = localSelectedApp.charCodeAt(0) + localSelectedApp.charCodeAt(localSelectedApp.length - 1);
      localModifier *= (0.8 + (code % 3) * 0.1);
    }
    if (localSelectedUser) {
      localModifier *= 0.12; // A single user's average queries compared to total active users
    }
    
    return Number((avgRatio * localModifier).toFixed(1));
  }, [data, localSelectedArea, localSelectedApp, localSelectedUser]);

  const areasRanking = useMemo(() => {
    return Object.entries(areaPercentages)
      .map(([name, pct]) => {
        const queries = Math.round(totalQueriesMeasured * (pct / 100) * filterFactor);
        return { name, queries, percentage: pct };
      })
      .sort((a, b) => activeAreaTab === "top" ? b.queries - a.queries : a.queries - b.queries);
  }, [totalQueriesMeasured, filterFactor, activeAreaTab]);

  const appsRanking = useMemo(() => {
    return Object.entries(appPercentages)
      .map(([name, pct]) => {
        const queries = Math.round(totalQueriesMeasured * (pct / 100) * filterFactor);
        return { name, queries, percentage: pct };
      })
      .sort((a, b) => activeAppTab === "top" ? b.queries - a.queries : a.queries - b.queries);
  }, [totalQueriesMeasured, filterFactor, activeAppTab]);

  const usersRanking = useMemo(() => {
    return userTemplates
      .map((user) => {
        const queries = Math.round(totalQueriesMeasured * (user.pct / 100) * filterFactor);
        return { ...user, queries };
      })
      .filter((user) => {
        // Filter by area if selected
        if (localSelectedArea !== "Todas" && user.unit !== localSelectedArea) {
          return false;
        }
        if (!userSearchQuery) return true;
        return (
          user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
          user.unit.toLowerCase().includes(userSearchQuery.toLowerCase())
        );
      })
      .sort((a, b) => activeUserTab === "top" ? b.queries - a.queries : a.queries - b.queries);
  }, [totalQueriesMeasured, filterFactor, activeUserTab, userSearchQuery, localSelectedArea]);

  const weeksCount = useMemo(() => {
    if (timeframe === "Trimestre") return 12;
    if (timeframe === "Año") return 52;
    return 4.3; // Promedio de semanas en un mes
  }, [timeframe]);

  // Map Spanish weekday abbreviations for heatmap rows
  const daysOfWeek = [
    { key: "Lunes", short: "L" },
    { key: "Martes", short: "M" },
    { key: "Miércoles", short: "M" },
    { key: "Jueves", short: "J" },
    { key: "Viernes", short: "V" },
    { key: "Sábado", short: "S" },
    { key: "Domingo", short: "D" }
  ];

  // Helper to compute weekday activity heatmap intensity with reactive filtering
  const getCellIntensity = (day: string, hour: number) => {
    const isWeekend = day === "Sábado" || day === "Domingo";
    let baseVal = 10;

    // Night hours
    if (hour < 8 || hour > 20) {
      baseVal = isWeekend ? 5 : 8;
    }
    // Peak hours
    else if (!isWeekend && ((hour >= 10 && hour <= 13) || (hour >= 15 && hour <= 17))) {
      baseVal = 95; // Peak scribble zone
    }
    // Weekday regular working hours
    else if (!isWeekend) {
      baseVal = 65;
    }
    // Weekend daytime
    else if (day === "Sábado" && hour >= 9 && hour <= 14) {
      baseVal = 35;
    }

    // Apply area and application filter multiplier
    let localModifier = filterFactor;
    if (selectedArea !== "Todas") {
      const areaHash = selectedArea.length;
      localModifier *= (0.8 + (areaHash % 4) * 0.1); 
    }
    if (selectedAppLocal !== "Todas") {
      const appHash = selectedAppLocal.length;
      localModifier *= (0.85 + (appHash % 3) * 0.1);
    }

    return Math.min(100, Math.max(1, Math.round(baseVal * localModifier)));
  };

  const avgConsultas = timelineData.reduce((sum, item) => sum + item.consultas, 0) / (timelineData.length || 1);

  // Computed stable labels for graph timeline
  const chartLabels = useMemo(() => {
    if (timelineGranularity === "Día") {
      return ["1 junio", "2 junio", "3 junio", "4 junio", "5 junio", "6 junio", "7 junio"];
    } else if (timelineGranularity === "Semana") {
      return ["Sem. 1", "Sem. 2", "Sem. 3", "Sem. 4", "Sem. 5"];
    } else {
      return ["Ene", "Feb", "Mar", "Abr", "May", "Jun"];
    }
  }, [timelineGranularity]);

  // Construct series data for all options
  const seriesList = useMemo(() => {
    const labels = chartLabels;

    if (chartViewMode === 'consolidated') {
      const values = labels.map((label, idx) => {
        let valFactor = 1.0;
        if (timelineGranularity === "Día") {
          valFactor = idx === 5 ? 0.3 : idx === 6 ? 0.15 : (0.85 + Math.sin(idx * 1.5) * 0.15);
          return {
            label,
            value: Math.round((avgConsultas / 5.2) * valFactor * filterFactor)
          };
        } else if (timelineGranularity === "Semana") {
          valFactor = 0.88 + (idx * 0.055);
          return {
            label,
            value: Math.round(avgConsultas * valFactor * filterFactor)
          };
        } else {
          valFactor = 0.72 + (idx * 0.065);
          return {
            label,
            value: Math.round(avgConsultas * 4.3 * valFactor * filterFactor)
          };
        }
      });

      return [{
        id: "consolidated",
        name: "Consolidado total",
        color: "#0066FF",
        visible: true,
        data: values
      }];
    }

    if (chartViewMode === 'byArea') {
      const areasToDisplay = businessUnits.filter(u => u !== "Todas");
      
      const areaWeights: Record<string, number> = {
        "Transformación digital": 1.35,
        "Recursos Humanos": 0.85,
        "Manufactura": 0.45,
        "Calidad": 0.32,
        "TI": 1.6,
        "Comercial Electrolit": 1.25,
        "Finanzas": 0.78,
        "Logística": 0.62,
        "Comercial Farma": 0.52
      };

      return areasToDisplay.map(areaName => {
        const multiplier = areaWeights[areaName] || 0.8;
        let baseAppFactor = 1.0;
        if (selectedAppLocal !== "Todas") {
          const code = selectedAppLocal.charCodeAt(0) + selectedAppLocal.charCodeAt(selectedAppLocal.length - 1);
          baseAppFactor *= (0.55 + (code % 4) * 0.15);
        }

        const values = labels.map((label, idx) => {
          let valFactor = 1.0;
          const areaHash = areaName.charCodeAt(0) + idx;
          const curveVariation = 0.92 + (Math.sin(areaHash * 0.8) * 0.12);

          if (timelineGranularity === "Día") {
            valFactor = idx === 5 ? 0.3 : idx === 6 ? 0.15 : (0.85 + Math.sin(idx * 1.5) * 0.15);
            return {
              label,
              value: Math.round((avgConsultas / 6.5) * valFactor * multiplier * baseAppFactor * curveVariation)
            };
          } else if (timelineGranularity === "Semana") {
            valFactor = 0.88 + (idx * 0.055);
            return {
              label,
              value: Math.round(avgConsultas * 0.22 * valFactor * multiplier * baseAppFactor * curveVariation)
            };
          } else {
            valFactor = 0.72 + (idx * 0.065);
            return {
              label,
              value: Math.round(avgConsultas * 0.95 * valFactor * multiplier * baseAppFactor * curveVariation)
            };
          }
        });

        const visible = visibleSeriesIds[areaName] !== false && (selectedArea === "Todas" || selectedArea === areaName);

        return {
          id: areaName,
          name: areaName,
          color: AREA_COLORS[areaName] || "#475569",
          visible,
          data: values
        };
      });
    }

    if (chartViewMode === 'byApp') {
      const appsToDisplay = appSelections.filter(app => app !== "Todas");

      const appWeights: Record<string, number> = {
        "Exploración abierta": 1.45,
        "biblioteca Pisa": 1.15,
        "análisis de datos": 1.05,
        "Productividad y oficina": 0.9,
        "Hada": 0.8,
        "Agentes especializados": 0.72,
        "Investigación": 0.52,
        "Imágenes y videos": 0.42
      };

      return appsToDisplay.map(appName => {
        const multiplier = appWeights[appName] || 0.75;
        let baseAreaFactor = 1.0;
        if (selectedArea !== "Todas") {
          const code = selectedArea.charCodeAt(0) + selectedArea.charCodeAt(selectedArea.length - 1);
          baseAreaFactor *= (0.5 + (code % 5) * 0.12);
        }

        const values = labels.map((label, idx) => {
          let valFactor = 1.0;
          const appHash = appName.charCodeAt(0) + idx;
          const curveVariation = 0.94 + (Math.sin(appHash * 1.1) * 0.1);

          if (timelineGranularity === "Día") {
            valFactor = idx === 5 ? 0.3 : idx === 6 ? 0.15 : (0.85 + Math.sin(idx * 1.5) * 0.15);
            return {
              label,
              value: Math.round((avgConsultas / 6.2) * valFactor * multiplier * baseAreaFactor * curveVariation)
            };
          } else if (timelineGranularity === "Semana") {
            valFactor = 0.88 + (idx * 0.055);
            return {
              label,
              value: Math.round(avgConsultas * 0.24 * valFactor * multiplier * baseAreaFactor * curveVariation)
            };
          } else {
            valFactor = 0.72 + (idx * 0.065);
            return {
              label,
              value: Math.round(avgConsultas * 1.02 * valFactor * multiplier * baseAreaFactor * curveVariation)
            };
          }
        });

        const visible = visibleSeriesIds[appName] !== false && (selectedAppLocal === "Todas" || selectedAppLocal === appName);

        return {
          id: appName,
          name: appName,
          color: APP_COLORS[appName] || "#475569",
          visible,
          data: values
        };
      });
    }

    return [];
  }, [chartViewMode, timelineGranularity, avgConsultas, filterFactor, selectedArea, selectedAppLocal, visibleSeriesIds, chartLabels]);

  // Coordinates Mapping for timeline SVG line chart
  const width = 600;
  const height = 200;
  const paddingX = 40;
  const paddingY = 25;

  const seriesWithCoords = useMemo(() => {
    const allVisibleValues = seriesList
      .filter(s => s.visible)
      .flatMap(s => s.data.map(d => d.value));

    const maxVal = Math.max(...allVisibleValues) * 1.18 || 100;

    return seriesList.map(series => {
      const coords = series.data.map((d, idx) => {
        const x = paddingX + (idx * (width - 2 * paddingX)) / (series.data.length - 1);
        const y = height - paddingY - ((d.value / maxVal) * (height - 2 * paddingY));
        return { x, y, value: d.value };
      });

      return {
        ...series,
        coords
      };
    });
  }, [seriesList]);

  // Highlight check for line styling
  const isHighlighted = (seriesName: string) => {
    if (chartViewMode === 'consolidated') return true;
    if (chartViewMode === 'byArea') {
      if (selectedArea === "Todas") return true;
      return seriesName === selectedArea;
    }
    if (chartViewMode === 'byApp') {
      if (selectedAppLocal === "Todas") return true;
      return seriesName === selectedAppLocal;
    }
    return true;
  };

  const getPath = (coords: { x: number; y: number }[]) => {
    return coords.reduce((acc, c, idx) => {
      return idx === 0 ? `M ${c.x} ${c.y}` : `${acc} L ${c.x} ${c.y}`;
    }, "");
  };

  return (
    <div className="flex flex-col gap-p-md animate-fade-in">
      
      {/* LOCAL FILTERS ACTIVE INDICATOR BAR */}
      {(localSelectedArea !== "Todas" || localSelectedApp !== "Todas" || localSelectedUser !== null) && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-brand-50 border border-brand-500/20 rounded-md shadow-xs text-xs animate-fade-in">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold text-brand-700 uppercase tracking-wider flex items-center gap-1 shrink-0">
              <Filter size={11} />
              Filtros activos:
            </span>
            
            {localSelectedArea !== "Todas" && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-white border border-brand-500/20 text-brand-700 px-2.5 py-0.5 rounded-full shadow-2xs">
                Unidad de negocio: {localSelectedArea}
                <button 
                  onClick={() => {
                    setLocalSelectedArea("Todas");
                    setLocalSelectedUser(null);
                  }}
                  className="hover:bg-brand-100 text-brand-500 hover:text-brand-700 rounded-full p-0.5 transition-colors cursor-pointer"
                >
                  <X size={10} />
                </button>
              </span>
            )}

            {localSelectedApp !== "Todas" && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-white border border-brand-500/20 text-brand-700 px-2.5 py-0.5 rounded-full shadow-2xs">
                Aplicación: {localSelectedApp}
                <button 
                  onClick={() => setLocalSelectedApp("Todas")}
                  className="hover:bg-brand-100 text-brand-500 hover:text-brand-700 rounded-full p-0.5 transition-colors cursor-pointer"
                >
                  <X size={10} />
                </button>
              </span>
            )}

            {localSelectedUser && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-white border border-brand-500/20 text-brand-700 px-2.5 py-0.5 rounded-full shadow-2xs">
                Usuario: {localSelectedUser}
                <button 
                  onClick={() => {
                    setLocalSelectedUser(null);
                    setLocalSelectedArea("Todas");
                  }}
                  className="hover:bg-brand-100 text-brand-500 hover:text-brand-700 rounded-full p-0.5 transition-colors cursor-pointer"
                >
                  <X size={10} />
                </button>
              </span>
            )}
          </div>

          <button
            onClick={() => {
              setLocalSelectedArea("Todas");
              setLocalSelectedApp("Todas");
              setLocalSelectedUser(null);
            }}
            className="text-[10px] font-bold text-neutral-raw-500 hover:text-brand-600 transition-colors cursor-pointer hover:underline uppercase tracking-wide"
          >
            Limpiar todos
          </button>
        </div>
      )}
      
      {/* TARJETAS DE KPIS INDEPENDIENTES EN LA PARTE SUPERIOR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        
        {/* KPI 1: CONSULTAS TOTALES */}
        <div className="group relative flex flex-col justify-between rounded-lg border border-neutral-raw-600/20 bg-white p-4 w-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm hover:border-brand-500/50 min-h-[105px] shadow-sm">
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="flex items-center justify-center transition-transform group-hover:scale-105 duration-300 shrink-0 text-brand-600">
                <Sparkles size={16} />
              </div>
              <span className="text-[11px] font-semibold text-neutral-raw-600 truncate block leading-tight font-sans">
                Consultas Totales
              </span>
            </div>
          </div>

          <div className="w-full h-px bg-neutral-raw-200 my-2 opacity-50" />

          <div className="flex items-baseline justify-between mt-0.5">
            <span className="text-2xl font-bold tracking-tight text-neutral-raw-800 font-sans">
              {totalQueriesMeasured.toLocaleString('es-MX')}
            </span>
            
            <div className="flex items-center">
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1 py-0.5 rounded-md shrink-0 font-sans bg-emerald-500/10 text-emerald-700">
                <TrendingUp size={9} className="shrink-0" />
                <span>+12.4%</span>
              </span>
            </div>
          </div>
        </div>

        {/* KPI 2: PROMEDIO DE CONSULTAS POR SEMANA */}
        <div className="group relative flex flex-col justify-between rounded-lg border border-neutral-raw-600/20 bg-white p-4 w-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm hover:border-brand-500/50 min-h-[105px] shadow-sm">
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="flex items-center justify-center transition-transform group-hover:scale-105 duration-300 shrink-0 text-brand-600">
                <Calendar size={16} />
              </div>
              <span className="text-[11px] font-semibold text-neutral-raw-600 truncate block leading-tight font-sans">
                Consultas Semanal / Activo
              </span>
            </div>
          </div>

          <div className="w-full h-px bg-neutral-raw-200 my-2 opacity-50" />

          <div className="flex items-baseline justify-between mt-0.5">
            <span className="text-2xl font-bold tracking-tight text-neutral-raw-800 font-sans">
              {avgQueriesPerWeekPerActiveUser} <span className="text-xs font-semibold text-neutral-raw-500 font-sans">c.</span>
            </span>
            
            <div className="flex items-center">
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1 py-0.5 rounded-md shrink-0 font-sans bg-emerald-500/10 text-emerald-700">
                <TrendingUp size={9} className="shrink-0" />
                <span>+8.1%</span>
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* SECCIÓN: HISTÓRICO DE TENDENCIAS DE CONSULTAS (CHART SECTION - FULL WIDTH) */}
      <section className="w-full bg-white border border-neutral-raw-600/20 rounded-md p-p-lg flex flex-col gap-p-md shadow-sm relative">
        
        {/* Info Icon Tooltip in top-right corner of the section */}
        <div className="absolute top-4 right-4 z-30 group/info">
          <button
            type="button"
            className="text-neutral-raw-400 hover:text-brand-600 transition-colors p-1 rounded-full hover:bg-neutral-raw-50 focus:outline-hidden cursor-help flex items-center justify-center"
            aria-label="Información sobre evolución de consultas"
          >
            <Info size={15} />
          </button>
          {/* Tooltip Card */}
          <div className="absolute right-0 top-8 w-72 bg-white border border-neutral-raw-600/20 rounded-lg shadow-lg p-3 text-[11px] text-neutral-raw-700 pointer-events-none opacity-0 translate-y-1 group-hover/info:opacity-100 group-hover/info:translate-y-0 group-hover/info:pointer-events-auto transition-all duration-200 z-50">
            <div className="flex items-start gap-2">
              <Info size={13} className="text-brand-600 shrink-0 mt-[2px]" />
              <div className="flex flex-col gap-1">
                <span className="font-bold text-neutral-raw-800">Evolución de Consultas</span>
                <p className="leading-normal font-sans text-neutral-raw-600">
                  El gráfico representa la <strong>evolución temporal de consultas</strong> {chartViewMode === 'byArea' ? "desglosado por direcciones" : chartViewMode === 'byApp' ? "desglosado por herramientas tecnológicas" : ""}. {chartViewMode !== 'consolidated' && "Puedes interactuar alternando las líneas visibles en la leyenda inferior."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-p-md pb-p-xs border-b border-neutral-raw-100 pr-8 sm:pr-0">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-brand-500" size={15} />
            <div>
              <h3 className="text-[13px] font-bold text-neutral-raw-700 font-sans tracking-wide">
                Evolución de Consultas: Tendencia histórica interactiva
              </h3>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center">
            {/* Controller for Switching Dimension */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-neutral-raw-400 uppercase tracking-wider">
                Dimensión del Histórico:
              </span>
              <div className="flex rounded-md border border-neutral-raw-600/10 p-0.5 bg-neutral-raw-100 relative h-[32px] w-[295px]">
                <button
                  onClick={() => {
                    setChartViewMode('consolidated');
                    setVisibleSeriesIds({});
                    setHoveredPoint(null);
                  }}
                  className={`flex-1 text-center text-[11px] font-bold rounded-sm transition-all relative z-10 cursor-pointer ${
                    chartViewMode === 'consolidated'
                      ? "bg-white text-brand-600 shadow-sm font-extrabold"
                      : "text-neutral-raw-500 hover:text-neutral-raw-800"
                  }`}
                >
                  Consolidado
                </button>
                <button
                  onClick={() => {
                    setChartViewMode('byArea');
                    setVisibleSeriesIds({});
                    setHoveredPoint(null);
                  }}
                  className={`flex-1 text-center text-[11px] font-bold rounded-sm transition-all relative z-10 cursor-pointer ${
                    chartViewMode === 'byArea'
                      ? "bg-white text-brand-600 shadow-sm font-extrabold"
                      : "text-neutral-raw-500 hover:text-neutral-raw-800"
                  }`}
                >
                  Direcciones
                </button>
                <button
                  onClick={() => {
                    setChartViewMode('byApp');
                    setVisibleSeriesIds({});
                    setHoveredPoint(null);
                  }}
                  className={`flex-1 text-center text-[11px] font-bold rounded-sm transition-all relative z-10 cursor-pointer ${
                    chartViewMode === 'byApp'
                      ? "bg-white text-brand-600 shadow-sm font-extrabold"
                      : "text-neutral-raw-500 hover:text-neutral-raw-800"
                  }`}
                >
                  Herramientas
                </button>
              </div>
            </div>

            {/* Period selector buttons */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-neutral-raw-500">
                Granularidad:
              </span>
              <div className="flex rounded-sm border border-neutral-raw-600/20 p-[2px] bg-neutral-raw-100">
                {(["Día", "Semana", "Mes"] as const).map((period) => (
                  <button
                    key={period}
                    id={`period-btn-${period.toLowerCase()}`}
                    onClick={() => {
                      setTimelineGranularity(period);
                      setHoveredPoint(null);
                    }}
                    className={`px-3 py-1 text-[11px] font-semibold rounded-sm cursor-pointer transition-all ${
                      timelineGranularity === period
                        ? "bg-white text-neutral-raw-800 shadow-sm font-semibold"
                        : "text-neutral-raw-600 hover:text-neutral-raw-800 hover:bg-white/40"
                    }`}
                    style={{ minHeight: "28px" }}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full">
          <div className="relative w-full overflow-x-auto">
            <div className="relative min-w-[500px] h-[210px] mt-2 pb-2">
              
              {/* TOOLTIP OVERLAY */}
              {hoveredPoint && (
                <div 
                  className="absolute z-20 pointer-events-none bg-neutral-raw-900 border border-neutral-raw-800 text-white rounded-sm px-2.5 py-1.5 shadow-md flex flex-col gap-0.5"
                  style={{
                    left: `${(hoveredPoint.x / width) * 100}%`,
                    top: `${(hoveredPoint.y / height) * 100 - 15}%`,
                    transform: 'translate(-50%, -100%)',
                  }}
                >
                  <div className="flex items-center gap-1.5 text-[10px] font-sans font-semibold tracking-wider text-slate-300 uppercase">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: hoveredPoint.color }} />
                    <strong>{hoveredPoint.seriesName}</strong>
                  </div>
                  <div className="text-[11px] font-bold font-sans">
                    {hoveredPoint.label}: <span className="text-brand-300">{hoveredPoint.value.toLocaleString('es-MX')}</span>
                  </div>
                </div>
              )}

              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[180px]">
                {/* Background grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                  const y = paddingY + ratio * (height - 2 * paddingY);
                  return (
                    <line 
                      key={idx}
                      x1={paddingX} 
                      y1={y} 
                      x2={width - paddingX} 
                      y2={y} 
                      stroke="#E5E7EB" 
                      strokeWidth="1" 
                      strokeDasharray="4 4"
                    />
                  );
                })}

                {/* Render each visible line */}
                {seriesWithCoords.map((series) => {
                  if (!series.visible) return null;

                  const highlighted = isHighlighted(series.name);
                  const strokeWidth = highlighted ? (chartViewMode === 'consolidated' ? 3.5 : 2.8) : 1.2;
                  const opacity = highlighted ? 1 : 0.22;

                  return (
                    <g key={series.id}>
                      {/* Line path */}
                      <path 
                        d={getPath(series.coords)} 
                        fill="none" 
                        stroke={series.color} 
                        strokeWidth={strokeWidth}
                        opacity={opacity}
                        className="transition-all duration-300"
                      />

                      {/* Nodes for this line */}
                      {series.coords.map((node, nodeIdx) => (
                        <g key={nodeIdx} className="group/node">
                          {/* Hover outline detector */}
                          <circle 
                            cx={node.x} 
                            cy={node.y} 
                            r="7" 
                            fill="transparent"
                            className="cursor-pointer"
                            onMouseEnter={() => setHoveredPoint({
                              seriesName: series.name,
                              label: series.data[nodeIdx].label,
                              value: node.value,
                              color: series.color,
                              x: node.x,
                              y: node.y
                            })}
                            onMouseLeave={() => setHoveredPoint(null)}
                          />
                          {/* Dot point */}
                          <circle 
                            cx={node.x} 
                            cy={node.y} 
                            r={highlighted ? "3.5" : "2"} 
                            fill={series.color} 
                            stroke="#FFF" 
                            strokeWidth={highlighted ? "1.2" : "0.8"}
                            opacity={opacity}
                            className="cursor-pointer"
                          />
                        </g>
                      ))}
                    </g>
                  );
                })}
              </svg>

              {/* X-Axis labels */}
              <div className="flex justify-between px-p-lg text-[10px] text-neutral-raw-400 font-bold font-sans uppercase tracking-wider">
                {chartLabels.map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CLICKABLE SERIES LEGEND SECTION */}
        {chartViewMode !== 'consolidated' && (
          <div className="mt-4 border-t border-neutral-raw-100 pt-3">
            <div className="flex items-center gap-1.5 mb-2 text-neutral-raw-500">
              <Filter size={14} className="text-neutral-raw-400" />
              <span className="text-[11px] font-semibold text-neutral-raw-500">
                Personalizar líneas visibles en gráfico (Haz clic para ocultar/mostrar):
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {seriesList.map((series) => {
                const highlighted = isHighlighted(series.name);
                return (
                  <button
                    key={series.id}
                    onClick={() => {
                      setVisibleSeriesIds((prev) => ({
                        ...prev,
                        [series.id]: prev[series.id] === false ? true : false,
                      }));
                    }}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border text-[11px] font-medium transition-all cursor-pointer ${
                      series.visible
                        ? "bg-neutral-raw-50/50 border-neutral-raw-600/20 text-neutral-raw-800"
                        : "bg-white border-neutral-raw-600/20 text-neutral-raw-400 opacity-50 line-through"
                    } ${highlighted ? "ring-2 ring-brand-500/10 font-bold" : ""}`}
                  >
                    <span 
                      className="h-2 w-2 rounded-full" 
                      style={{ backgroundColor: series.color }}
                    />
                    <span>{series.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </section>

      {/* SECCIÓN 2: TABLEROS DE RANKINGS (BENTO GRID) */}
      <section className="bg-white border border-neutral-raw-600/20 rounded-md p-p-lg flex flex-col gap-p-md shadow-sm">
        
        {/* Title and Header info */}
        <div className="flex flex-col md:flex-row md:items-center pb-p-xs border-b border-neutral-raw-100 pr-8 sm:pr-0">
          <div className="flex items-center gap-2">
            <div>
              <h3 className="text-[13px] font-bold text-neutral-raw-700 font-sans tracking-wide">
                Ranking de consultas
              </h3>
            </div>
          </div>
        </div>

        {/* Bento Grid layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-p-md items-stretch">
          
          {/* COLUMN 1: RANKING POR ÁREA */}
          <div className="border border-neutral-raw-600/10 rounded-lg p-4 flex flex-col bg-neutral-raw-50/20 hover:border-neutral-raw-600/20 transition-colors shadow-xs h-[510px]">
            <div className="flex justify-between items-center pb-2.5 border-b border-neutral-raw-100 mb-3.5 shrink-0">
              <div className="flex items-center gap-2">
                <div>
                  <h4 className="text-xs font-bold text-neutral-raw-800">Unidades de negocio</h4>
                </div>
              </div>
            </div>

            {/* Table Header */}
            <div className="flex items-center justify-between text-[9px] font-bold text-neutral-raw-400 uppercase tracking-wider pb-1.5 border-b border-neutral-raw-100/50 mb-1.5 px-1.5 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-5 text-center">#</span>
                <span>Unidad de negocio</span>
              </div>
              <span>Consultas</span>
            </div>

            {/* List entries */}
            <div className="flex flex-col gap-2 flex-grow overflow-y-auto pr-1">
              {areasRanking.slice(0, 8).map((item, idx) => {
                const maxVal = Math.max(...areasRanking.map(a => a.queries)) || 1;
                const percentBar = Math.round((item.queries / maxVal) * 100);
                const displayRank = activeAreaTab === "top" ? idx + 1 : areasRanking.length - idx;
                const isSelected = localSelectedArea === item.name;
                
                return (
                  <div 
                    key={item.name} 
                    onClick={() => {
                      if (isSelected) {
                        setLocalSelectedArea("Todas");
                        setLocalSelectedUser(null);
                      } else {
                        setLocalSelectedArea(item.name);
                        setLocalSelectedUser(null);
                      }
                    }}
                    className={`flex flex-col gap-1 py-1.5 px-2 rounded-md transition-all cursor-pointer border ${
                      isSelected 
                        ? "bg-brand-50/70 border-brand-300 shadow-2xs" 
                        : "border-transparent hover:bg-neutral-raw-50/50"
                    } shrink-0`}
                  >
                    <div className="flex items-center justify-between text-[11px] min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`text-[10px] font-bold font-mono w-5 shrink-0 ${isSelected ? "text-brand-600" : "text-neutral-raw-400"}`}>#{displayRank}</span>
                        <span className={`font-bold truncate ${isSelected ? "text-brand-800" : "text-neutral-raw-700"}`}>{item.name}</span>
                      </div>
                      <span className={`font-bold font-mono text-[10px] ${isSelected ? "text-brand-700 font-extrabold" : "text-neutral-raw-600"}`}>
                        {item.queries.toLocaleString('es-MX')}
                      </span>
                    </div>
                    {/* Visual Bar aligned under the text */}
                    <div className="pl-7">
                      <div className="w-full h-1 bg-neutral-raw-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-300"
                          style={{ 
                            width: `${percentBar}%`,
                            backgroundColor: isSelected ? "#1D4ED8" : (AREA_COLORS[item.name] || "#475569")
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* COLUMN 2: RANKING POR APLICACIÓN */}
          <div className="border border-neutral-raw-600/10 rounded-lg p-4 flex flex-col bg-neutral-raw-50/20 hover:border-neutral-raw-600/20 transition-colors shadow-xs h-[510px]">
            <div className="flex justify-between items-center pb-2.5 border-b border-neutral-raw-100 mb-3.5 shrink-0">
              <div className="flex items-center gap-2">
                <div>
                  <h4 className="text-xs font-bold text-neutral-raw-800">Capacidades</h4>
                </div>
              </div>
            </div>

            {/* Table Header */}
            <div className="flex items-center justify-between text-[9px] font-bold text-neutral-raw-400 uppercase tracking-wider pb-1.5 border-b border-neutral-raw-100/50 mb-1.5 px-1.5 shrink-0">
               <div className="flex items-center gap-2">
                 <span className="w-5 text-center">#</span>
                 <span>Capacidad</span>
               </div>
               <span>Consultas</span>
             </div>

            {/* List entries */}
            <div className="flex flex-col gap-2 flex-grow overflow-y-auto pr-1">
              {appsRanking.slice(0, 8).map((item, idx) => {
                const maxVal = Math.max(...appsRanking.map(a => a.queries)) || 1;
                const percentBar = Math.round((item.queries / maxVal) * 100);
                const displayRank = activeAppTab === "top" ? idx + 1 : appsRanking.length - idx;
                const isSelected = localSelectedApp === item.name;
                
                return (
                  <div 
                    key={item.name} 
                    onClick={() => {
                      if (isSelected) {
                        setLocalSelectedApp("Todas");
                      } else {
                        setLocalSelectedApp(item.name);
                      }
                    }}
                    className={`flex flex-col gap-1 py-1.5 px-2 rounded-md transition-all cursor-pointer border ${
                      isSelected 
                        ? "bg-brand-50/70 border-brand-300 shadow-2xs" 
                        : "border-transparent hover:bg-neutral-raw-50/50"
                    } shrink-0`}
                  >
                    <div className="flex items-center justify-between text-[11px] min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`text-[10px] font-bold font-mono w-5 shrink-0 ${isSelected ? "text-brand-600" : "text-neutral-raw-400"}`}>#{displayRank}</span>
                        <span className={`font-bold truncate ${isSelected ? "text-brand-800" : "text-neutral-raw-700"}`}>{item.name}</span>
                      </div>
                      <span className={`font-bold font-mono text-[10px] ${isSelected ? "text-brand-700 font-extrabold" : "text-neutral-raw-600"}`}>
                        {item.queries.toLocaleString('es-MX')}
                      </span>
                    </div>
                    {/* Visual Bar aligned under the text */}
                    <div className="pl-7">
                      <div className="w-full h-1 bg-neutral-raw-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-300"
                          style={{ 
                            width: `${percentBar}%`,
                            backgroundColor: isSelected ? "#1E40AF" : (APP_COLORS[item.name] || "#475569")
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* COLUMN 3: RANKING POR USUARIOS (COLABORADORES LÍDERES) */}
          <div className="border border-neutral-raw-600/10 rounded-lg p-4 flex flex-col bg-neutral-raw-50/20 hover:border-neutral-raw-600/20 transition-colors shadow-xs h-[510px]">
            <div className="flex flex-col gap-2 pb-2.5 border-b border-neutral-raw-100 mb-3.5 shrink-0">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-neutral-raw-800">Usuarios</h4>
                  </div>
                </div>
              </div>

              {/* Dynamic search inside card */}
              <div className="relative mt-1">
                <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-raw-400" />
                <input 
                  type="text"
                  placeholder="Buscar usuario..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full text-[10px] pl-7 pr-2 py-1 rounded border border-neutral-raw-600/10 focus:border-brand-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-2 text-[9px] font-bold text-neutral-raw-400 uppercase tracking-wider pb-1.5 border-b border-neutral-raw-100/50 mb-1.5 px-1.5 shrink-0">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-4">Usuario</div>
              <div className="col-span-3">Unidad de negocio</div>
              <div className="col-span-2 text-right">Consultas</div>
              <div className="col-span-2 text-right">Prom/Sem</div>
            </div>

            {/* List entries */}
            <div className="flex flex-col gap-1.5 flex-grow overflow-y-auto pr-1">
              {usersRanking.slice(0, 8).map((user, idx) => {
                const absoluteIndex = userTemplates.findIndex(u => u.email === user.email);
                const displayRank = absoluteIndex !== -1 ? absoluteIndex + 1 : idx + 1;
                const isSelected = localSelectedUser === user.name;

                return (
                  <div 
                    key={user.email} 
                    onClick={() => {
                      if (isSelected) {
                        setLocalSelectedUser(null);
                        setLocalSelectedArea("Todas");
                      } else {
                        setLocalSelectedUser(user.name);
                        setLocalSelectedArea(user.unit);
                      }
                    }}
                    className={`grid grid-cols-12 items-center gap-2 py-1 px-1.5 rounded transition-all cursor-pointer border ${
                      isSelected 
                        ? "bg-brand-50/70 border-brand-300 shadow-2xs" 
                        : "border-transparent hover:bg-neutral-raw-50/50"
                    } shrink-0`}
                  >
                    <div className={`col-span-1 text-center text-[10px] font-bold font-mono ${isSelected ? "text-brand-600" : "text-neutral-raw-400"}`}>
                      #{displayRank}
                    </div>
                    <div className="col-span-4 flex flex-col min-w-0">
                      <span className={`text-[11px] font-bold truncate leading-tight ${isSelected ? "text-brand-800" : "text-neutral-raw-700"}`}>
                        {user.name}
                      </span>
                    </div>
                    <div className="col-span-3 min-w-0">
                      <span className={`text-[10px] font-medium truncate block ${isSelected ? "text-brand-600/80" : "text-neutral-raw-500"}`}>
                        {user.unit}
                      </span>
                    </div>
                    <div className="col-span-2 text-right">
                      <span className={`font-bold font-mono text-[11px] ${isSelected ? "text-brand-700 font-extrabold" : "text-neutral-raw-700"}`}>
                        {user.queries.toLocaleString('es-MX')}
                      </span>
                    </div>
                    <div className="col-span-2 text-right">
                      <span className="text-[10px] text-brand-600 font-bold font-mono">
                        {Math.round(user.queries / weeksCount).toLocaleString('es-MX')}
                      </span>
                    </div>
                  </div>
                );
              })}

              {usersRanking.length === 0 && (
                <div className="flex flex-col items-center justify-center py-6 text-center shrink-0">
                  <span className="text-[10px] text-neutral-raw-400 font-semibold uppercase">Sin resultados</span>
                </div>
              )}
            </div>
          </div>

        </div>

      </section>

      {/* SECCIÓN 4: MAPA DE CALOR - PICOS DE USO HORARIOS POR DÍA */}
      <section className="bg-white border border-neutral-raw-600/20 rounded-md p-p-lg flex flex-col gap-p-md shadow-sm relative">
        
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-p-md pb-p-xs border-b border-neutral-raw-100 pr-8 sm:pr-0">
          <div className="flex items-center gap-2">
            <Calendar className="text-brand-500" size={15} />
            <div>
              <h3 className="text-[13px] font-bold text-neutral-raw-700 font-sans tracking-wide">
                Mapa de Calor: Picos de Uso Horarios por Día de la Semana
              </h3>
              <p className="text-[10.5px] text-neutral-raw-400 font-medium">
                Visualización de densidad de consultas para identificar patrones de tráfico y alta demanda
              </p>
            </div>
          </div>
        </div>

        {/* Heatmap Grid Container */}
        <div className="relative w-full overflow-x-auto mt-2">
          <div className="min-w-[760px] pb-4 pr-2">
            {/* Hour Labels Header Row */}
            <div className="flex items-center mb-1">
              {/* Spacer for day labels column */}
              <div className="w-16 shrink-0" />
              {/* Hour Columns Headers using inline grid template columns for pixel perfect repeat 24 columns */}
              <div className="flex-grow gap-[2px]" style={{ display: "grid", gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}>
                {Array.from({ length: 24 }).map((_, hour) => {
                  const displayHour = hour === 0 ? "12am" : hour === 12 ? "12pm" : hour > 12 ? `${hour - 12}pm` : `${hour}am`;
                  // Render label only for even hours to maintain clean typography
                  const shouldRenderLabel = hour % 2 === 0;
                  return (
                    <div key={hour} className="text-[9px] font-bold text-neutral-raw-400 font-mono uppercase tracking-tighter text-center">
                      {shouldRenderLabel ? displayHour : ""}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Day Rows */}
            <div className="flex flex-col gap-[3px]">
              {daysOfWeek.map((day) => (
                <div key={day.key} className="flex items-center">
                  {/* Day Row Label */}
                  <div className="w-16 shrink-0 text-left pr-2">
                    <span className="text-[10px] font-bold text-neutral-raw-600 uppercase tracking-wide">
                      {day.key}
                    </span>
                  </div>

                  {/* 24 Cells for the day using custom repeating columns */}
                  <div className="flex-grow gap-[2px]" style={{ display: "grid", gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}>
                    {Array.from({ length: 24 }).map((_, hour) => {
                      const val = getCellIntensity(day.key, hour);
                      
                      // Background opacity based on val using brand color (#0066FF)
                      const cellBgColor = val <= 10 
                        ? "rgba(0, 102, 255, 0.04)" 
                        : val <= 30 
                          ? "rgba(0, 102, 255, 0.15)" 
                          : val <= 50 
                            ? "rgba(0, 102, 255, 0.35)" 
                            : val <= 70 
                              ? "rgba(0, 102, 255, 0.55)" 
                              : val <= 90 
                                ? "rgba(0, 102, 255, 0.75)" 
                                : "rgba(0, 102, 255, 0.95)";

                      const isHovered = hoveredCell?.day === day.key && hoveredCell?.hour === hour;

                      return (
                        <div
                          key={hour}
                          onMouseEnter={() => setHoveredCell({ day: day.key, hour, val })}
                          onMouseLeave={() => setHoveredCell(null)}
                          className={`h-7 rounded-[2px] transition-all cursor-pointer relative ${
                            isHovered ? "ring-2 ring-neutral-raw-800 scale-[1.05] z-10 shadow-md" : ""
                          }`}
                          style={{ backgroundColor: cellBgColor }}
                        >
                          {/* Inner cell interactive visual feedback (subtle white dot on high activity) */}
                          {val > 80 && (
                            <span className="absolute inset-0 m-auto h-[3px] w-[3px] rounded-full bg-white opacity-40" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Heatmap Tooltip overlay */}
            {hoveredCell && (
              <div className="absolute z-40 bg-neutral-raw-900 border border-neutral-raw-800 text-white rounded-sm px-2.5 py-1.5 shadow-md flex flex-col gap-0.5 text-left pointer-events-none transition-all duration-100 max-w-xs"
                style={{
                  left: '50%',
                  bottom: '45px',
                  transform: 'translateX(-50%)'
                }}
              >
                <div className="flex items-center gap-1.5 text-[9px] font-sans font-semibold tracking-wider text-slate-300 uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse" />
                  <strong>Pico de Uso Detectado</strong>
                </div>
                <div className="text-[11px] font-bold font-sans">
                  {hoveredCell.day} • {hoveredCell.hour === 0 ? "12:00 am" : hoveredCell.hour === 12 ? "12:00 pm" : hoveredCell.hour > 12 ? `${hoveredCell.hour - 12}:00 pm` : `${hoveredCell.hour}:00 am`}
                </div>
                <div className="text-[10px] text-brand-300 font-semibold font-sans">
                  Intensidad del canal: <span className="text-white font-extrabold">{hoveredCell.val}%</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Heatmap Legend */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-1 pt-3 border-t border-neutral-raw-100">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-neutral-raw-400 font-bold uppercase tracking-wider">Escala de Uso:</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[9.5px] font-semibold text-neutral-raw-500">Mínimo</span>
              <div className="flex gap-[2px]">
                <span className="w-4 h-3.5 rounded-[1px]" style={{ backgroundColor: "rgba(0, 102, 255, 0.04)" }} />
                <span className="w-4 h-3.5 rounded-[1px]" style={{ backgroundColor: "rgba(0, 102, 255, 0.15)" }} />
                <span className="w-4 h-3.5 rounded-[1px]" style={{ backgroundColor: "rgba(0, 102, 255, 0.35)" }} />
                <span className="w-4 h-3.5 rounded-[1px]" style={{ backgroundColor: "rgba(0, 102, 255, 0.55)" }} />
                <span className="w-4 h-3.5 rounded-[1px]" style={{ backgroundColor: "rgba(0, 102, 255, 0.75)" }} />
                <span className="w-4 h-3.5 rounded-[1px]" style={{ backgroundColor: "rgba(0, 102, 255, 0.95)" }} />
              </div>
              <span className="text-[9.5px] font-semibold text-neutral-raw-500">Máximo</span>
            </div>
          </div>

          <div className="text-[10px] text-neutral-raw-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Info size={11} className="text-brand-500 shrink-0" />
            <span>Zona de picos habituales: 10:00 - 13:00 y 15:00 - 17:00 en días laborales</span>
          </div>
        </div>
      </section>

    </div>
  );
};
