import { Loader2 } from "lucide-react";

function Loading() {
  return (
    <main className="bg-neutral-100 min-h-screen flex items-center text-3xl justify-center">
      <div className="grid grid-cols-3 gap-4 items-center mx-4">
        <span className=" col-span-2">Esperando a que comience la ronda</span>
        <div className="flex justify-center">
          <Loader2 size={42} className="animate-spin text-center" />
        </div>
      </div>
    </main>
  );
}

export default Loading;
