import React, { useState, useEffect } from "react";
import "./App.css";

interface Country {
  code: string;
  name: string;
  flagUrl: string;
}

const App: React.FC = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [randomizedCountries, setRandomizedCountries] = useState<Country[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputMode, setInputMode] = useState(true);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [options, setOptions] = useState<string[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [finalScore, setFinalScore] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [numCountries, setNumCountries] = useState<number | null>(null); // Número de países seleccionados
  const [gameStarted, setGameStarted] = useState(false); 
  const [maxScore, setMaxScore] = useState<number>(0);

  useEffect(() => {
    const storedMaxScore = localStorage.getItem("maxScore");
    if (storedMaxScore) {
      setMaxScore(parseInt(storedMaxScore, 10));
    }
  }, []);

  useEffect(() => {
    const fetchCountries = async () => {
      const response = await fetch("https://flagcdn.com/es/codes.json");
      const countryCodes = await response.json();
      const countryList = Object.entries(countryCodes)
        .filter(([code]) => !code.startsWith("us-"))
        .map(([code, name]) => ({
          code,
          name: name as string,
          flagUrl: `https://flagcdn.com/w640/${code}.webp`,
        }));
      setCountries(countryList);
    };

    fetchCountries();
    setIsCorrect(null);
  }, []);

  const startGame = () => {
    if (numCountries !== null && numCountries >= 5 && numCountries <= countries.length) {
      const shuffledCountries = countries.sort(() => Math.random() - 0.5).slice(0, numCountries);
      setRandomizedCountries(shuffledCountries);
      setGameStarted(true);
    }
  };

  const normalizeText = (text: string): string => {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  };

  const validateInput = () => {
    const currentCountry = randomizedCountries[currentIndex];
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
      if (currentIndex < randomizedCountries.length - 1) {
        setCurrentIndex((prevIndex) => prevIndex + 1);
        setUserInput("");
        setFeedback(null);
        setInputMode(true);
      } else {
        setFeedback("¡Juego terminado!");
        checkMaxScore(); 
      }
    }, 1500);
  };
  const checkMaxScore = () => {
    if (finalScore > maxScore) {
      setMaxScore(finalScore);
      localStorage.setItem("maxScore", finalScore.toString()); 
    }
  };

  const generateOptions = () => {
    const currentCountry = randomizedCountries[currentIndex];
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
    const currentCountry = randomizedCountries[currentIndex];
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

  if (!gameStarted) {
    return (
      <div className="App">
        <h1>Juego de Banderas</h1>
        <p>¿Con cuántos países quieres jugar? (5 hasta {countries.length})</p>
        <input
          type="number"
          value={numCountries ?? ""}
          onChange={(e) => setNumCountries(Number(e.target.value))}
          min={5}
          max={countries.length}
          placeholder="Ingresa un número"
        />
        <button onClick={startGame} disabled={numCountries === null || numCountries < 5 || numCountries > countries.length}>
          Comenzar juego
        </button>
      </div>
    );
  }

  if (randomizedCountries.length === 0) {
    return <div>Cargando datos...</div>;
  }

  const currentCountry = randomizedCountries[currentIndex];

  return (
    <div className="App">
      <h1>Juego de Banderas</h1>
      <div className="flag-card">
        {randomizedCountries.length - currentIndex} restantes
        <br />
        <img src={currentCountry.flagUrl} style={{ width: "300px" }} />
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
        {checkMaxScore()}
        <p>Aciertos: {score.correct}</p>
        <p>Errores: {score.incorrect}</p>
        <p>SCORE: {finalScore}</p>
        <p>Record: {maxScore}</p>
      </div>
    </div>
  );
};

export default App;
