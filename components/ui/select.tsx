import { cn } from '@/lib/utils';
import { CheckIcon, ChevronDownIcon } from '@radix-ui/react-icons';
import * as SelectPrimitive from '@radix-ui/react-select';
import { ReactNode } from 'react';

const Select = SelectPrimitive.Root;
const SelectTrigger = SelectPrimitive.Trigger;
const SelectValue = SelectPrimitive.Value;
const SelectItem = SelectPrimitive.Item;
const SelectItemText = SelectPrimitive.ItemText;
const SelectItemIndicator = SelectPrimitive.ItemIndicator;

interface SelectTriggerProps
  extends React.ComponentPropsWithoutRef<typeof SelectTrigger> {
  children: ReactNode;
}

interface SelectContentProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> {
  children: ReactNode;
}

interface SelectItemProps
  extends React.ComponentPropsWithoutRef<typeof SelectItem> {
  children: ReactNode;
}

const SelectTriggerComponent: React.FC<SelectTriggerProps> = ({
  children,
  ...props
}) => (
  <SelectTrigger
    {...props}
    className={cn(
      'inline-flex items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 hover:border-violet-400 transition-colors',
      props.className
    )}
  >
    {children}
    <ChevronDownIcon className="ml-2 h-5 w-5 text-gray-400" />
  </SelectTrigger>
);

const SelectContentComponent: React.FC<SelectContentProps> = ({
  children,
  ...props
}) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      {...props}
      className={cn(
        'relative z-50 min-w-[8rem] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg',
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        props.className
      )}
      position="popper"
      sideOffset={4}
    >
      <SelectPrimitive.Viewport className="p-1">
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
);

const SelectItemComponent: React.FC<SelectItemProps> = ({
  children,
  ...props
}) => (
  <SelectItem
    {...props}
    className={cn(
      'relative flex items-center w-full rounded-md px-8 py-2 text-sm text-gray-900 cursor-pointer select-none outline-none',
      'hover:bg-violet-50 hover:text-violet-900',
      'focus:bg-violet-100 focus:text-violet-900',
      'data-[state=checked]:bg-violet-600 data-[state=checked]:text-white data-[state=checked]:font-medium',
      'transition-colors',
      props.className
    )}
  >
    <SelectItemIndicator className="absolute left-2 inline-flex items-center justify-center">
      <CheckIcon className="w-4 h-4" />
    </SelectItemIndicator>
    <SelectItemText>{children}</SelectItemText>
  </SelectItem>
);

export {
    Select,
    SelectContentComponent as SelectContent,
    SelectItemComponent as SelectItem,
    SelectTriggerComponent as SelectTrigger,
    SelectValue
};

