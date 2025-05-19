import React, { useState, useEffect } from 'react';
import { authHeader } from '../../services/auth';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, Sector, ComposedChart, Area
} from 'recharts';

// Paleta de colores profesional y consistente
// Estos colores pueden ser extraídos de tus variables CSS si es posible,
// o definidos aquí para mantener la consistencia.
const CHART_COLORS = {
  primary: 'var(--primary-color, #007bff)', // Azul principal
  success: 'var(--success-color, #28a745)', // Verde
  warning: 'var(--warning-color, #ffc107)', // Amarillo/Naranja
  danger: 'var(--danger-color, #dc3545)',   // Rojo
  info: 'var(--info-color, #17a2b8)',       // Teal/Cyan
  purple: '#6f42c1',                        // Morado personalizado
  accent1: '#fd7e14',                       // Naranja acento
  accent2: '#20c997',                       // Teal acento
  neutralLight: 'rgba(0,0,0,0.5)',
  neutralDark: 'rgba(0,0,0,0.8)',
};

const PIE_CHART_COLORS = [
  CHART_COLORS.primary, 
  CHART_COLORS.success, 
  CHART_COLORS.warning, 
  CHART_COLORS.info, 
  CHART_COLORS.purple
];

// Componente para etiquetas personalizadas en el gráfico de tarta (mejorado)
const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 8) * cos;
  const sy = cy + (outerRadius + 8) * sin;
  const mx = cx + (outerRadius + 25) * cos;
  const my = cy + (outerRadius + 25) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 20;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={4} textAnchor="middle" fill={CHART_COLORS.neutralDark} fontWeight="bold">
        {payload.name}
      </text>
      <text x={cx} y={cy} dy={22} textAnchor="middle" fill={CHART_COLORS.neutralLight} fontSize="0.9em">
        {`${value} (${(percent * 100).toFixed(0)}%)`}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="#fff"
        strokeWidth={2}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 4}
        outerRadius={outerRadius + 8}
        fill={fill}
      />
      {/* Línea y texto de detalle externo (opcional, puede ser mucho para algunos diseños)
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${value}`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
        {`(${(percent * 100).toFixed(0)}%)`}
      </text>
      */}
    </g>
  );
};

