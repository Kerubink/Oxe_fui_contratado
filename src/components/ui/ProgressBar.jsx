// components/UI/ProgressBar.jsx
export default function ProgressBar({ current, total }) {
    return (
      <div className="progress-container">
        <div 
          className="progress-bar" 
          style={{ width: `${(current / total) * 100}%` }}
        />
        <span className="progress-text">
          Pergunta {current} de {total}
        </span>
      </div>
    );
  }