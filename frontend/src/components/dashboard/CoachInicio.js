import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authHeader } from '../../services/auth';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Sector } from 'recharts';

// CONSTANTES Y FUNCIONES AUXILIARES GLOBALES AL ARCHIVO (si las tienes fuera del componente)
const CHART_COLORS = {
  primary: 'var(--primary-color, #3f51b5)',
  success: 'var(--success-color, #66bb6a)',
  warning: 'var(--warning-color, #ffa726)',
  danger: 'var(--danger-color, #f44336)',
  info: 'var(--info-color, #29b6f6)',
  purple: '#6f42c1',
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

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`${label}`}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

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
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius} startAngle={startAngle} endAngle={endAngle} fill={fill} stroke="#fff" strokeWidth={2} />
      <Sector cx={cx} cy={cy} startAngle={startAngle} endAngle={endAngle} innerRadius={outerRadius + 4} outerRadius={outerRadius + 8} fill={fill} />
    </g>
  );
};

const groupPlayerPositions = (players) => {
  const positionGroups = { Porteros: 0, Defensas: 0, Mediocampistas: 0, Delanteros: 0 };
  players.forEach(player => {
    const pos = player.position;
    if (['POR'].includes(pos)) positionGroups.Porteros++;
    else if (['DEF', 'LTD', 'LTI'].includes(pos)) positionGroups.Defensas++;
    else if (['MCD', 'MC', 'MCO', 'ED', 'EI'].includes(pos)) positionGroups.Mediocampistas++;
    else if (['SD', 'DEL'].includes(pos)) positionGroups.Delanteros++;
  });
  return Object.entries(positionGroups).map(([name, value]) => ({ name, value })).filter(group => group.value > 0);
};


