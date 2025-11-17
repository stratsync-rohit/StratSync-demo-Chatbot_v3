import React, { useState, useRef, useEffect } from "react";
import Header from "./Header";
import MessageBubble from "./MessageBubble";
import InputBar from "./InputBar";
import TypingIndicator from "./TypingIndicator";

const BASE_URL = "https://dev-api.stratsync.ai";

interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
 
  table?: Array<Record<string, any>>;
  originalRequestPayload?: any;
  canSummarize?: boolean;
  wasSummarized?: boolean;
  isError?: boolean;
}

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [summarizingId, setSummarizingId] = useState<string | null>(null);

  const [summaryHtml, setSummaryHtml] = useState<string | null>(null);
  const [summaryBlobUrl, setSummaryBlobUrl] = useState<string | null>(null);
  const [summaryForId, setSummaryForId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const hasUserMessages = messages.some((msg) => msg.sender === "user");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    console.log("Rohit Query:", content);
    try {
      const response = await fetch(`${BASE_URL}/process_user_query/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: content }),
      });

      console.log("Rohit test", response.status);
      console.log("Rohit Response:", response.json);

      if (!response.ok) {
        
        const errText = await response.text();
        console.error("Server error response:", errText);
        throw new Error(`HTTP ${response.status}: ${errText}`);
      }

      const contentType = response.headers.get("content-type");
  let data: any;

      if (contentType?.includes("application/json")) {
        const jsonData = await response.json();

      
        if (
          jsonData &&
          (jsonData.msg === "Success" || jsonData.data) &&
          typeof jsonData.data === "string"
        ) {
          try {
            const parsed = JSON.parse(jsonData.data);
            if (Array.isArray(parsed)) {
             
              const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: "",
                sender: "assistant",
                timestamp: new Date(),
                table: parsed,
                originalRequestPayload: { query: content, response: parsed, raw: jsonData },
                canSummarize: Array.isArray(parsed) ? parsed.length > 0 : false,
              };

              setMessages((prev) => [...prev, assistantMessage]);
              setIsTyping(false);
              return;
            }
          } catch (e) {
          
            data = JSON.stringify(jsonData);
          }
        }

       
        data = jsonData.reply || jsonData.data || JSON.stringify(jsonData);
       
        let canSummarizeFlag = true;
        if (typeof data === "string") {
          canSummarizeFlag = data.trim() !== "";
          
          try {
            const normalized = data.replace(/<[^>]*>/g, "").replace(/\u2019/g, "'").toLowerCase();
            if (
              normalized.includes("sorry") &&
              normalized.includes("couldn") &&
              normalized.includes("matching data")
            ) {
              canSummarizeFlag = false;
            }
          } catch (e) {
            /* ignore */
          }
        } else if (Array.isArray(data)) {
          canSummarizeFlag = data.length > 0;
        } else if (typeof data === "object") {
          try {
            canSummarizeFlag = Object.keys(data).length > 0;
          } catch (e) {
            canSummarizeFlag = !!data;
          }
        } else {
          canSummarizeFlag = !!data;
        }
        // For debugging/consistency, keep the full json in originalRequestPayload
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: typeof data === "string" ? data : JSON.stringify(data),
          sender: "assistant",
          timestamp: new Date(),
          originalRequestPayload: { query: content, response: data, raw: jsonData },
          canSummarize: canSummarizeFlag,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // non-json response
        data = await response.text();

        // check for known 'no data' message and treat it as non-summarizable
        let nonJsonCanSummarize = typeof data === "string" ? data.trim() !== "" : !!data;
        try {
          const normalized = data.replace(/<[^>]*>/g, "").replace(/\u2019/g, "'").toLowerCase();
          if (
            normalized.includes("sorry") &&
            normalized.includes("couldn") &&
            normalized.includes("matching data")
          ) {
            nonJsonCanSummarize = false;
          }
        } catch (e) {
          /* ignore */
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data,
          sender: "assistant",
          timestamp: new Date(),
          originalRequestPayload: { query: content, response: data },
          canSummarize: nonJsonCanSummarize,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          content: `Error: ${error.message || "Please try again."}`,
          sender: "assistant",
          timestamp: new Date(),
         
          canSummarize: false,
          isError: true,
          },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSummarize = async (message: Message) => {
  
    if (message.isError) {
      console.warn("Attempt to summarize an error message prevented.");
      return;
    }

    try {
      setSummarizingId(message.id);

      const orig = message.originalRequestPayload;

      const queryStr = orig && typeof orig.query === "string" ? orig.query : message.content || "";

     
      let dataToSend: any;
      if (orig && orig.response !== undefined) {
        dataToSend = orig.response;
      } else if (message.table && Array.isArray(message.table) && message.table.length > 0) {
        dataToSend = message.table;
      } else if (message.content && message.content.trim() !== "") {
        dataToSend = message.content;
      } else {
        dataToSend = queryStr;
      }

      const payload: any = {
        query: queryStr,
   
        data: typeof dataToSend === "string" ? dataToSend : JSON.stringify(dataToSend),
      };
     console.log("Rohit generate_summary payload:", payload);
     
      const resp = await fetch(`${BASE_URL}/generate_summary/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

     
     
      const bodyText = await resp.text();
      // console.log("Rohit generate_summary raw response:", bodyText);

      if (!resp.ok) {
        console.error("generate_summary server error:", bodyText);
        throw new Error(`HTTP ${resp.status}: ${bodyText}`);
      }

    
      let html = bodyText;
      try {
        const maybeJson = JSON.parse(bodyText);
        if (maybeJson && typeof maybeJson === "object") {
          if (typeof maybeJson.data === "string" && maybeJson.data.trim() !== "") {
            html = maybeJson.data;
            console.log("Rohit generate_summary response data (from json.data):", maybeJson.data);
          } else if (typeof maybeJson.msg === "string") {
            console.log("Rohit generate_summary response msg:", maybeJson.msg);
          }
        }
      } catch (e) {
       
      }

      
      
      try {
        html = html.replace(/^```(?:html)?\s*/i, "");

        html = html.replace(/\s*```\s*$/i, "");
      } catch (e) {
        /* ignore */
      }

      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);

      if (summaryBlobUrl) {
        try {
          URL.revokeObjectURL(summaryBlobUrl);
        } catch (e) {
          /* ignore */
        }
      }
      setSummaryBlobUrl(url);
      setSummaryHtml(html);

      setSummaryForId(message.id);

     
      setMessages((prev) =>
        prev.map((m) => (m.id === message.id ? { ...m, wasSummarized: true } : m))
      );
    } catch (err: any) {
      console.error("Error generating summary:", err);
      alert(`Failed to generate summary: ${err?.message || err}`);
    } finally {
      setSummarizingId(null);
    }
  };

  const handleDownloadCsv = (message: Message) => {
    try {
      const orig = message.originalRequestPayload;
      let rows: Array<Record<string, any>> | null = null;

      if (message.table && Array.isArray(message.table) && message.table.length > 0) {
        rows = message.table;
      } else if (orig && Array.isArray(orig.response) && orig.response.length > 0) {
        rows = orig.response;
      }

      if (!rows || !Array.isArray(rows) || rows.length === 0) {
        alert("No table data available to download as CSV.");
        return;
      }

      const colSet = new Set<string>();
      rows.forEach((r) => Object.keys(r || {}).forEach((k) => colSet.add(k)));
      const columns = Array.from(colSet);

      const escapeField = (val: any) => {
        if (val === null || val === undefined) return "";
        const s = typeof val === "object" ? JSON.stringify(val) : String(val);
        return '"' + s.replace(/"/g, '""') + '"';
      };

      const lines: string[] = [];
      lines.push(columns.join(","));
      rows.forEach((row) => {
        const vals = columns.map((c) => escapeField(row[c]));
        lines.push(vals.join(","));
      });

      const csv = lines.join("\r\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `stratsync_table_${message.id}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {
          /* ignore */
        }
      }, 2000);
    } catch (err) {
      console.error("Error downloading CSV:", err);
      alert("Failed to download CSV.");
    }
  };

  const handleDownloadPdf = (html?: string) => {
    try {
      const content = html || summaryHtml || "";
      if (!content) {
        alert("No HTML summary available to print/save as PDF.");
        return;
      }

      const w = window.open("", "_blank");
      if (!w) {
        alert("Unable to open new window. Please allow popups for this site.");
        return;
      }

      // Write the HTML into the new window and attempt to trigger print
      w.document.open();
      w.document.write(content);
      w.document.close();
      w.focus();

      // Try to print when loaded; fallback to a short timeout
      const tryPrint = () => {
        try {
          w.print();
        } catch (e) {
          console.error("Print failed:", e);
          alert("Printing failed. You can manually save the opened page as PDF.");
        }
      };

      if (w.document.readyState === "complete") {
        tryPrint();
      } else {
        w.onload = tryPrint;
        // fallback in case onload doesn't fire
        setTimeout(() => {
          tryPrint();
        }, 700);
      }
    } catch (err) {
      console.error("Error preparing PDF download:", err);
      alert("Failed to prepare PDF. Check console for details.");
    }
  };

  const handleShareSummary = async (html?: string, messageId?: string) => {
    // Generate a PDF from the rendered HTML and share it (or download as fallback).
    let container: HTMLDivElement | null = null;
    try {
      const content = html || summaryHtml || "";
      if (!content) {
        alert("No summary available to share.");
        return;
      }

      // Render content in hidden container for rasterizing
      container = document.createElement("div");
      container.style.position = "fixed";
      container.style.left = "-9999px";
      container.style.top = "0";
      container.style.width = "900px";
      container.style.padding = "16px";
      container.innerHTML = content;
      document.body.appendChild(container);

      // Dynamically import html2canvas and jsPDF
      // @ts-ignore
      const html2canvas = (await import("html2canvas")).default;
      // @ts-ignore
      const { jsPDF } = await import("jspdf");

      // Use jsPDF.html to try to keep text selectable and preserve layout
      const { jsPDF: _jsPDF } = await import("jspdf");
      const pdf = new _jsPDF({ unit: "pt", format: "a4" });

      await new Promise<void>((resolve, reject) => {
        // @ts-ignore
        pdf.html(container, {
          x: 0,
          y: 0,
          html2canvas: { scale: 2, useCORS: true },
          callback: (doc: any) => {
            try {
              const blob = doc.output("blob");
              const file = new File([blob], `stratsync_summary_${messageId || Date.now()}.pdf`, { type: "application/pdf" });

              const nav: any = navigator;
              if (nav.canShare && nav.canShare({ files: [file] }) && nav.share) {
                nav.share({ files: [file], title: "StratSync Summary", text: "Summary from StratSync" })
                  .then(() => resolve())
                  .catch((e: any) => {
                    console.warn("Web Share (files) failed, falling back:", e);
                    // fallback to download
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `stratsync_summary_${messageId || Date.now()}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    setTimeout(() => {
                      try {
                        URL.revokeObjectURL(url);
                      } catch (er) {
                        /* ignore */
                      }
                      resolve();
                    }, 2000);
                  });
              } else {
                // fallback to download
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `stratsync_summary_${messageId || Date.now()}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                setTimeout(() => {
                  try {
                    URL.revokeObjectURL(url);
                  } catch (er) {
                    /* ignore */
                  }
                  resolve();
                }, 2000);
              }
            } catch (err) {
              reject(err);
            }
          },
        });
      });
    } catch (err) {
      console.error("Share failed:", err);
      alert("Failed to generate/share PDF summary. Check console for details.");
    } finally {
      if (container && container.parentNode) container.parentNode.removeChild(container);
    }
  };

  if (!hasUserMessages) {
    return (
      <div className="flex flex-col h-screen max-w-full mx-auto bg-white shadow-lg">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div className="text-center mb-12 max-w-3xl">
            <img
              src="/images/logo.jpeg"
              alt="StratSync Logo"
              className="h-16 w-auto mx-auto mb-4"
            />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to StratSync
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              Your AI co-pilot for customer success and growth. Ask me anything
              to get started!
            </p>
          </div>
          <div className="w-full max-w-3xl">
            <InputBar
              onSendMessage={handleSendMessage}
              isDisabled={isTyping}
              isCentered
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-full mx-auto bg-white shadow-lg">
      <Header />
     
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {messages.map((message) => (
            <div key={message.id}>
              <MessageBubble
                message={message}
                onSummarize={() => handleSummarize(message)}
                onDownloadCsv={() => handleDownloadCsv(message)}
                isSummarizing={summarizingId === message.id}
              />

              {summaryForId === message.id && summaryHtml && !message.isError && (
                <>
                  <div className="mt-2 p-1 bg-white border rounded">
                    <iframe
                      title={`summary-${message.id}`}
                      srcDoc={summaryHtml}
                      className="w-full h-[80vh] border-0"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <button
                      onClick={() => handleShareSummary(summaryHtml || undefined, message.id)}
                      className="text-xs px-3 py-1 rounded-full border bg-white text-black border-gray-300 hover:bg-gray-50"
                    >
                      Share
                    </button>
                    <button
                      onClick={() => handleDownloadPdf(summaryHtml || undefined)}
                      className="text-xs px-3 py-1 rounded-full border bg-white text-black border-gray-300 hover:bg-gray-50"
                    >
                      Download PDF
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <InputBar onSendMessage={handleSendMessage} isDisabled={isTyping} />
    </div>
  );
};

export default ChatWindow;
