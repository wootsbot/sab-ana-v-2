import React, { useState, useMemo } from "react";
import { DashboardData, businessUnits } from "../data";
import { 
  KeyRound, 
  Users, 
  ShieldCheck, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  Filter, 
  Plus, 
  Sparkles,
  ArrowUpDown,
  Lock,
  Unlock,
  Building
} from "lucide-react";

interface AccesosViewProps {
  data: DashboardData;
}

interface UserAccess {
  id: string;
  name: string;
  email: string;
  unit: string;
  role: "Súper Admin" | "Corporativo" | "Operador";
  status: "Activo" | "Inactivo" | "Pendiente";
  tools: string[];
}

export const AccesosView = ({ data }: AccesosViewProps) => {
  // Access data simulation
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUnitFilter, setSelectedUnitFilter] = useState("Todas");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("Todos");
  const [sortField, setSortField] = useState<"name" | "unit" | "role">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Initial access list
  const [usersList, setUsersList] = useState<UserAccess[]>([
    { id: "1", name: "Adrián de Ávila", email: "adeavila@corpcab.com.mx", unit: "TI", role: "Súper Admin", status: "Activo", tools: ["Exploración abierta", "análisis de datos", "Hada", "Agentes especializados"] },
    { id: "2", name: "Sofía Martínez", email: "smartinez@corpcab.com.mx", unit: "Transformación digital", role: "Corporativo", status: "Activo", tools: ["Exploración abierta", "análisis de datos", "Investigación", "Hada"] },
    { id: "3", name: "Alejandro Ruiz", email: "aruiz@corpcab.com.mx", unit: "Recursos Humanos", role: "Operador", status: "Activo", tools: ["Productividad y oficina", "Exploración abierta"] },
    { id: "4", name: "Mariana Gómez", email: "mgomez@corpcab.com.mx", unit: "Calidad", role: "Corporativo", status: "Activo", tools: ["biblioteca Pisa", "análisis de datos", "Investigación"] },
    { id: "5", name: "Carlos Mendoza", email: "cmendoza@corpcab.com.mx", unit: "Finanzas", role: "Corporativo", status: "Activo", tools: ["análisis de datos", "Productividad y oficina"] },
    { id: "6", name: "Lorena Flores", email: "lflores@corpcab.com.mx", unit: "Manufactura", role: "Operador", status: "Inactivo", tools: ["Agentes especializados", "Hada"] },
    { id: "7", name: "Ricardo Rocha", email: "rrocha@corpcab.com.mx", unit: "Comercial Electrolit", role: "Operador", status: "Activo", tools: ["Exploración abierta", "Imágenes y videos"] },
    { id: "8", name: "Beatriz Corona", email: "bcorona@corpcab.com.mx", unit: "Logística", role: "Operador", status: "Pendiente", tools: ["Productividad y oficina"] },
    { id: "9", name: "Héctor Salinas", email: "hsalinas@corpcab.com.mx", unit: "Comercial Farma", role: "Operador", status: "Activo", tools: ["biblioteca Pisa", "Exploración abierta"] },
    { id: "10", name: "Valeria Ochoa", email: "vochoa@corpcab.com.mx", unit: "TI", role: "Corporativo", status: "Activo", tools: ["Hada", "análisis de datos"] }
  ]);

  // Handle status toggle (Interactive feature)
  const toggleUserStatus = (userId: string) => {
    setUsersList(prev => prev.map(user => {
      if (user.id === userId) {
        const nextStatus = user.status === "Activo" ? "Inactivo" : "Activo";
        return { ...user, status: nextStatus };
      }
      return user;
    }));
  };

  // Unit Headcount and License Allocation Data for Visual Representation
  const licenseDistribution = useMemo(() => {
    return [
      { unit: "TI", total: 180, allocated: 154, active: 142 },
      { unit: "Transformación digital", total: 95, allocated: 88, active: 85 },
      { unit: "Manufactura", total: 420, allocated: 310, active: 245 },
      { unit: "Calidad", total: 110, allocated: 92, active: 80 },
      { unit: "Finanzas", total: 65, allocated: 58, active: 55 },
      { unit: "Recursos Humanos", total: 120, allocated: 105, active: 95 },
      { unit: "Comercial Electrolit", total: 310, allocated: 250, active: 210 },
      { unit: "Logística", total: 150, allocated: 120, active: 98 },
      { unit: "Comercial Farma", total: 140, allocated: 115, active: 102 }
    ];
  }, []);

  // Filter & Search Logic
  const filteredUsers = useMemo(() => {
    return usersList
      .filter(user => {
        const matchesSearch = 
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesUnit = selectedUnitFilter === "Todas" || user.unit === selectedUnitFilter;
        const matchesStatus = selectedStatusFilter === "Todos" || user.status === selectedStatusFilter;

        return matchesSearch && matchesUnit && matchesStatus;
      })
      .sort((a, b) => {
        let fieldA = a[sortField].toString().toLowerCase();
        let fieldB = b[sortField].toString().toLowerCase();
        
        if (fieldA < fieldB) return sortOrder === "asc" ? -1 : 1;
        if (fieldA > fieldB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [usersList, searchTerm, selectedUnitFilter, selectedStatusFilter, sortField, sortOrder]);

  const toggleSort = (field: "name" | "unit" | "role") => {
    if (sortField === field) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // KPIs
  const totalLicencias = 1500;
  const asignadas = useMemo(() => usersList.filter(u => u.status === "Activo").length * 124, [usersList]); // scaled for realism
  const disponibles = totalLicencias - asignadas;
  const tasaUso = Math.round((asignadas / totalLicencias) * 100);

  return (
    <div className="flex flex-col gap-p-md rounded-sm fade-up">
      {/* Header Info Banner */}
      <div className="bg-brand-900 text-white rounded-lg p-5 border border-brand-800 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        {/* Abstract vector patterns background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-48 h-48 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3 bg-white/10 rounded-lg border border-white/10">
            <KeyRound className="h-6 w-6 text-sky-100" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight">Administración de Accesos SabIA</h2>
            <p className="text-[11px] text-brand-100 mt-1 max-w-xl">
              Configura, asigna y revoca las credenciales del ecosistema de Inteligencia Artificial para colaboradores de Pisa Corporativo y unidades aliadas.
            </p>
          </div>
        </div>

        <button 
          onClick={() => alert("Función para solicitar nuevas licencias por flujo de aprobación corporativa.")}
          className="bg-white hover:bg-brand-50 text-brand-900 font-bold text-xs py-2 px-4 rounded-lg flex items-center gap-2 cursor-pointer transition-all shrink-0 z-10 border border-brand-100 shadow-sm"
        >
          <Plus size={14} />
          Asignar Licencia
        </button>
      </div>

      {/* Access KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-p-md">
        {/* KPI 1 */}
        <div className="bg-white border border-neutral-raw-600/20 p-4 rounded-lg shadow-card flex items-center gap-3">
          <div className="p-2.5 bg-neutral-raw-50 text-neutral-raw-600 rounded-sm">
            <Users size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-neutral-raw-500 uppercase tracking-wider">Total Licencias</span>
            <span className="text-xl font-bold text-neutral-raw-900">{totalLicencias}</span>
            <span className="text-[9.5px] text-neutral-raw-400 font-medium">Límite corporativo anual</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-neutral-raw-600/20 p-4 rounded-lg shadow-card flex items-center gap-3">
          <div className="p-2.5 bg-brand-50 text-brand-600 rounded-sm">
            <CheckCircle size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-neutral-raw-500 uppercase tracking-wider">Asignadas</span>
            <span className="text-xl font-bold text-brand-700">{asignadas}</span>
            <span className="text-[9.5px] text-neutral-raw-400 font-medium">Asignación directa</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-neutral-raw-600/20 p-4 rounded-lg shadow-card flex items-center gap-3">
          <div className="p-2.5 bg-success-50 text-success-700 rounded-sm">
            <Sparkles size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-neutral-raw-500 uppercase tracking-wider">Disponibles</span>
            <span className="text-xl font-bold text-success-750">{disponibles}</span>
            <span className="text-[9.5px] text-neutral-raw-400 font-medium">Listas para asignar</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white border border-neutral-raw-600/20 p-4 rounded-lg shadow-card flex items-center gap-3">
          <div className="p-2.5 bg-sky-50 text-sky-600 rounded-sm">
            <ShieldCheck size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-neutral-raw-500 uppercase tracking-wider">Tasa de Adopción</span>
            <span className="text-xl font-bold text-sky-750">{tasaUso}%</span>
            <span className="text-[9.5px] text-neutral-raw-400 font-medium">Porcentaje asignado</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Visual Distribution & User Admin List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-p-md items-stretch">
        
        {/* Column Chart & Permissions breakdown */}
        <div className="lg:col-span-4 flex flex-col gap-p-md">
          {/* Visual chart representing License utilization */}
          <div className="bg-white border border-neutral-raw-600/20 p-5 rounded-lg shadow-card flex flex-col justify-between flex-grow">
            <div className="border-b border-neutral-raw-100 pb-3 mb-4">
              <h3 className="text-xs font-bold text-neutral-raw-800 flex items-center gap-2">
                <Building size={14} className="text-brand-500" />
                Asignación por Unidad
              </h3>
              <p className="text-[10px] text-neutral-raw-400 mt-0.5">Licencias asignadas vs. Total de colaboradores</p>
            </div>

            {/* Custom Interactive License allocation bars (The Chart Placeholder specified as functional) */}
            <div className="flex flex-col gap-3.5 my-2">
              {licenseDistribution.slice(0, 5).map(item => {
                const percentageAllocated = Math.round((item.allocated / item.total) * 100);
                const percentageActive = Math.round((item.active / item.allocated) * 100);
                
                return (
                  <div key={item.unit} className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-semibold text-neutral-raw-700">{item.unit}</span>
                      <span className="text-neutral-raw-500 font-medium">
                        {item.allocated} / {item.total} <span className="font-bold text-brand-600">({percentageAllocated}%)</span>
                      </span>
                    </div>
                    {/* Visual stack progress bar */}
                    <div className="w-full h-3 bg-neutral-raw-100 rounded-full overflow-hidden relative" title={`Total: ${item.total}, Asignadas: ${item.allocated}, Activas: ${item.active}`}>
                      {/* Allocated */}
                      <div 
                        className="h-full bg-brand-500/80 rounded-full transition-all duration-500"
                        style={{ width: `${percentageAllocated}%` }}
                      />
                      {/* Active Sub-Bar */}
                      <div 
                        className="absolute top-0 left-0 h-full bg-brand-600 rounded-full transition-all duration-500"
                        style={{ width: `${percentageAllocated * (percentageActive / 100)}%` }}
                      />
                    </div>
                    {/* Active percentage caption */}
                    <div className="flex justify-end text-[8.5px] text-neutral-raw-400 font-mono">
                      <span>{percentageActive}% de asignadas activas</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Small Legend */}
            <div className="mt-4 pt-3 border-t border-neutral-raw-100 flex justify-between items-center text-[9px] text-neutral-raw-500 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-brand-600" />
                <span>Accesos Activos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-brand-200" />
                <span>Solo Asignadas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-neutral-raw-100" />
                <span>Sin Licencia</span>
              </div>
            </div>
          </div>

          {/* Quick Stats / Info card */}
          <div className="bg-amber-50/50 border border-amber-200/60 p-4 rounded-lg flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <h4 className="text-xs font-bold text-amber-800">Uso de API restringido</h4>
              <p className="text-[10px] text-amber-700/90 leading-relaxed mt-1">
                La asignación excesiva de permisos de tipo "Súper Admin" puede incrementar costos por uso de tokens. Revisa regularmente las actividades de usuarios con alta concurrencia.
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Access Management Table List */}
        <div className="lg:col-span-8 bg-white border border-neutral-raw-600/20 p-5 rounded-lg shadow-card flex flex-col justify-between">
          <div className="flex flex-col gap-4 border-b border-neutral-raw-100 pb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold text-neutral-raw-800 flex items-center gap-2">
                  <Users size={14} className="text-brand-500" />
                  Listado de Accesos y Credenciales
                </h3>
                <p className="text-[10px] text-neutral-raw-400 mt-0.5">Visualiza y controla el estatus de todos los usuarios habilitados.</p>
              </div>

              {/* Advanced search and filters */}
              <div className="flex items-center gap-2">
                <div className="relative w-full max-w-[180px]">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-raw-400" />
                  <input 
                    type="text" 
                    placeholder="Buscar por nombre/email" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full text-[10.5px] pl-8 pr-2.5 py-1.5 rounded-lg border border-neutral-raw-600/20 focus:border-brand-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Quick Filter Bar */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-neutral-raw-600 font-medium font-sans">
              <div className="flex items-center gap-1.5 shrink-0">
                <Filter size={12} className="text-neutral-raw-400" />
                <span>Filtros Rápidos:</span>
              </div>

              {/* Unit selector */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-neutral-raw-400">Unidad:</span>
                <select 
                  value={selectedUnitFilter}
                  onChange={(e) => setSelectedUnitFilter(e.target.value)}
                  className="bg-neutral-raw-50 border border-neutral-raw-600/20 rounded px-1.5 py-0.5 text-[10.5px] text-neutral-raw-700 font-semibold focus:outline-hidden"
                >
                  <option value="Todas">Todas</option>
                  {businessUnits.filter(u => u !== "Todas").map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>

              {/* Status Selector */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-neutral-raw-400">Estado:</span>
                <select 
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="bg-neutral-raw-50 border border-neutral-raw-600/20 rounded px-1.5 py-0.5 text-[10.5px] text-neutral-raw-700 font-semibold focus:outline-hidden"
                >
                  <option value="Todos">Todos</option>
                  <option value="Activo">Activos</option>
                  <option value="Inactivo">Inactivos</option>
                  <option value="Pendiente">Pendientes</option>
                </select>
              </div>
            </div>
          </div>

          {/* Collaborators Table */}
          <div className="overflow-x-auto my-3 -mx-5 md:mx-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-raw-200/60 text-[9.5px] text-neutral-raw-500 font-bold uppercase tracking-wider bg-neutral-raw-50/50">
                  <th 
                    onClick={() => toggleSort("name")}
                    className="p-3 cursor-pointer hover:bg-neutral-raw-50 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Nombre / Correo</span>
                      <ArrowUpDown size={10} />
                    </div>
                  </th>
                  <th 
                    onClick={() => toggleSort("unit")}
                    className="p-3 cursor-pointer hover:bg-neutral-raw-50 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Unidad</span>
                      <ArrowUpDown size={10} />
                    </div>
                  </th>
                  <th 
                    onClick={() => toggleSort("role")}
                    className="p-3 cursor-pointer hover:bg-neutral-raw-50 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Permiso</span>
                      <ArrowUpDown size={10} />
                    </div>
                  </th>
                  <th className="p-3">Aplicaciones Habilitadas</th>
                  <th className="p-3 text-right">Estatus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-raw-100">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-neutral-raw-50/40 transition-colors text-[11px] font-sans">
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-neutral-raw-800 leading-normal">{user.name}</span>
                          <span className="text-[9.5px] text-neutral-raw-400 font-mono mt-0.5">{user.email}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-neutral-raw-600 bg-neutral-raw-100 px-1.5 py-0.5 rounded text-[9.5px]">
                          {user.unit}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`font-bold px-2 py-0.5 rounded-full text-[9px] ${
                          user.role === "Súper Admin" 
                            ? "bg-rose-50 text-rose-700 border border-rose-200/40" 
                            : user.role === "Corporativo" 
                              ? "bg-brand-50 text-brand-700 border border-brand-200/40" 
                              : "bg-slate-100 text-slate-700"
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {user.tools.map((tool, idx) => (
                            <span key={idx} className="bg-sky-50 text-sky-700 text-[8.5px] px-1.5 py-0.5 rounded font-medium">
                              {tool}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {/* Toggle Switch */}
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold text-[10px] ${
                              user.status === "Activo" 
                                ? "text-success-700" 
                                : user.status === "Inactivo" 
                                  ? "text-neutral-raw-400" 
                                  : "text-amber-700 animate-pulse"
                            }`}>
                              {user.status}
                            </span>
                            
                            <button
                              onClick={() => toggleUserStatus(user.id)}
                              disabled={user.status === "Pendiente"}
                              className={`w-8 h-4 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                                user.status === "Activo" ? "bg-brand-500" : "bg-neutral-raw-300"
                              }`}
                              title={user.status === "Activo" ? "Revocar Acceso" : "Conceder Acceso"}
                            >
                              <div className={`w-3 h-3 rounded-full bg-white transition-transform transform shadow-sm ${
                                user.status === "Activo" ? "translate-x-4" : "translate-x-0"
                              }`} />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-xs text-neutral-raw-400 font-bold uppercase tracking-wider">
                      No se encontraron colaboradores con los criterios seleccionados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer summary info */}
          <div className="flex justify-between items-center text-[10.5px] text-neutral-raw-400 pt-3 border-t border-neutral-raw-100">
            <span>Mostrando {filteredUsers.length} de {usersList.length} colaboradores</span>
            <div className="flex gap-1.5 font-semibold text-brand-600">
              <span className="cursor-pointer hover:underline">Exportar CSV</span>
              <span>•</span>
              <span className="cursor-pointer hover:underline">Historial de Cambios</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
