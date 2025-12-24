import React, { createContext, useContext } from 'react';

const ServerDataContext = createContext(null);

export const ServerDataProvider = ({ children, data }) => {
  return (
    <ServerDataContext.Provider value={data}>
      {children}
    </ServerDataContext.Provider>
  );
};

export const useServerData = () => {
  const context = useContext(ServerDataContext);
  return context;
};






