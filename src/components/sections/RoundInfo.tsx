import { User } from "@/types";
import { Card, CardContent } from "@/components/ui/card";

type Props = {
  round: number;
  time: number;
  user?: User;
};

/**
 * Componente que muestra información sobre la ronda actual, el tiempo restante y el usuario.
 *
 * @component
 * @param {Readonly<Props>} props - Las propiedades del componente.
 * @param {number} props.round - El número de la ronda actual.
 * @param {number} props.time - El tiempo restante en la ronda.
 * @param {User} props.user - El usuario actual.
 * @returns {JSX.Element} Un elemento JSX que muestra la información de la ronda.
 */
function RoundInfo(props: Readonly<Props>) {
  const { round, time, user } = props;
  return (
    <Card className="flex justify-center items-center pt-3 md:col-span-2">
      <CardContent className="flex justify-between items-center w-full">
        <span>Ronda: {round + 1}</span>
        <span>{user?.name}</span>
        <span>Tiempo: {time}</span>
      </CardContent>
    </Card>
  );
}

export default RoundInfo;
