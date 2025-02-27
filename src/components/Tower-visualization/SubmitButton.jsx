import { colors } from '@mui/material';
import React, { useState } from 'react';

function MyForm({onClick}) {

  return (
      
      <button type="button" 
        onClick={onClick}
        style={{
            backgroundColor:"#015498", 
            marginTop:'7px', 
            padding: '8px 16px', 
            fontSize: '1rem', 
            width: '71vw',
            marginRight: '1vw'
        }}>
        Optimize Tower Placement
      </button>
      
  );
}

export default MyForm;
