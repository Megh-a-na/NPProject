import { colors } from '@mui/material';
import React, { useState } from 'react';

function MyForm({onClick, disabled}) {

  return (
      
      <button type="button" 
        onClick={onClick}
        disabled={disabled}
        style={{
            backgroundColor: disabled ? "#aaaaaa" : "#015498", 
            marginTop:'7px', 
            padding: '8px 16px', 
            fontSize: '1rem', 
            width: '71vw',
            marginRight: '1vw',
            color: '#ffffff',
            cursor: disabled ? 'not-allowed' : 'pointer'
        }}>
        {disabled ? "Optimizing..." : "Optimize Tower Placement"}
      </button>
      
  );
}

export default MyForm;
