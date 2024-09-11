import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Props = {
  setName: (name: string) => void;
  handleSubmit: () => void;
};

function FormName(props: Readonly<Props>) {
  const { setName, handleSubmit } = props;

  // Manejar el input
  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  return (
    <main className="bg-neutral-100 min-h-screen flex flex-col justify-center px-4">
      <div className="w-full max-w-[500px] mx-auto">
        <Label className="text-xl">Nombre</Label>
        <Input
          placeholder="Ingrese su nombre"
          className="border-2 border-neutral-400"
          name="name"
          onChange={handleInput}
        />
        <div className="text-right my-4">
          <Button onClick={handleSubmit}>Enviar</Button>
        </div>
      </div>
    </main>
  );
}

export default FormName;
