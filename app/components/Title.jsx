import React from 'react';

const Title = ({children}) => {
  return (
    <div className='text-gray-600 text-3xl font-bold text-center'>
      {children}
    </div>
  );
};

export default Title;