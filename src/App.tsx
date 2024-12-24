import React, { useState, useEffect } from "react";
import "./App.css";

interface Country {
  code: string;
  name: string;
  flagUrl: string;
}

const App: React.FC = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [currentCountry, setCurrentCountry] = useState<Country | null>(null);
  const [inputMode, setInputMode] = useState(true);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [options, setOptions] = useState<string[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [finalScore, setFinalScore] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null); // Mensaje de retroalimentación

  // Fetch countries data
  useEffect(() => {
    const fetchCountries = async () => {
      const response = await fetch("https://flagcdn.com/es/codes.json");
      const countryCodes = await response.json();
      const countryList = Object.entries(countryCodes).map(([code, name]) => ({
        code,
        name: name as string,
        flagUrl: `https://flagcdn.com/w640/${code}.webp`,
      }));
      setCountries(countryList);
      setCurrentCountry(countryList[Math.floor(Math.random() * countryList.length)]);
    };

    fetchCountries();
    setIsCorrect(null);
  }, []);

  const getRandomCountry = () => {
    return countries[Math.floor(Math.random() * countries.length)];
  };
  const normalizeText = (text: string): string => {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };
  const validateInput = () => {
    if (
      currentCountry &&
      normalizeText(userInput.toLowerCase()) === normalizeText(currentCountry.name.toLowerCase())
    ) {
      setScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
      setIsCorrect(true);
      setFeedback("¡Correcto!");
      setFinalScore((prev) => prev + 2);
    } else {
      setScore((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
      setIsCorrect(false);
      setFeedback(`¡Incorrecto! Era: ${currentCountry?.name}`);
    }
    nextQuestion();
  };

  const nextQuestion = () => {
    setTimeout(() => {
      setCurrentCountry(getRandomCountry());
      setUserInput("");
      setFeedback(null);
      setInputMode(true);
    }, 1500); // Espera 1.5 segundos antes de pasar a la siguiente bandera
  };

  const generateOptions = () => {
    if (!currentCountry) return;

    const correctOption = currentCountry.name;
    const shuffledOptions = [...countries]
      .sort(() => Math.random() - 0.5)
      .filter((country) => country.name !== correctOption)
      .slice(0, 3)
      .map((country) => country.name);

    setOptions([...shuffledOptions, correctOption].sort(() => Math.random() - 0.5));
    setInputMode(false);
  };

  const handleOptionClick = (option: string) => {
    if (
      currentCountry &&
      normalizeText(option.toLowerCase()) === normalizeText(currentCountry.name.toLowerCase())
    ) {
      setScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
      setIsCorrect(true);
      setFeedback("¡Correcto!");
      setFinalScore((prev) => prev + 1);
    } else {
      setScore((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
      setIsCorrect(false);
      setFeedback(`¡Incorrecto! Era: ${currentCountry?.name}`);
    }
    nextQuestion();
  };

  if (!currentCountry) {
    return <div>Cargando datos...</div>;
  }

  return (
    <div className="App">
      <h1>Juego de Banderas</h1>
      <div className="flag-card">
        <img src={currentCountry.flagUrl} style={{ width: "300px" }} alt={`Bandera de ${currentCountry.name}`} />
      </div>

      {feedback && <p className={isCorrect ? "correct" : "incorrect"}>{feedback}</p>}

      {inputMode ? (
        <div className="input-mode">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Escribe el nombre del país"
          />
          <button onClick={validateInput}>Validar</button>
        </div>
      ) : (
        <div className="options-mode">
          {options.map((option) => (
            <button key={option} onClick={() => handleOptionClick(option)}>
              {option}
            </button>
          ))}
        </div>
      )}
      <button onClick={generateOptions} style={{ marginTop: "20px" }}>
        Pedir opciones
      </button>
      <div className="scoreboard">
        <p>Aciertos: {score.correct}</p>
        <p>Errores: {score.incorrect}</p>
        <p>SCORE: {finalScore}</p>
      </div>
    </div>
  );
};

export default App;
