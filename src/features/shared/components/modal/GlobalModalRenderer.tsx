import { useState } from "react";
import { useGlobalModal } from "@/features/shared/context/GlobalModalContext";
import { X } from "lucide-react";
import {
    sendVerificationCode,
    verifyVerificationCode
} from "@/features/shared/services/verificationService";

export default function GlobalModalRenderer() {

    const { modal, closeModal } = useGlobalModal();

    const [method, setMethod] = useState<"email" | "phone">("email");
    const [code, setCode] = useState("");

    if (!modal.open) return null;

    if (modal.type !== "verifyAccount") return null;

    async function handleSendCode() {
        const value =
            method === "email"
                ? modal.data.email
                : modal.data.phone;

        try {
            await sendVerificationCode(method, value);
            alert("Verification code sent!");
        } catch (error) {

            alert("Failed to send code");
        }
    }

    async function handleVerify() {
        const value =
            method === "email"
                ? modal.data.email
                : modal.data.phone;
        try {
            const res = await verifyVerificationCode(
                method,
                value,
                code
            );
            if (!res.success) {
                alert("Invalid verification code");
                return;
            }
            modal.data.onVerified();
            closeModal();
        } catch {

            alert("Verification failed");
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="bg-white p-6 rounded-xl w-[420px] space-y-4">

                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-lg">
                        Verify Account
                    </h2>

                    <button onClick={closeModal}>
                        <X />
                    </button>
                </div>

                <div className="flex gap-3">

                    <button
                        onClick={() => setMethod("email")}
                        className={`px-3 py-1 rounded border ${method === "email" ? "bg-orange-600 text-white" : ""
                            }`}
                    >
                        Email
                    </button>

                    <button
                        onClick={() => setMethod("phone")}
                        className={`px-3 py-1 rounded border ${method === "phone" ? "bg-orange-600 text-white" : ""
                            }`}
                    >
                        Phone
                    </button>

                </div>

                <p className="text-sm text-gray-500">
                    Send code to:{" "}
                    {method === "email"
                        ? modal.data.email
                        : modal.data.phone}
                </p>

                <button
                    onClick={handleSendCode}
                    className="w-full border py-2 rounded"
                >
                    Send Verification Code
                </button>

                <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter verification code"
                    className="border p-2 rounded w-full"
                />

                <button
                    onClick={handleVerify}
                    className="w-full bg-orange-600 text-white py-2 rounded"
                >
                    Verify
                </button>

            </div>

        </div>
    );
}