import React, { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  MessageSquareText,
  Send,
  Loader2,
  Sparkles,
  ShieldAlert,
  Bot,
  UserCheck,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { askEnergyData, type EnergyChatResponse } from "@/lib/ai.functions";
import { AgentPersonaBadge } from "@/components/AgentPersonaBadge";
import { toast } from "sonner";

interface MessageItem {
  id: string;
  sender: "user" | "ai";
  text: string;
  responseObj?: EnergyChatResponse;
  timestamp: Date;
}

const PRESET_QUESTIONS = [
  "Which machine wasted the most energy last week?",
  "Why was Compressor_A flagged?",
  "What is our total estimated standby cost?",
  "Which machine has the lowest utilization ratio?",
];

export function AskEnergyDataPanel({
  trigger,
}: {
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<MessageItem[]>([]);

  const askFn = useServerFn(askEnergyData);

  const handleSend = async (questionText?: string) => {
    const query = (questionText || input).trim();
    if (!query || loading) return;

    const userMsg: MessageItem = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!questionText) setInput("");
    setLoading(true);

    try {
      const res = await askFn({ data: { question: query } });
      const aiMsg: MessageItem = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: res.answer,
        responseObj: res,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to query energy data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button
            variant="glassSecondary"
            size="sm"
            className="gap-2 cursor-pointer font-medium text-xs text-[#38BDF8] border-[#38BDF8]/30 hover:bg-[#38BDF8]/10"
          >
            <MessageSquareText className="h-4 w-4" /> Ask Your Energy Data
          </Button>
        )}
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg p-0 flex flex-col bg-[#0A0D12] border-l border-white/10 text-white"
      >
        {/* Panel Header */}
        <SheetHeader className="p-4 border-b border-white/10 bg-[#0D121B] flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#38BDF8]/10 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8]">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <SheetTitle className="text-sm font-bold text-white font-display leading-none">
                Ask Your Energy Data
              </SheetTitle>
              <span className="text-[10px] font-mono text-[#8D97A3]">
                GROQ LLAMA 3.3 READ-ONLY CONVERSATIONAL ENGINE
              </span>
            </div>
          </div>
        </SheetHeader>

        {/* Read-Only Banner */}
        <div className="bg-[#38BDF8]/5 border-b border-[#38BDF8]/20 px-4 py-2 text-[10px] font-mono text-[#38BDF8] flex items-center gap-1.5">
          <ShieldAlert className="h-3 w-3 shrink-0" />
          <span>Read-only analytics query. Answers strictly cite uploaded telemetry data.</span>
        </div>

        {/* Message Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="space-y-4 pt-4">
              <div className="glass-panel p-4 border border-white/5 space-y-2 text-center">
                <Bot className="h-8 w-8 text-[#38BDF8] mx-auto opacity-80" />
                <h4 className="text-xs font-bold text-white">Ask anything about your shopfloor telemetry</h4>
                <p className="text-[11px] text-[#8D97A3] font-body leading-relaxed">
                  Query machine standby losses, total costs, highest waste offenders, and causal reasoning in plain English.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-mono text-[#8D97A3] block uppercase tracking-wider">
                  SUGGESTED QUESTIONS
                </span>
                <div className="grid gap-2">
                  {PRESET_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(q)}
                      className="text-left text-xs p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-[#38BDF8]/30 text-[#EDF1F5] transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <span>{q}</span>
                      <Sparkles className="h-3 w-3 text-[#38BDF8] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${
                m.sender === "user" ? "items-end" : "items-start"
              }`}
            >
              {m.sender === "user" ? (
                <div className="bg-[#38BDF8]/10 text-white border border-[#38BDF8]/30 px-3.5 py-2.5 rounded-2xl max-w-[85%] text-xs font-body shadow-sm">
                  {m.text}
                </div>
              ) : (
                <div className="glass-panel p-4 border border-white/10 rounded-2xl max-w-[95%] space-y-3 bg-[#0D121B]">
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    {m.responseObj?.persona ? (
                      <AgentPersonaBadge persona={m.responseObj.persona} size="sm" />
                    ) : (
                      <span className="text-[10px] font-mono text-[#38BDF8]">ENERGY ADVISOR</span>
                    )}
                    {m.responseObj?.confidence !== undefined && (
                      <span className="text-[9px] font-mono text-[#33D6A6] bg-[#33D6A6]/10 px-2 py-0.5 rounded border border-[#33D6A6]/20 font-bold">
                        {Math.round(m.responseObj.confidence * 100)}% Confidence
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#EDF1F5] leading-relaxed font-body">
                    {m.text}
                  </p>

                  {/* Cited machines */}
                  {m.responseObj?.cited_machines && m.responseObj.cited_machines.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] font-mono text-[#8D97A3]">Cited Machines:</span>
                      {m.responseObj.cited_machines.map((mach, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-mono font-bold bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20 px-2 py-0.5 rounded"
                        >
                          {mach}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Evidence data points */}
                  {m.responseObj?.evidence && m.responseObj.evidence.length > 0 && (
                    <div className="p-2.5 rounded bg-white/[0.02] border border-white/5 space-y-1">
                      <span className="text-[10px] font-mono text-amber-400 block font-bold">
                        Cited Evidence Data Points:
                      </span>
                      <ul className="list-disc pl-4 text-[11px] text-[#8D97A3] space-y-0.5">
                        {m.responseObj.evidence.map((ev, i) => (
                          <li key={i}>{ev}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-[#8D97A3] font-mono p-3 glass-panel border border-white/5 rounded-xl">
              <Loader2 className="h-4 w-4 animate-spin text-[#38BDF8]" />
              <span>Querying Groq Llama 3.3 over MongoDB telemetry...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-white/10 bg-[#0D121B]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about standby waste, machine idle cost..."
              className="bg-white/5 border-white/10 text-white placeholder:text-[#8D97A3] text-xs focus-visible:ring-[#38BDF8]"
              disabled={loading}
            />
            <Button
              type="submit"
              disabled={loading || !input.trim()}
              size="sm"
              variant="glass"
              className="bg-[#38BDF8] text-[#0A0D12] hover:bg-[#38BDF8]/90 font-bold shrink-0 cursor-pointer"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
