"use client";

import { useState } from "react";
import { Box, Button, Paper, TextField } from "@mui/material";
import { Send } from "lucide-react";

export default function ChatComposer({ onSend, disabled, initialValue = "" }: { onSend: (question: string) => void; disabled: boolean; initialValue?: string }) {
  const [value, setValue] = useState(initialValue);
  const submit = () => {
    const question = value.trim();
    if (!question || disabled) return;
    onSend(question);
    setValue("");
  };
  return (
    <Box sx={{ position: "sticky", bottom: 0, py: 2, bgcolor: "rgba(245,248,249,.94)", backdropFilter: "blur(8px)" }}>
      <Paper sx={{ p: 1.5, border: 1, borderColor: "divider" }}>
        <TextField
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submit(); } }}
          placeholder="Ask a pharmacy question..."
          multiline minRows={2} maxRows={6} fullWidth variant="standard" disabled={disabled}
          InputProps={{ disableUnderline: true }}
          inputProps={{ "aria-label": "Ask a pharmacy question" }}
        />
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
          <Button onClick={submit} disabled={disabled || !value.trim()} variant="contained" endIcon={<Send size={17} />}>Send</Button>
        </Box>
      </Paper>
    </Box>
  );
}

