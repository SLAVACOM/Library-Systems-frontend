import { cn } from '@/lib/utils'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { ReactNode } from 'react'

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogContent = DialogPrimitive.Content;
const DialogOverlay = DialogPrimitive.Overlay;

interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogContent> {
  children: ReactNode;
}

const DialogContentComponent: React.FC<DialogContentProps> = ({
  children,
  ...props
}) => (
  <DialogPrimitive.Portal>
    <DialogOverlay className="fixed inset-0 z-50 bg-black/50" />
    <DialogContent
      {...props}
      className={cn(
        'fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] bg-white rounded-lg shadow-lg w-full max-w-lg p-6',
        props.className
      )}
    >
      {children}
    </DialogContent>
  </DialogPrimitive.Portal>
);

const DialogHeader: React.FC<{ children: ReactNode }> = ({ children }) => (
  <div className="mb-4 space-y-2">{children}</div>
);

const DialogFooter: React.FC<{ children: ReactNode }> = ({ children }) => (
  <div className="mt-4 flex justify-end space-x-2">{children}</div>
);

const DialogTitle: React.FC<React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>> = ({
  className,
  ...props
}) => (
  <DialogPrimitive.Title
    className={cn(
      'text-lg font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
);

const DialogDescription: React.FC<React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>> = ({
  className,
  ...props
}) => (
  <DialogPrimitive.Description
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
);

const VisuallyHidden: React.FC<{ children: ReactNode }> = ({ children }) => (
  <span className="sr-only">{children}</span>
);

export {
  Dialog,
  DialogContentComponent as DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
  VisuallyHidden
}

