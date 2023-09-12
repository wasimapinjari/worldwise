import {
  createContext,
  useEffect,
  useContext,
  useReducer,
  useCallback,
} from "react";
import { cities } from "../../data/cities";

// const BASE_URL = "http://localhost:9000";

const CitiesContext = createContext();

const initialState = {
  cities: cities,
  isLoading: false,
  currentCity: {},
  error: "",
}

function initialStateResolver(initialState) {
  return JSON.parse(localStorage.getItem("state")) || initialState;
}

function reducer(state, action) {
  switch (action.type) {
    case "loading":
      return { ...state, isLoading: true };

    case "cities/loaded":
      return {
        ...state,
        isLoading: false,
        cities: action.payload,
      };

    case "city/loaded":
      const city = state.cities.filter(city => city.id === action.payload)[0];
      return { ...state, isLoading: false, currentCity: city };

    case "city/created":
      return {
        ...state,
        isLoading: false,
        cities: [...state.cities, action.payload],
        currentCity: action.payload,
      };

    case "city/deleted":
      return {
        ...state,
        isLoading: false,
        cities: state.cities.filter((city) => city.id !== action.payload),
        currentCity: {},
      };

    case "rejected":
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    default:
      throw new Error("Unknown action type");
  }
}

function CitiesProvider({ children }) {
  const [{ cities, isLoading, currentCity, error }, dispatch] = useReducer(
    reducer,
    initialState, 
    initialStateResolver
  );

  useEffect(function () {
    localStorage.setItem("state", JSON.stringify({ cities, isLoading, currentCity, error }));
  }, [cities, isLoading, currentCity, error]);

  const getCity = useCallback(
    function getCity(id) {
      
      if (Number(id) === currentCity.id) return;
      dispatch({ type: "city/loaded", payload: id });
    },
    [currentCity.id]
  );
  

  function createCity(newCity) {
    dispatch({ type: "city/created", payload: newCity });
  }

 function deleteCity(id) {
    dispatch({ type: "city/deleted", payload: id });
  }

  return (
    <CitiesContext.Provider
      value={{
        cities,
        isLoading,
        currentCity,
        error,
        getCity,
        createCity,
        deleteCity,
      }}
    >
      {children}
    </CitiesContext.Provider>
  );
}

function useCities() {
  const context = useContext(CitiesContext);
  if (context === undefined)
    throw new Error("CitiesContext was used outside the CitiesProvider");
  return context;
}

export { CitiesProvider, useCities };
