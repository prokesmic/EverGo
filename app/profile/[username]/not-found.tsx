import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileQuestion } from "lucide-react"

export default function ProfileNotFound() {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
            <div className="bg-muted p-4 rounded-full mb-4">
                <FileQuestion className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
                We couldn't find the user you're looking for. They might have changed their username or the account doesn't exist.
            </p>
            <div className="flex gap-4">
                <Button asChild variant="outline">
                    <Link href="/home">Go Home</Link>
                </Button>
                <Button asChild>
                    <Link href="/rankings">Explore Rankings</Link>
                </Button>
            </div>
        </div>
    )
}
