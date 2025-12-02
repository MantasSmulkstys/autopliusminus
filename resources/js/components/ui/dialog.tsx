import * as React from 'react';
import { cn } from '@/lib/utils';

type DialogContextValue = {
    open: boolean;
    setOpen: (open: boolean) => void;
};

const DialogContext = React.createContext<DialogContextValue | undefined>(
    undefined
);

const useDialogContext = () => {
    const context = React.useContext(DialogContext);
    if (!context) {
        throw new Error('Dialog components must be used within Dialog');
    }
    return context;
};

interface DialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
}

const Dialog = ({ open: controlledOpen, onOpenChange, children }: DialogProps) => {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
    
    const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
    const setOpen = onOpenChange || setUncontrolledOpen;

    return (
        <DialogContext.Provider value={{ open, setOpen }}>
            {children}
        </DialogContext.Provider>
    );
};

interface DialogTriggerProps extends React.HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

const DialogTrigger = React.forwardRef<HTMLElement, DialogTriggerProps>(
    ({ asChild, children, ...props }, ref) => {
        const { setOpen } = useDialogContext();

        if (asChild && React.isValidElement(children)) {
            return React.cloneElement(children as React.ReactElement<any>, {
                onClick: (e: React.MouseEvent) => {
                    setOpen(true);
                    children.props.onClick?.(e);
                },
            });
        }

        return (
            <button
                type="button"
                onClick={() => setOpen(true)}
                {...props}
            >
                {children}
            </button>
        );
    }
);
DialogTrigger.displayName = 'DialogTrigger';

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
    ({ className, children, ...props }, ref) => {
        const { open, setOpen } = useDialogContext();

        React.useEffect(() => {
            if (open) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = 'unset';
            }
            return () => {
                document.body.style.overflow = 'unset';
            };
        }, [open]);

        if (!open) return null;

        return (
            <>
                {/* Backdrop */}
                <div
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                    onClick={() => setOpen(false)}
                />
                {/* Dialog */}
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        ref={ref}
                        className={cn(
                            'relative w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg',
                            className
                        )}
                        onClick={(e) => e.stopPropagation()}
                        {...props}
                    >
                        {/* Close button */}
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                            <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                            <span className="sr-only">Close</span>
                        </button>
                        {children}
                    </div>
                </div>
            </>
        );
    }
);
DialogContent.displayName = 'DialogContent';

interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const DialogHeader = ({ className, ...props }: DialogHeaderProps) => (
    <div
        className={cn(
            'flex flex-col space-y-1.5 text-center sm:text-left',
            className
        )}
        {...props}
    />
);
DialogHeader.displayName = 'DialogHeader';

interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(
    ({ className, ...props }, ref) => (
        <h2
            ref={ref}
            className={cn(
                'text-lg font-semibold leading-none tracking-tight',
                className
            )}
            {...props}
        />
    )
);
DialogTitle.displayName = 'DialogTitle';

interface DialogDescriptionProps
    extends React.HTMLAttributes<HTMLParagraphElement> {}

const DialogDescription = React.forwardRef<
    HTMLParagraphElement,
    DialogDescriptionProps
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn('text-sm text-muted-foreground', className)}
        {...props}
    />
));
DialogDescription.displayName = 'DialogDescription';

export {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
};

