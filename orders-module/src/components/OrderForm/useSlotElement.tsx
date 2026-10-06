import {
    type KeyboardEventHandler,
    type ReactNode,
    useLayoutEffect,
    useState,
} from 'react';
import { createPortal } from 'react-dom';

export type SlotState = {
    pending: boolean;
    element: HTMLElement | null;
};

const NO_SLOT: SlotState = { pending: false, element: null };

const SLOT_WAIT_MS = 1000;

export const useSlotElement = (elementId?: string): SlotState => {
    const [state, setState] = useState<SlotState>(() =>
        elementId ? { pending: true, element: null } : NO_SLOT
    );

    useLayoutEffect(() => {
        if (!elementId) {
            setState(NO_SLOT);
            return;
        }

        const found = document.getElementById(elementId);
        if (found) {
            setState(
                found.closest('form')
                    ? NO_SLOT
                    : { pending: false, element: found }
            );
            return;
        }

        setState((s) =>
            s.pending && !s.element ? s : { pending: true, element: null }
        );
        const observer = new MutationObserver(() => {
            const target = document.getElementById(elementId);
            if (target) {
                observer.disconnect();
                setState(
                    target.closest('form')
                        ? NO_SLOT
                        : { pending: false, element: target }
                );
            }
        });
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
        });

        const timer = window.setTimeout(() => {
            observer.disconnect();
            setState((s) => (s.element ? s : NO_SLOT));
        }, SLOT_WAIT_MS);

        return () => {
            observer.disconnect();
            window.clearTimeout(timer);
        };
    }, [elementId]);

    return state;
};

export const renderInSlot = (
    section: ReactNode,
    slot: SlotState,
    onKeyDown?: KeyboardEventHandler<HTMLDivElement>
) => {
    if (!section || !slot.pending) {
        return slot.element && section
            ? createPortal(
                  <div className="sdk-scope" onKeyDown={onKeyDown}>
                      {section}
                  </div>,
                  slot.element
              )
            : section;
    }

    return null;
};
