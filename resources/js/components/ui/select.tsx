import * as React from 'react';
import { cn } from '@/lib/utils';

type SelectContextValue = {
    value: string;
    onValueChange: (value: string) => void;
    open: boolean;
    setOpen: (open: boolean) => void;
};

const SelectContext = React.createContext<SelectContextValue | undefined>(
    undefined
);

const useSelectContext = () => {
    const context = React.useContext(SelectContext);
    if (!context) {
        throw new Error('Select components must be used within Select');
    }
    return context;
};

interface SelectProps {
    value?: string;
    onValueChange?: (value: string) => void;
    children: React.ReactNode;
}

const Select = ({ value = '', onValueChange, children }: SelectProps) => {
    const [open, setOpen] = React.useState(false);

    return (
        <SelectContext.Provider
            value={{
                value,
                onValueChange: onValueChange || (() => {}),
                open,
                setOpen,
            }}
        >
            {children}
        </SelectContext.Provider>
    );
};

interface SelectTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
    disabled?: boolean;
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
    ({ className, children, disabled, ...props }, ref) => {
        const { open, setOpen } = useSelectContext();

        return (
            <button
                type="button"
                ref={ref}
                className={cn(
                    'flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
                    className
                )}
                onClick={() => !disabled && setOpen(!open)}
                disabled={disabled}
                {...props}
            >
                {children}
                <svg
                    className="h-4 w-4 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>
        );
    }
);
SelectTrigger.displayName = 'SelectTrigger';

interface SelectValueProps {
    placeholder?: string;
}

const SelectValue = ({ placeholder }: SelectValueProps) => {
    const { value } = useSelectContext();
    return <span>{value || placeholder}</span>;
};

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
    ({ className, children, ...props }, ref) => {
        const { open, setOpen } = useSelectContext();

        if (!open) return null;

        return (
            <>
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setOpen(false)}
                />
                <div
                    ref={ref}
                    className={cn(
                        'absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md',
                        className
                    )}
                    {...props}
                >
                    {children}
                </div>
            </>
        );
    }
);
SelectContent.displayName = 'SelectContent';

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string;
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
    ({ className, children, value, ...props }, ref) => {
        const { value: selectedValue, onValueChange, setOpen } = useSelectContext();

        return (
            <div
                ref={ref}
                className={cn(
                    'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
                    selectedValue === value && 'bg-accent',
                    className
                )}
                onClick={() => {
                    onValueChange(value);
                    setOpen(false);
                }}
                {...props}
            >
                {children}
            </div>
        );
    }
);
SelectItem.displayName = 'SelectItem';

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };

