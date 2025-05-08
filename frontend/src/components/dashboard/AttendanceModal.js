import React from 'react';

function AttendanceModal({ player, attendanceRecords, onClose }) {
  // Cada registro tiene 3 entrenamientos (training1, training2, training3)
  const totalTrainingSessions = attendanceRecords.length * 3;
  const trainingPresent = attendanceRecords.reduce((acc, rec) => {
    return acc + (rec.training1 ? 1 : 0) + (rec.training2 ? 1 : 0) + (rec.training3 ? 1 : 0);
  }, 0);
  const trainingAbsent = totalTrainingSessions - trainingPresent;
  const trainingPercentage = totalTrainingSessions > 0 ? Math.round((trainingPresent / totalTrainingSessions) * 100) : 0;
  
  // Cada registro representa un partido
  const totalMatches = attendanceRecords.length;
  const matchPresent = attendanceRecords.reduce((acc, rec) => acc + (rec.match ? 1 : 0), 0);
  const matchAbsent = totalMatches - matchPresent;
  const matchPercentage = totalMatches > 0 ? Math.round((matchPresent / totalMatches) * 100) : 0;
  
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Asistencia de {player.name} {player.last_name}</h2>
        <div className="attendance-summary">
          <h3>Entrenamientos</h3>
          <p>Total sesiones: {totalTrainingSessions}</p>
          <p>Asistencias: {trainingPresent}</p>
          <p>Faltas: {trainingAbsent}</p>
          <p>Porcentaje: {trainingPercentage}%</p>
        </div>
        <div className="attendance-summary">
          <h3>Partidos</h3>
          <p>Total partidos: {totalMatches}</p>
          <p>Asistencias: {matchPresent}</p>
          <p>Faltas: {matchAbsent}</p>
          <p>Porcentaje: {matchPercentage}%</p>
        </div>
        <button onClick={onClose} className="btn btn-secondary">Cerrar</button>
      </div>
    </div>
  );
}

export default AttendanceModal;