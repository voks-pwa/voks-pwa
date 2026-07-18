import { useState, useRef, useEffect, type FormEvent } from "react";
import { Send, Pin, Trash2, Shield } from "lucide-react";
import { useLiveChat } from "../hooks/useLiveChat";
import { useAuth } from "@/features/auth/useAuth";
import { useProfile } from "@/features/profile/hooks/useProfile";
import type { LiveMessage } from "../types";

export function LiveChat() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { messages, send, remove, pin, sending } = useLiveChat(user?.id, profile ?? undefined);
  const [input, setInput] = useState("");
  const [showModTools, setShowModTools] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending) return;
    send(input);
    setInput("");
  }

  const isModerator = profile?.role === "admin" || profile?.role === "superadmin";

  return (
    <div className="flex h-full flex-col rounded-2xl bg-black/40 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h3 className="text-sm font-bold text-white">Live Chat</h3>
        <div className="flex items-center gap-2">
          {isModerator && (
            <button
              type="button"
              onClick={() => setShowModTools(!showModTools)}
              className={`rounded-lg p-1.5 transition ${showModTools ? "bg-[#bda752]/30 text-[#bda752]" : "text-white/50 hover:bg-white/10 hover:text-white"}`}
              title="Moderator Tools"
            >
              <Shield size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="space-y-3">
          {messages.map((msg) => {
            if (msg.deleted) return null;
            return (
              <LiveChatMessage
                key={msg.id}
                message={msg}
                isModerator={isModerator}
                onDelete={remove}
                onPin={pin}
              />
            );
          })}
        </div>
        <div ref={bottomRef} />
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-white/10 px-4 py-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            maxLength={500}
            className="flex-1 rounded-xl bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:ring-1 focus:ring-[#bda752]"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#bda752] text-white transition hover:bg-[#a8913f] disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </form>
      ) : (
        <div className="border-t border-white/10 px-4 py-3">
          <a
            href={`/auth/login?redirect=${encodeURIComponent("/live")}`}
            className="block rounded-xl bg-white/10 py-2 text-center text-xs font-semibold text-white/60 transition hover:bg-white/20"
          >
            Sign in to chat
          </a>
        </div>
      )}
    </div>
  );
}

interface MessageProps {
  message: LiveMessage;
  isModerator: boolean;
  onDelete: (id: number) => void;
  onPin: (id: number, pinned: boolean) => void;
}

function LiveChatMessage({ message, isModerator, onDelete, onPin }: MessageProps) {
  const time = new Date(message.created_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const avatarUrl = message.avatar_url;
  const initials = (message.display_name ?? "U").charAt(0).toUpperCase();

  return (
    <div className={`group flex items-start gap-2 ${message.pinned ? "rounded-lg bg-[#bda752]/10 px-2 py-1" : ""}`}>
      <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full bg-white/10">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-bold text-white">
            {initials}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-white">
            {message.display_name ?? "User"}
          </span>
          {message.badge_name && (
            <span className="rounded bg-[#bda752]/20 px-1.5 py-0.5 text-[10px] font-medium text-[#bda752] leading-none">
              {message.badge_name}
            </span>
          )}
          {message.level > 0 && (
            <span className="text-[10px] text-white/40 leading-none">
              Lv.{message.level}
            </span>
          )}
          <span className="text-[10px] text-white/30 leading-none">{time}</span>
          {message.pinned && (
            <Pin size={10} className="text-[#bda752]" />
          )}
        </div>
        <p className="mt-0.5 text-sm text-white/90 break-words">
          {message.message}
        </p>
      </div>
      {isModerator && (
        <div className="hidden gap-1 group-hover:flex">
          <button
            type="button"
            onClick={() => onPin(message.id, !message.pinned)}
            className={`rounded p-1 transition ${message.pinned ? "text-[#bda752]" : "text-white/30 hover:text-white"}`}
            title="Pin"
          >
            <Pin size={12} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(message.id)}
            className="rounded p-1 text-white/30 transition hover:text-red-400"
            title="Delete"
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
