import React, { useState } from 'react';

function MyFormClear({onClick}) {

  return (
      
    <button type="button" 
    onClick={onClick}
    style={{
        backgroundColor:'#ff0000', 
        marginTop:'7px', 
        padding: '8px 16px', 
        fontSize: '1rem', 
        width: '15vw' 
    }}>
    Clear Towers
  </button>
      
  );
}

export default MyFormClear;