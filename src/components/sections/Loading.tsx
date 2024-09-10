import { Loader2 } from "lucide-react";

function Loading() {
  return (
    <main className="bg-neutral-100 min-h-screen flex flex-col justify-center items-center">
      <h1 className="text-3xl font-bold">
        <p className="flex items-center">
          Esperando a que comience la ronda
          <Loader2 size={32} className="animate-spin ml-2" />
        </p>
      </h1>
    </main>
  );
}

export default Loading;
