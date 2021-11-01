import { useContext } from "react";

import { State, StateContext } from "../firebase/state";

const useFirebaseState = (): State => {
  const state = useContext(StateContext);
  return state;
};

export default useFirebaseState;