function CoachInicio({ setActivePage }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  // --- ESTADOS ---
  const [team, setTeam] = useState(null);
  const [playerCount, setPlayerCount] = useState(0);
  const [upcomingSessionsCount, setUpcomingSessionsCount] = useState(0);
  const [avgAttendance, setAvgAttendance] = useState(0);
  const [playerPositionDistributionData, setPlayerPositionDistributionData] = useState([]);
  const [sessionFrequencyData, setSessionFrequencyData] = useState([]);
  const [playerMinutesData, setPlayerMinutesData] = useState([]);
  const [loadingTeamInfo, setLoadingTeamInfo] = useState(true);
  const [loadingSessionsInfo, setLoadingSessionsInfo] = useState(true);
  const [loadingAttendanceInfo, setLoadingAttendanceInfo] = useState(true);
  const [loadingCharts, setLoadingCharts] = useState(true);
  const [activePieIndex, setActivePieIndex] = useState(0);
  const [error, setError] = useState('');
  const [tasksCountForStatCard, setTasksCountForStatCard] = useState(0);
  const [loadingTasksCountForStatCard, setLoadingTasksCountForStatCard] = useState(true);

  // --- FUNCIONES DE CARGA DE DATOS Y useEffect ---
  useEffect(() => {
    if (!user || !user.team) {
      setError('No tienes un equipo asignado. Contacta con un administrador.');
      setLoadingTeamInfo(false); setLoadingTasksCountForStatCard(false); setLoadingSessionsInfo(false);
      setLoadingAttendanceInfo(false); setLoadingCharts(false);
      return;
    }
    loadTeamData();
    loadTasksCountForStat();
    loadSessionsSummary();
    loadAttendanceSummary();
    loadChartData();
  }, [user?.team]); // Asegúrate que user.team esté en las dependencias si es necesario

  const onPieClick = (_, index) => { // Renombrado para mayor claridad, o puedes mantener onPieEnter
    setActivePieIndex(index);
  };

  const loadTeamData = async () => { /* ... tu implementación ... */ 
    setLoadingTeamInfo(true);
    try {
      const teamResponse = await fetch(`http://localhost:8000/api/teams/${user.team}/`, { headers: authHeader() });
      if (!teamResponse.ok) throw new Error('Error al cargar datos del equipo');
      const teamData = await teamResponse.json();
      setTeam(teamData);

      const playersResponse = await fetch(`http://localhost:8000/api/teams/${user.team}/players/`, { headers: authHeader() });
      if (playersResponse.ok) {
        const playersData = await playersResponse.json();
        setPlayerCount(Array.isArray(playersData) ? playersData.length : 0);
      }
    } catch (err) {
      setError(prev => `${prev} Equipo: ${err.message};`);
    } finally {
      setLoadingTeamInfo(false);
    }
  };
  const loadTasksCountForStat = async () => { /* ... tu implementación ... */ 
    setLoadingTasksCountForStatCard(true);
    try {
      const tasksResponse = await fetch('http://localhost:8000/api/tasks/', { headers: authHeader() });
      if (!tasksResponse.ok) throw new Error('Error al cargar tareas');
      const tasksData = await tasksResponse.json();
      setTasksCountForStatCard(tasksData.length);
    } catch (err) {
      setError(prev => `${prev} Conteo Tareas: ${err.message};`);
    } finally {
      setLoadingTasksCountForStatCard(false);
    }
  };
  const loadSessionsSummary = async () => { /* ... tu implementación ... */ 
    setLoadingSessionsInfo(true);
    try {
      const sessionsResponse = await fetch('http://localhost:8000/api/sessions/', { headers: authHeader() });
      if (!sessionsResponse.ok) throw new Error('Error al cargar sesiones');
      const sessionsData = await sessionsResponse.json();
      const upcoming = sessionsData.filter(s => new Date(s.date) >= new Date() && new Date(s.date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length;
      setUpcomingSessionsCount(upcoming);
      const frequency = sessionsData.reduce((acc, session) => {
        const month = new Date(session.date).toLocaleString('default', { month: 'short' });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {});
      setSessionFrequencyData(Object.entries(frequency).map(([name, value]) => ({ name, Sesiones: value })).slice(-6));
    } catch (err) {
      setError(prev => `${prev} Sesiones: ${err.message};`);
    } finally {
      setLoadingSessionsInfo(false);
    }
  };
  const loadAttendanceSummary = async () => { /* ... tu implementación ... */ 
    setLoadingAttendanceInfo(true);
    try {
      const response = await fetch(`http://localhost:8000/api/teams/${user.team}/attendance/summary/`, { headers: authHeader() });
      if(response.ok){
        const data = await response.json();
        setAvgAttendance(data.average_attendance_percentage || 0);
      } else { setAvgAttendance(0); }
    } catch (err) {
       setError(prev => `${prev} Asistencia: ${err.message};`);
       setAvgAttendance(0);
    } finally {
      setLoadingAttendanceInfo(false);
    }
  };
  const loadChartData = async () => { /* ... tu implementación ... */ 
    setLoadingCharts(true);
    setError(prev => prev.replace(/Gráficos: [^;]+;/g, ''));
    try {
      const playersResponse = await fetch(`http://localhost:8000/api/teams/${user.team}/players/`, { headers: authHeader() });
      if (playersResponse.ok) {
        const playersData = await playersResponse.json();
        if (Array.isArray(playersData)) setPlayerPositionDistributionData(groupPlayerPositions(playersData));
        else setPlayerPositionDistributionData([]);
      } else throw new Error('Error al cargar jugadores para el gráfico de distribución');

      const minutesResponse = await fetch(`http://localhost:8000/api/teams/${user.team}/minutes/?matches=false`, { headers: authHeader() });
      if (minutesResponse.ok) {
          const allMinutes = await minutesResponse.json();
          const playerMinutesSum = allMinutes.reduce((acc, record) => {
              const playerId = record.player_id || record.player;
              acc[playerId] = acc[playerId] || { name: `${record.player_name || 'Jugador'} ${record.player_last_name || ''}`.trim(), minutes: 0 };
              acc[playerId].minutes += record.minutes_played || 0;
              return acc;
          }, {});
          setPlayerMinutesData(Object.values(playerMinutesSum).sort((a, b) => b.minutes - a.minutes).slice(0, 5));
      } else throw new Error('Error al cargar minutos de jugadores');
    } catch (err) {
        setError(prev => `${prev} Gráficos: ${err.message};`);
    } finally {
      setLoadingCharts(false);
    }
  };
  const onPieEnter = (_, index) => { setActivePieIndex(index); };

  // ***** DEFINICIÓN DE FUNCIONES DE NAVEGACIÓN *****
  const navigateTo = (section) => {
    setActivePage(section);
  };

  const goToTeamManagement = () => {
    if (user && user.team) {
      navigate(`/team/${user.team}`);
    } else {
      console.error("Usuario o equipo del usuario no definido para goToTeamManagement.");
      setError(prev => `${prev} No se puede acceder a la gestión del equipo (usuario/equipo no definido);`);
    }
  };

  // --- COMPONENTES LOCALES DE UI (SI LOS TIENES AQUÍ) ---
  const StatCard = ({ icon, title, value, color, isLoading, onClick }) => (
    <div className={`stat-card coach-stat-card ${color}`} onClick={onClick}>
      <div className="stat-card-icon"><i className={`fas ${icon}`}></i></div>
      <div className="stat-card-info">
        <span className="stat-card-value">{isLoading ? <i className="fas fa-spinner fa-spin"></i> : value}</span>
        <span className="stat-card-title">{title}</span>
      </div>
    </div>
  );

  const QuickLinkCard = ({ icon, title, description, onClick, color }) => (
    <div className={`quick-link-card coach-quick-link ${color}`} onClick={onClick}>
      <div className="quick-link-icon"><i className={`fas ${icon}`}></i></div>
      <div className="quick-link-info"><h3>{title}</h3><p>{description}</p></div>
      <div className="quick-link-arrow"><i className="fas fa-chevron-right"></i></div>
    </div>
  );

  const ChartWrapper = ({ title, children, isLoading, hasData }) => (
    <div className="chart-container coach-chart-container">
      <h3>{title}</h3>
      {isLoading ? ( <div className="chart-loading"><i className="fas fa-spinner fa-spin"></i> Cargando datos...</div> )
       : hasData === false || (Array.isArray(hasData) && hasData.length === 0) ? ( <p className="no-data-chart">No hay datos disponibles.</p> )
       : ( <ResponsiveContainer width="100%" height={300}>{children}</ResponsiveContainer> )}
    </div>
  );
  
  // --- MANEJO DE ERROR INICIAL ---
  if (error && !team && !user?.team) { 
    return (
      <div className="content-wrapper coach-inicio-page">
        <div className="coach-welcome-header error-header">
          <h1>Error</h1>
          <p>{error.includes("equipo asignado") ? error : "Error al cargar datos. " + error.split(';')[0]}</p>
        </div>
      </div>
    );
  }

  // --- JSX DEL COMPONENTE ---
  return (
    <div className="content-wrapper coach-inicio-page">
      <div className="coach-welcome-header">
        <h1>Bienvenido, Entrenador {user?.first_name || user?.username}!</h1>
        <p>Aquí tienes un resumen de la actividad de tu equipo: {loadingTeamInfo && !team ? <i className="fas fa-spinner fa-spin"></i> : <strong>{team?.name || 'Tu Equipo'}</strong>}</p>
      </div>

      {error && <div className="error-message" style={{margin: '0 20px 20px 20px'}}>{error.split(';').map((e, i) => e.trim() && <div key={i}>{e.trim()}</div>)}</div>}

      <div className="stats-grid">
        <StatCard icon="fa-users" title="Jugadores" value={playerCount} isLoading={loadingTeamInfo} color="blue" onClick={() => navigateTo('myteam')} />
        <StatCard icon="fa-tasks" title="Tareas Creadas" value={tasksCountForStatCard} isLoading={loadingTasksCountForStatCard} color="green" onClick={() => navigateTo('tasks')} />
        <StatCard icon="fa-calendar-check" title="Próximas Sesiones" value={upcomingSessionsCount} isLoading={loadingSessionsInfo} color="orange" onClick={() => navigateTo('sessions')} />
        <StatCard icon="fa-user-check" title="Asistencia Media" value={`${avgAttendance}%`} isLoading={loadingAttendanceInfo} color="purple" onClick={() => navigateTo('attendance')} />
      </div>

      <div className="charts-section">
        <ChartWrapper 
          title="Distribución de Jugadores por Posición" 
          isLoading={loadingCharts} 
          hasData={playerPositionDistributionData.length > 0}
        >
          <PieChart>
            <Pie
              activeIndex={activePieIndex}
              activeShape={renderActiveShape}
              data={playerPositionDistributionData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              fill={CHART_COLORS.primary}
              dataKey="value"
              onClick={onPieClick} // CAMBIO: de onMouseEnter a onClick
              paddingAngle={2}
            >
              {playerPositionDistributionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ChartWrapper>

        <ChartWrapper title="Frecuencia de Sesiones (Últimos meses)" isLoading={loadingSessionsInfo} hasData={sessionFrequencyData.length > 0}>
          <BarChart data={sessionFrequencyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" /> <XAxis dataKey="name" tick={{ fill: CHART_COLORS.neutralLight }} /> <YAxis tick={{ fill: CHART_COLORS.neutralLight }} />
            <Tooltip content={<CustomTooltip />} /> <Legend wrapperStyle={{ color: CHART_COLORS.neutralDark }} />
            <Bar dataKey="Sesiones" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} barSize={30}/>
          </BarChart>
        </ChartWrapper>
        
        <ChartWrapper title="Top 5 Jugadores por Minutos" isLoading={loadingCharts} hasData={playerMinutesData.length > 0}>
            <BarChart layout="vertical" data={playerMinutesData} margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" /> <XAxis type="number" tick={{ fill: CHART_COLORS.neutralLight }} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fill: CHART_COLORS.neutralDark, fontSize: '0.8em' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="minutes" name="Minutos Jugados" fill={CHART_COLORS.warning} radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
        </ChartWrapper>
      </div>

      <div className="quick-links-section">
        <h2>Acciones Rápidas</h2>
        <div className="quick-links-grid">
          <QuickLinkCard icon="fa-user-plus" title="Gestionar Plantilla" description="Añade o edita jugadores de tu equipo." onClick={goToTeamManagement} color="blue-ql" />
          <QuickLinkCard icon="fa-clipboard-list" title="Crear Tarea" description="Define nuevos ejercicios para el equipo." onClick={() => navigateTo('tasks')} color="green-ql" />
          <QuickLinkCard icon="fa-calendar-plus" title="Planificar Sesión" description="Organiza el próximo entrenamiento." onClick={() => navigateTo('sessions')} color="orange-ql" />
          <QuickLinkCard icon="fa-running" title="Registrar Minutos" description="Controla el tiempo de juego de tus jugadores." onClick={() => navigateTo('minutes')} color="purple-ql" />
        </div>
      </div>
    </div>
  );
}

export default CoachInicio;