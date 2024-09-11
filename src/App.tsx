import { useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FormName from "./components/sections/FormName";
import { Button } from "./components/ui/button";
import Loading from "./components/sections/Loading";
import UsersLimit from "./components/sections/UsersLimit";
import RoundInfo from "./components/sections/RoundInfo";

// Definir el tipo de usuario
type User = {
  id: number;
  name: string;
  answers: string[];
};

const WS_URL = "ws://localhost:3000/ws";
const A = "Dulce";
const B = "Picante";
const roundTime = 60;

// Estilos para los botones activos
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
  const [isLimitOfUsers, setIsLimitOfUsers] = useState(false);

  const [timeLeft, setTimeLeft] = useState(0); // Tiempo inicial en segundos
  const [isRoundInProgress, setIsRoundInProgress] = useState(false);

  // Conectar a los websockets
  useWebSocket(WS_URL, {
    onOpen: () => {
      console.log("Connection opened");
      if (isLoaded) {
        getUsers();
        getRound();
        getLimitOfUsers();
        getAnswerBankStatus();
        getRoundStatus();
        getAnswers();
        getLimitOfUsers();
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
      getLimitOfUsers();
    },
    shouldReconnect: () => true,
  });

  // TODO: Comporbar que el nombre no este vacío
  /**
   * Maneja el envío del formulario.
   * Envía el nombre al servidor y comprueba si se ha alcanzado el límite de usuarios.
   *
   * @async
   * @function handleSubmit
   * @returns {Promise<void>} No retorna ningún valor.
   */
  const handleSubmit = async () => {
    // Enviar el nombre al servidor
    const userData = await axios.post("http://localhost:3000/api/users", {
      name,
    });

    // Comprobar si el limite se ha alcanzado
    if (userData.data.error) {
      setIsLimitOfUsers(true);
      return;
    }

    // Guardar el usuario en el estado
    setMyUser(userData.data);
    setIsLoaded(true);
  };

  /**
   * Obtiene la lista de usuarios desde el servidor y actualiza el estado de usuarios.
   *
   * @async
   * @function getUsers
   * @returns {Promise<void>} No retorna ningún valor.
   */
  const getUsers = async () => {
    const response = await axios.get("http://localhost:3000/api/users");

    // Actualizar el estado de los usuarios
    setUsers(response.data);
  };

  /**
   * Obtiene la ronda actual desde el servidor y actualiza el estado de la ronda.
   *
   * @async
   * @function getRound
   * @returns {Promise<void>} No retorna ningún valor.
   */
  async function getRound() {
    const response = await fetch("http://localhost:3000/api/round").then(
      (res) => {
        return res.json();
      }
    );

    // Actualizar el estado de la ronda
    setRound(response);
  }

  /**
   * Envía la respuesta del usuario al servidor.
   *
   * @async
   * @function sendAnswer
   * @param {string} answer - La respuesta del usuario.
   * @returns {Promise<void>} No retorna ningún valor.
   */
  const sendAnswer = async (answer: string) => {
    await axios.post(`http://localhost:3000/api/users/${myUser?.id}`, {
      round,
      answer: answer,
    });
  };

  /**
   * Obtiene el estado de la ronda desde el servidor y actualiza el estado de la ronda.
   *
   * @async
   * @function getRoundStatus
   * @returns {Promise<void>} No retorna ningún valor.
   */
  const getRoundStatus = async () => {
    const response = await fetch("http://localhost:3000/api/round/status").then(
      (res) => {
        return res.json();
      }
    );

    // Actualizar el estado de la ronda
    if (response && !isRoundInProgress) {
      setIsRoundInProgress(true);
      setTimeLeft(roundTime);
    } else if (!response) {
      setIsRoundInProgress(false);
      setTimeLeft(0);
    }
  };

  /**
   * Obtiene la lista de respuestas desde el servidor y actualiza el estado de respuestas.
   *
   * @async
   * @function getAnswers
   * @returns {Promise<void>} No retorna ningún valor.
   */
  const getAnswers = async () => {
    const response = await axios.get("http://localhost:3000/api/answers");
    setAnswers(response.data);
  };

  /**
   * Obtiene el estado del banco de respuestas desde el servidor y
   * actualiza el estado del banco de respuestas.
   *
   * @async
   * @function getAnswerBankStatus
   * @returns {Promise<void>} No retorna ningún valor.
   */
  const getAnswerBankStatus = async () => {
    const response = await axios.get(
      "http://localhost:3000/api/answers/status"
    );

    setAnswerBankStatus(response.data);
  };

  /**
   * Obtiene el límite de usuarios desde el servidor y actualiza el estado de límite de usuarios.
   *
   * @async
   * @function getLimitOfUsers
   * @returns {Promise<void>} No retorna ningún valor.
   */
  const getLimitOfUsers = async () => {
    const response = await axios.get("http://localhost:3000/api/users/limit");
    setIsLimitOfUsers(response.data <= users.length);
  };

  /**
   * Selecciona la opción A, actualiza el estado de los botones y envía la respuesta.
   *
   * @function setOptionA
   * @returns {void} No retorna ningún valor.
   */
  const setOptionA = () => {
    setIsButtonB(false);
    setIsButtonA(true);
    sendAnswer(A);
  };

  /**
   * Selecciona la opción B, actualiza el estado de los botones y envía la respuesta.
   *
   * @function setOptionB
   * @returns {void} No retorna ningún valor.
   */
  const setOptionB = () => {
    console.log("Option B");
    setIsButtonA(false);
    setIsButtonB(true);
    sendAnswer(B);
  };

  /**
   * Maneja las respuestas de los usuarios y retorna la respuesta correspondiente.
   *
   * @function handleAnswers
   * @param {User} u - El usuario cuyas respuestas se están manejando.
   * @param {number} index - El índice de la respuesta en el array de respuestas.
   * @returns {string} La respuesta del usuario o "..." si no hay respuesta.
   */
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

  // Si el límite de usuarios se ha alcanzado, mostrar un mensaje
  if (isLimitOfUsers && !users.some((u) => u.id === myUser?.id)) {
    return <UsersLimit />;
  }

  // Si el usuario no ha ingresado su nombre, mostrar el formulario
  if (!isLoaded) {
    return <FormName setName={setName} handleSubmit={handleSubmit} />;
  }

  // Si el usuario se ha registrado y la ronda no ha comenzado, mostrar un mensaje de carga
  if (isLoaded && !isRoundInProgress) {
    return <Loading />;
  }

  // Si el usuario se ha registrado y la ronda ha comenzado, mostrar la interfaz del quiz
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

        {/* Información de la ronda */}
        <RoundInfo round={round} time={timeLeft} user={myUser} />
      </div>
    </main>
  );
}

export default App;