// Tooltip personalizado
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`${label}`}</p>
        {payload.map((pld, index) => (
          <p key={index} style={{ color: pld.color }}>
            {`${pld.name}: ${pld.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};


function AdminDashboardHome({ setActivePage }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    teams: 0,
    coaches: 0,
    players: 0,
    users: 0,
    tasks: 0,
    sessions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [userRoleData, setUserRoleData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [topTeamsData, setTopTeamsData] = useState([]);
  const [newUserGrowthData, setNewUserGrowthData] = useState([]); // Nuevo estado
  const [activePieIndex, setActivePieIndex] = useState(0);


  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError('');
        const headers = authHeader();

        const [
          teamsRes,
          usersRes,
          tasksRes,
          sessionsRes
        ] = await Promise.all([
          fetch('http://localhost:8000/api/teams/', { headers }),
          fetch('http://localhost:8000/api/users/', { headers }),
          fetch('http://localhost:8000/api/tasks/all', { headers }),
          fetch('http://localhost:8000/api/sessions/admin/', { headers })
        ]);

        if (!teamsRes.ok) throw new Error(`Equipos: ${teamsRes.statusText}`);
        const teamsData = await teamsRes.json();

        if (!usersRes.ok) throw new Error(`Usuarios: ${usersRes.statusText}`);
        const usersData = await usersRes.json();
        
        if (!tasksRes.ok) throw new Error(`Tareas: ${tasksRes.statusText}`);
        const tasksData = await tasksRes.json();

        if (!sessionsRes.ok) throw new Error(`Sesiones: ${sessionsRes.statusText}`);
        const sessionsData = await sessionsRes.json();

        // Procesar datos para estadísticas generales
        const coachesCount = usersData.filter(user => user.role === 'coach').length;
        const totalUsersCount = usersData.length;
        let totalPlayersCount = 0;
        if (Array.isArray(teamsData)) {
          for (const team of teamsData) {
            if (team.id || team._id) {
              const playersRes = await fetch(`http://localhost:8000/api/teams/${team.id || team._id}/players/`, { headers });
              if (playersRes.ok) {
                const playersData = await playersRes.json();
                totalPlayersCount += Array.isArray(playersData) ? playersData.length : 0;
              }
            }
          }
        }
        setStats({
          teams: Array.isArray(teamsData) ? teamsData.length : 0,
          coaches: coachesCount,
          players: totalPlayersCount,
          users: totalUsersCount,
          tasks: Array.isArray(tasksData) ? tasksData.length : 0,
          sessions: Array.isArray(sessionsData) ? sessionsData.length : 0,
        });

        // Procesar datos para gráfico de roles de usuario
        const rolesCount = usersData.reduce((acc, user) => {
          const roleName = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Desconocido';
          acc[roleName] = (acc[roleName] || 0) + 1;
          return acc;
        }, {});
        setUserRoleData(
          Object.entries(rolesCount).map(([name, value]) => ({ name, value }))
        );

        // Procesar datos para gráfico de actividad (Sesiones y Tareas por mes)
        const now = new Date();
        const activity = Array(6).fill(null).map((_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
          return { 
            month: d.toLocaleString('es-ES', { month: 'short' }).toUpperCase(), 
            year: d.getFullYear(),
            fullDate: d,
            Sesiones: 0, 
            Tareas: 0 
          };
        });
        sessionsData.forEach(session => {
          const sessionDate = new Date(session.date || session.created_at);
          const monthIndex = activity.findIndex(a => a.fullDate.getFullYear() === sessionDate.getFullYear() && a.fullDate.getMonth() === sessionDate.getMonth());
          if (monthIndex !== -1) activity[monthIndex].Sesiones++;
        });
        tasksData.forEach(task => {
          const taskDate = new Date(task.created_at);
          const monthIndex = activity.findIndex(a => a.fullDate.getFullYear() === taskDate.getFullYear() && a.fullDate.getMonth() === taskDate.getMonth());
          if (monthIndex !== -1) activity[monthIndex].Tareas++;
        });
        setActivityData(activity.map(a => ({name: `${a.month}`, Sesiones: a.Sesiones, Tareas: a.Tareas })));

        // Procesar datos para gráfico de equipos con más jugadores
        const teamsWithPlayerCount = await Promise.all(
          teamsData.map(async (team) => {
            const playersRes = await fetch(`http://localhost:8000/api/teams/${team.id || team._id}/players/`, { headers });
            if (playersRes.ok) {
              const playersData = await playersRes.json();
              return { name: team.name, Jugadores: Array.isArray(playersData) ? playersData.length : 0 };
            }
            return { name: team.name, Jugadores: 0 };
          })
        );
        setTopTeamsData(
          teamsWithPlayerCount.sort((a, b) => b.Jugadores - a.Jugadores).slice(0, 5)
        );

        // Procesar datos para gráfico de crecimiento de usuarios
        const userGrowth = Array(6).fill(null).map((_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
          return { 
            month: d.toLocaleString('es-ES', { month: 'short' }).toUpperCase(), 
            year: d.getFullYear(),
            fullDate: d,
            NuevosUsuarios: 0
          };
        });
        usersData.forEach(user => {
          if (user.date_joined) { // Asegúrate que este campo exista y sea una fecha válida
            const joinDate = new Date(user.date_joined);
            const monthIndex = userGrowth.findIndex(a => a.fullDate.getFullYear() === joinDate.getFullYear() && a.fullDate.getMonth() === joinDate.getMonth());
            if (monthIndex !== -1) userGrowth[monthIndex].NuevosUsuarios++;
          }
        });
        setNewUserGrowthData(userGrowth.map(a => ({ name: `${a.month}`, NuevosUsuarios: a.NuevosUsuarios })));


      } catch (err) {
        console.error("Error fetching admin stats:", err);
        setError(`No se pudieron cargar las estadísticas: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const onPieEnter = (_, index) => {
    setActivePieIndex(index);
  };

  const StatCard = ({ icon, title, value, color, onClick }) => (
    <div className={`stat-card admin-stat-card ${color}`} onClick={onClick}>
      <div className="stat-card-icon">
        <i className={`fas ${icon}`}></i>
      </div>
      <div className="stat-card-info">
        <span className="stat-card-value">{loading && value === 0 ? <i className="fas fa-spinner fa-spin"></i> : value}</span>
        <span className="stat-card-title">{title}</span>
      </div>
    </div>
  );

  const QuickLinkCard = ({ icon, title, description, onClick, color }) => (
    <div className={`quick-link-card ${color}`} onClick={onClick}>
      <div className="quick-link-icon">
        <i className={`fas ${icon}`}></i>
      </div>
      <div className="quick-link-info">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <div className="quick-link-arrow">
        <i className="fas fa-chevron-right"></i>
      </div>
    </div>
  );

  const ChartWrapper = ({ title, children, isLoading, hasData }) => (
    <div className="chart-container">
      <h3>{title}</h3>
      {isLoading ? (
        <div className="chart-loading"><i className="fas fa-spinner fa-spin"></i> Cargando datos...</div>
      ) : hasData ? (
        <ResponsiveContainer width="100%" height={300}>
          {children}
        </ResponsiveContainer>
      ) : (
        <p className="no-data-chart">No hay datos disponibles para mostrar.</p>
      )}
    </div>
  );


  if (error) {
    return <div className="content-wrapper error-message">{error}</div>;
  }

  return (
    <div className="content-wrapper admin-dashboard-home">
      <div className="admin-welcome-header">
        <h1>Panel de Control del Administrador</h1>
        <p>Visión general del sistema y rendimiento de la plataforma.</p>
      </div>

      <div className="stats-grid">
        <StatCard icon="fa-shield-alt" title="Equipos Totales" value={stats.teams} color="blue" onClick={() => setActivePage('teams')} />
        <StatCard icon="fa-user-tie" title="Entrenadores" value={stats.coaches} color="green" onClick={() => setActivePage('users')} />
        <StatCard icon="fa-users" title="Jugadores Totales" value={stats.players} color="orange" onClick={() => setActivePage('teams')} />
        <StatCard icon="fa-globe-europe" title="Usuarios del Sistema" value={stats.users} color="purple" onClick={() => setActivePage('users')} />
        <StatCard icon="fa-tasks" title="Tareas Globales" value={stats.tasks} color="teal" onClick={() => setActivePage('admin-tasks')} />
        <StatCard icon="fa-calendar-alt" title="Sesiones Globales" value={stats.sessions} color="red" onClick={() => setActivePage('admin-sessions')} />
      </div>

      <div className="charts-section">
        <ChartWrapper title="Distribución de Roles de Usuario" isLoading={loading} hasData={userRoleData.length > 0}>
          <PieChart>
            <Pie
              activeIndex={activePieIndex}
              activeShape={renderActiveShape}
              data={userRoleData}
              cx="50%"
              cy="50%"
              innerRadius={70} // Más grande para un look "donut"
              outerRadius={100}
              fill={CHART_COLORS.primary}
              dataKey="value"
              onMouseEnter={onPieEnter}
              paddingAngle={2} // Espacio entre secciones
            >
              {userRoleData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ChartWrapper>

        <ChartWrapper title="Actividad del Sistema (Últimos 6 Meses)" isLoading={loading} hasData={activityData.length > 0}>
          <ComposedChart data={activityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
            <XAxis dataKey="name" tick={{ fill: CHART_COLORS.neutralLight }} />
            <YAxis tick={{ fill: CHART_COLORS.neutralLight }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: CHART_COLORS.neutralDark }} />
            <Bar dataKey="Sesiones" barSize={20} fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
          </ComposedChart>
        </ChartWrapper>


        <ChartWrapper title="Top 5 Equipos por Nº de Jugadores" isLoading={loading} hasData={topTeamsData.length > 0}>
          <BarChart layout="vertical" data={topTeamsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
            <XAxis type="number" tick={{ fill: CHART_COLORS.neutralLight }} />
            <YAxis dataKey="name" type="category" width={120} tick={{ fill: CHART_COLORS.neutralDark, fontSize: '0.9em' }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="Jugadores" fill={CHART_COLORS.warning} radius={[0, 4, 4, 0]} barSize={25} />
          </BarChart>
        </ChartWrapper>
      </div>


      <div className="quick-links-section">
        <h2>Accesos Rápidos y Gestión</h2>
        <div className="quick-links-grid">
          <QuickLinkCard 
            icon="fa-cogs" 
            title="Gestionar Equipos" 
            description="Crea, edita y supervisa todos los equipos."
            onClick={() => setActivePage('teams')}
            color="blue-ql"
          />
          <QuickLinkCard 
            icon="fa-user-cog" 
            title="Gestionar Usuarios" 
            description="Administra roles, permisos y accesos."
            onClick={() => setActivePage('users')}
            color="green-ql"
          />
          <QuickLinkCard 
            icon="fa-clipboard-list" 
            title="Supervisar Tareas" 
            description="Revisa y gestiona las tareas globales."
            onClick={() => setActivePage('admin-tasks')}
            color="teal-ql"
          />
          <QuickLinkCard 
            icon="fa-calendar-check" 
            title="Supervisar Sesiones" 
            description="Consulta y gestiona todas las sesiones."
            onClick={() => setActivePage('admin-sessions')}
            color="red-ql"
          />
           <QuickLinkCard
            icon="fa-stopwatch-20" // Icono actualizado
            title="Control de Minutos"
            description="Analiza el tiempo de juego de los jugadores."
            onClick={() => setActivePage('admin-minutes')}
            color="orange-ql"
          />
          <QuickLinkCard
            icon="fa-user-check"
            title="Control de Asistencia"
            description="Revisa la asistencia general a eventos."
            onClick={() => setActivePage('admin-attendance')}
            color="purple-ql"
          />
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardHome;