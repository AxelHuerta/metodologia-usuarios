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

const btnActiveStyles = "text-black border-2 border-black";

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
  const [limitOfUsers, setLimitOfUsers] = useState(false);

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

    if (userData.data.error) {
      setLimitOfUsers(true);
      return;
    }

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

  // Manejar las respuestas de los usuarios
  const handleAnswers = (u: User, index: number) => {
    if (u.answers[round] === undefined) {
      return "...";
    }
    if (u.answers.length > 0 && answerBankStatus) {
      return answers[index];
    }
    if (u.answers.length > 0 && !answerBankStatus) {
      return u.answers[round];
    }
  };

  const checkUsersLimit = () => {
    if (limitOfUsers) return true;

    return false;
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

  if (limitOfUsers) {
    return (
      <main className="bg-neutral-100 min-h-screen flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold">
          ¡Ya hay suficientes participantes!
        </h2>
      </main>
    );
  }

  if (!isLoaded) {
    return (
      <FormName
        setName={setName}
        handleSubmit={handleSubmit}
        checkUsersLimit={checkUsersLimit}
      />
    );
  }

  if (isLoaded && !isRoundInProgress && !checkUsersLimit()) {
    return <Loading />;
  }

  return (
    <main className="bg-neutral-100 min-h-screen flex flex-col justify-center items-center">
      <div className="grid grid-cols-1 gap-2 w-full px-2 max-w-[1400px] md:grid-cols-2">
        {/* Respuestas de otros usuarios */}
        <Card>
          {/* TODO: Tamaño de 4 participantes */}
          <CardContent className="min-h-[450px]">
            <CardTitle className="text-xl my-2 text-center md:my-4">
              Respuestas de otros usuarios
            </CardTitle>
            {users.map((u, index) => {
              if (u.id === myUser?.id) return null;
              return (
                <Card key={u.id} className="w-full my-1">
                  <CardContent className="flex justify-between py-2 font-bold">
                    <span className="mr-4">{u.name}</span>
                    <span>{handleAnswers(u, index)}</span>
                  </CardContent>
                </Card>
              );
            })}
          </CardContent>
        </Card>

        {/* Respuestas del usuario */}
        <Card className="flex justify-center items-center">
          <CardHeader>
            <CardTitle className="text-xl text-center">
              ¿Es dulce o picante?
            </CardTitle>
            <CardContent className="flex">
              <Button
                className={`w-full mx-1 ${isButtonA ? btnActiveStyles : ""}`}
                variant="outline"
                onClick={setOptionA}
              >
                Dulce
              </Button>
              <Button
                className={`w-full mx-1 ${isButtonB ? btnActiveStyles : ""}`}
                variant="outline"
                onClick={setOptionB}
              >
                Picante
              </Button>
            </CardContent>
          </CardHeader>
        </Card>
        <Card className="flex justify-center items-center pt-3 md:col-span-2">
          <CardContent className="flex justify-between items-center w-full">
            <span>Ronda: {round + 1}</span>
            {/* <span>{myUser?.name}</span> */}
            <span>John Doe</span>
            <span>Tiempo: {timeLeft}</span>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default App;
