// src/App.jsx
import React, { useState } from "react";
import Home from "./components/pages/Home";
import Comparador from "./components/pages/Comparador";

const App = () => {
  const [tela, setTela] = useState("home");

  return (
    <div>
      <div className="flex gap-4 p-4">
        <button
          onClick={() => setTela("home")}
          className={`px-4 py-2 rounded ${
            tela === "home" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Home
        </button>
        <button
          onClick={() => setTela("comparador")}
          className={`px-4 py-2 rounded ${
            tela === "comparador" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Comparador
        </button>
      </div>

      {tela === "home" && <Home />}
      {tela === "comparador" && <Comparador />}
    </div>
  );
};

export default App;
