import { X } from "lucide-react";

type Modal = {
    open: boolean;
    title: string;
    message: string;
    action: () => void;
};

type Props = {
    modal: Modal;
    setModal: React.Dispatch<React.SetStateAction<Modal>>;
};

export function ConfirmModal({ modal, setModal }: Props) {

    if (!modal.open) return null;

    return (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

            <div className="bg-white rounded-xl p-6 w-[400px]">

                <div className="flex justify-between mb-3">

                    <h2 className="font-semibold">{modal.title}</h2>

                    <button onClick={() => setModal(prev => ({ ...prev, open: false }))}>
                        <X />
                    </button>

                </div>

                <p className="text-sm text-gray-600">
                    {modal.message}
                </p>

                <div className="flex justify-end gap-3 mt-4">

                    <button
                        onClick={() => setModal(prev => ({ ...prev, open: false }))}
                        className="px-3 py-1 border rounded"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={() => {
                            modal.action();
                            setModal(prev => ({ ...prev, open: false }));
                        }}
                        className="px-3 py-1 bg-red-600 text-white rounded"
                    >
                        Confirm
                    </button>

                </div>

            </div>

        </div>

    );
}