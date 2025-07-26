"use client";

import { motion } from "framer-motion";
import { Loader2, Send } from "lucide-react";

export default function SubmitButton({ sending }: { sending: boolean }) {
  return (
    <button
      type="submit"
      disabled={sending}
      className={`w-full py-3 px-4 rounded-lg flex justify-center items-center gap-2 font-medium text-white transition-colors ${
        sending
          ? "bg-yellow-400 cursor-not-allowed"
          : "bg-yellow-500 hover:bg-yellow-600"
      }`}
    >
      {sending ? (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          >
            <Loader2 className="w-5 h-5 animate-spin" />
          </motion.div>
          Sending...
        </>
      ) : (
        <>
          <Send className="w-5 h-5" />
          Send Messages
        </>
      )}
    </button>
  );
}
