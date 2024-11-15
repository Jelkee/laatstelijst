import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function FloatingLoaderSpinner({text}: {text: string}){
    return(
        <div className="flex items-center justify-center min-h-screen">
            <Button disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {text}
            </Button>
        </div>

    )
}