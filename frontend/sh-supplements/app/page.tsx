import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <p>
        this is the home page of the sh-supplements app. you can add your
        content here.
      </p>

      <Button>
        <Link href="/register">Sign up</Link>
      </Button>
    </div>
  );
}
