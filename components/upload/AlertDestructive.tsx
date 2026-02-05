import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Trash2Icon } from "lucide-react"
import {deleteFolder} from "@/lib/actions/file.actions";

export function AlertDialogDestructive({folderName}:{folderName:string}) {

    const handleSubmit = async () => {
            "use server";
            await deleteFolder(folderName);
    }

    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" className="destructive-button">Delete All Files <Trash2Icon/></Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
              <Trash2Icon />
            <AlertDialogTitle>Delete chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove changes youve made and you will lose unsaved progress.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-1 justify-center">
            <AlertDialogCancel className="w-auto flex-1 justify-center">Cancel</AlertDialogCancel>
              <form onSubmit={handleSubmit} className="w-auto flex-1">
                <AlertDialogAction type="submit" className="destructive-button flex-1 w-full">Delete</AlertDialogAction>
              </form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
  )
}
