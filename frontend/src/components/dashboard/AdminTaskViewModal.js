import React from 'react';

function AdminTaskViewModal({ task, onClose }) {
  if (!task) return null;

  return (
    <div className="admin-task-view-modal-overlay" onClick={onClose}>
      <div className="admin-task-view-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="admin-task-view-modal-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>

        <div className="admin-task-view-header">
          {task.image && (
            <div className="admin-task-view-image-container">
              <img src={task.image} alt={task.title} className="admin-task-view-image" />
            </div>
          )}
          <h2 className="admin-task-view-title">{task.title}</h2>
          {task.category && <div className="admin-task-view-category">{task.category}</div>}
        </div>

        <div className="admin-task-view-body">
          {task.description && (
            <div className="admin-task-view-section">
              <h3><i className="fas fa-align-left"></i> Descripción</h3>
              <p>{task.description}</p>
            </div>
          )}

          <div className="admin-task-view-details-grid">
            {task.participants && (
              <div className="admin-task-view-detail-item">
                <h4><i className="fas fa-users"></i> Participantes</h4>
                <p>{task.participants} jugadores</p>
              </div>
            )}
            {task.duration && (
              <div className="admin-task-view-detail-item">
                <h4><i className="fas fa-clock"></i> Duración</h4>
                <p>{task.duration} min</p>
              </div>
            )}
          </div>

          {task.material && (
            <div className="admin-task-view-section">
              <h3><i className="fas fa-tools"></i> Material Necesario</h3>
              <p>{task.material}</p>
            </div>
          )}
        </div>

        <div className="admin-task-view-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminTaskViewModal;