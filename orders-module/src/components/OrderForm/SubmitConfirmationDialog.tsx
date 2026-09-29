import { FC } from 'react';

import { SubmitConfirmationType } from '../../types/general';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../ui/alert-dialog';

type Props = {
    isOpen: boolean;
    confirmation: SubmitConfirmationType;
    onConfirm: () => void;
    onCancel: () => void;
};

const SubmitConfirmationDialog: FC<Props> = ({
    isOpen,
    confirmation,
    onConfirm,
    onCancel,
}) => (
    <AlertDialog
        open={isOpen}
        onOpenChange={(open) => {
            if (!open) onCancel();
        }}
    >
        <AlertDialogContent data-testid="sdk-submit-confirmation-dialog">
            <AlertDialogHeader>
                <AlertDialogTitle>{confirmation.title}</AlertDialogTitle>
                {confirmation.description && (
                    <AlertDialogDescription>
                        {confirmation.description}
                    </AlertDialogDescription>
                )}
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel variant="ghost">
                    {confirmation.cancelText}
                </AlertDialogCancel>
                <AlertDialogAction onClick={onConfirm}>
                    {confirmation.confirmText}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
);

export default SubmitConfirmationDialog;
