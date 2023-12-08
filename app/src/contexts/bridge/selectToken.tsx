
"use client"
import { createContext, useState } from 'react';

const FormToggleContext = createContext({});

export const FormToggleProvider = ({ children }: any) => {
  const [model, setModel] = useState('');

  const switchScreen = (elem: any) => {
    setModel(elem);
  };

  return <FormToggleContext.Provider value={{ model, switchScreen }}>{children}</FormToggleContext.Provider>;
};

export default FormToggleContext;
