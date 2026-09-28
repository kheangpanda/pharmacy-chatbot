import { Box, CircularProgress, Step, StepLabel, Stepper, Typography } from "@mui/material";
import { CheckCircle2 } from "lucide-react";

const steps = ["Uploading", "Extracting text", "Creating chunks", "Generating embeddings", "Indexing", "Completed"];

export default function UploadProgress({ complete = false }: { complete?: boolean }) {
  return <Box sx={{ mt: 2 }}><Typography variant="body2" fontWeight={650} sx={{ mb: 1 }}>{complete ? "Knowledge source indexed" : "Processing document…"}</Typography><Stepper activeStep={complete ? steps.length : 0} orientation="vertical" sx={{ "& .MuiStepLabel-label": { fontSize: 13 } }}>{steps.map((label, index) => <Step key={label} completed={complete}><StepLabel StepIconComponent={complete ? () => <CheckCircle2 size={19} color="#2e7d32" /> : index === 0 ? () => <CircularProgress size={18} /> : undefined}>{label}</StepLabel></Step>)}</Stepper>{!complete && <Typography variant="caption" color="text.secondary">The server reports completion as a whole, so percentages are not estimated.</Typography>}</Box>;
}

