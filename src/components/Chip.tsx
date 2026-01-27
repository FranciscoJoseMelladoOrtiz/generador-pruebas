import { ChipVariant } from "@/models/ui-models";
import { Badge } from "./ui/badge";


type ChipProps = {
    children: string;
    variant?: ChipVariant;
}

export  function Chip({ children, variant = 'primary' }: ChipProps) {
    if (variant === 'secondary')
        return (<Badge variant='secondary'>{children}</Badge>)
    else if (variant === 'danger')
        return (<Badge variant='destructive'>{children}</Badge>)
    else if (variant === 'warning')
        return (<Badge className="bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300">{children}</Badge>)
    else if (variant === 'success')
        return (<Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">{children}</Badge>)
    else 
        return (<Badge>{children}</Badge>)
}