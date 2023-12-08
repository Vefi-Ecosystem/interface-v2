import React, { createContext, useContext, useState } from 'react';

interface InputForm {
  msName: string;
  msDescription: string;
  msOwners: string;
  msThreshold: string;
}

interface MultiSigFormContextProps {
  inputForm: InputForm;
  setInputForm: React.Dispatch<React.SetStateAction<InputForm>>;
}

const MultiSigFormContext = createContext<MultiSigFormContextProps>({} as MultiSigFormContextProps);

export function MultiSigFormContextProvider({ children }: { children: React.ReactNode }) {
  const [inputForm, setInputForm] = useState<InputForm>({
    msName: '',
    msDescription: '',
    msOwners: '',
    msThreshold: ''
  });

  return <MultiSigFormContext.Provider value={{ inputForm, setInputForm }}>{children}</MultiSigFormContext.Provider>;
}

export function useMultiSigFormContext() {
  return useContext(MultiSigFormContext);
}
