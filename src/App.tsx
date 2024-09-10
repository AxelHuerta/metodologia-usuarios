import { useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FormName from "./components/sections/FormName";
import { Button } from "./components/ui/button";
import Loading from "./components/sections/Loading";

// Definir el tipo de usuario
type User = {
  id: number;
  name: string;
  answers: string[];
};

const WS_URL = "ws://localhost:3000/ws";
const A = "Dulce";
const B = "Picante";

function App() {
  const [name, setName] = useState("");
  const [myUser, setMyUser] = useState<User>();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [round, setRound] = useState<number>(0);
  const [isButtonA, setIsButtonA] = useState(false);
  const [isButtonB, setIsButtonB] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [answerBankStatus, setAnswerBankStatus] = useState(true);

  const [timeLeft, setTimeLeft] = useState(0); // Tiempo inicial en segundos
  const [isRoundInProgress, setIsRoundInProgress] = useState(false);

  // Conectar a los websockets
  useWebSocket(WS_URL, {
    onOpen: () => {
      console.log("Connection opened");
      if (isLoaded) {
        getUsers();
        // TODO: Es necesario obtener la ronda actual?
        getRound();
        getAnswerBankStatus();
        getRoundStatus();
        getAnswers();
      }
    },
    onMessage: (event) => {
      const { type } = JSON.parse(event.data);
      if (
        type !== "on-user-count-changed" &&
        type !== "on-round-count-changed" &&
        type !== "on-answers-bank-count-changed"
      )
        return;
      getUsers();
      getRound();
      getRoundStatus();
      getAnswerBankStatus();
      getAnswers();
    },
    shouldReconnect: (closeEvent) => true,
  });

  // Enviar el formulario
  // TODO: Comporbar que el nombre no este vacío
  const handleSubmit = async () => {
    // Enviar el nombre al servidor
    const userData = await axios.post("http://localhost:3000/api/users", {
      name,
    });

    setMyUser(userData.data);
    setIsLoaded(true);
  };

  // Obtener usuarios
  const getUsers = async () => {
    const response = await axios.get("http://localhost:3000/api/users");

    setUsers(response.data);
  };

  // Obtener ronda actual
  async function getRound() {
    const response = await fetch("http://localhost:3000/api/round").then(
      (res) => {
        return res.json();
      }
    );

    setRound(response);
  }

  // Enviar la respuesta
  const sendAnswer = async (answer: string) => {
    await axios.post(`http://localhost:3000/api/users/${myUser?.id}`, {
      round,
      answer: answer,
    });

    console.log("Answer sent");
  };

  // Obtener el estado de la ronda
  const getRoundStatus = async () => {
    const response = await fetch("http://localhost:3000/api/round/status").then(
      (res) => {
        return res.json();
      }
    );

    if (response && !isRoundInProgress) {
      setIsRoundInProgress(true);
      setTimeLeft(60);
    } else if (!response) {
      setIsRoundInProgress(false);
      setTimeLeft(0);
    }
  };

  // Obtener las respuestas
  const getAnswers = async () => {
    const response = await axios.get("http://localhost:3000/api/answers");
    setAnswers(response.data);
  };

  // Obtener el estado del banco de respuestas
  const getAnswerBankStatus = async () => {
    const response = await axios.get(
      "http://localhost:3000/api/answers/status"
    );

    console.log("bank status", response.data);
    setAnswerBankStatus(response.data);
  };

  // Seleccionar la opción A
  const setOptionA = () => {
    console.log("Option A");
    setIsButtonB(false);
    setIsButtonA(true);
    sendAnswer(A);
  };

  // Seleccionar la opción A
  const setOptionB = () => {
    console.log("Option B");
    setIsButtonA(false);
    setIsButtonB(true);
    sendAnswer(B);
  };

  const handleAnswers = (u: User, index: number) => {
    if (u.answers[round] === undefined) {
      return "Esperando respuesta";
    }
    if (u.answers.length > 0 && answerBankStatus) {
      return answers[index];
    }
    if (u.answers.length > 0 && !answerBankStatus) {
      return u.answers[round];
    }
  };

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);

      // Limpiar el temporizador cuando el componente se desmonte
      return () => clearTimeout(timer);
    } else {
      setIsRoundInProgress(false);
      setIsButtonA(false);
      setIsButtonB(false);
    }
  }, [timeLeft]);

  if (!isLoaded) {
    return <FormName setName={setName} handleSubmit={handleSubmit} />;
  }

  if (isLoaded && !isRoundInProgress) {
    return <Loading />;
  }

  return (
    <main className="bg-neutral-100 min-h-screen flex flex-col justify-center items-center px-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Respuestas de otros usuarios */}
        <Card className="max-w-[500px]">
          <CardHeader>
            <CardTitle className="text-xl">
              Respuestas de otros usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            {users.map((u, index) => {
              if (u.id === myUser?.id) return null;
              return (
                <Card key={u.id} className="w-full mt-2">
                  <CardContent className="flex justify-around py-2 font-bold">
                    <span className="mr-4">{u.name}</span>
                    <span>{handleAnswers(u, index)}</span>
                  </CardContent>
                </Card>
              );
            })}
          </CardContent>
        </Card>

        {/* Respuestas del usuario */}
        <Card className="max-w-[400px] mt-2">
          <CardHeader>
            <CardTitle className="text-xl">¿Es dulce o picante?</CardTitle>
            <CardContent className="flex">
              <Button
                className={`w-full mx-1 ${
                  isButtonA ? "text-black bg-green-400 hover:bg-green-500" : ""
                }`}
                variant="outline"
                onClick={setOptionA}
              >
                Dulce
              </Button>
              <Button
                className={`w-full mx-1 ${
                  isButtonB ? "bg-green-400 text-black hover:bg-green-500" : ""
                }`}
                variant="outline"
                onClick={setOptionB}
              >
                Picante
              </Button>
            </CardContent>
          </CardHeader>
        </Card>
      </div>
      <footer className="mt-4 bottom-0 absolute bg-black text-white p-4 w-full">
        <div className="flex justify-around">
          <span>Ronda: {round + 1}</span>
          <span>{myUser?.name}</span>
          <span>Tiempo: {timeLeft}</span>
        </div>
      </footer>
    </main>
  );
}

export default App;
