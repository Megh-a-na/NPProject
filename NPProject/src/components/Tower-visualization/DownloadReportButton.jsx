import React from 'react';

function DownloadReportButton({ onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        backgroundColor: disabled ? "#aaaaaa" : "#4CAF50",
        marginTop: '7px',
        padding: '8px 16px',
        fontSize: '1rem',
        width: '15vw',
        color: '#ffffff',
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: 'none',
        borderRadius: '4px'
      }}
    >
      {disabled ? "Generating..." : "Download Report"}
    </button>
  );
}

export default DownloadReportButton; 