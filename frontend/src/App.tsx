import { useCallback, useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

type Endpoint = {
  label: string;
  path: string;
  description: string;
};

type ApiResult = {
  status: "idle" | "loading" | "success" | "error";
  payload?: unknown;
  error?: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

function App() {
  const [responses, setResponses] = useState<Record<string, ApiResult>>({});

  const endpoints = useMemo<Endpoint[]>(
    () => [
      { label: "Health", path: "/health", description: "Simple heartbeat check" },
      { label: "Test", path: "/test", description: "Returns a random number" },
      { label: "Info", path: "/info", description: "Static metadata payload" },
    ],
    []
  );

  const callEndpoint = useCallback(async (endpoint: Endpoint) => {
    setResponses((prev) => ({
      ...prev,
      [endpoint.path]: { status: "loading" },
    }));

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint.path}`);

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const body = await response.json();
      setResponses((prev) => ({
        ...prev,
        [endpoint.path]: { status: "success", payload: body },
      }));
    } catch (error) {
      setResponses((prev) => ({
        ...prev,
        [endpoint.path]: {
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        },
      }));
    }
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom>
            Service Pulseboard
          </Typography>
          <Typography color="text.secondary">
            Fire the backend endpoints with a single click. Results appear below each
            button, making this a handy smoke-test dashboard.
          </Typography>
        </Box>

        <Divider />

        <Stack spacing={2}>
          {endpoints.map((endpoint) => {
            const result = responses[endpoint.path] ?? { status: "idle" };

            return (
              <Card key={endpoint.path} variant="outlined">
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Button
                        variant="contained"
                        onClick={() => callEndpoint(endpoint)}
                        disabled={result.status === "loading"}
                      >
                        {result.status === "loading" ? "Calling..." : endpoint.label}
                      </Button>
                      <Chip label={endpoint.path} variant="outlined" size="small" />
                    </Stack>

                    <Typography variant="body2" color="text.secondary">
                      {endpoint.description}
                    </Typography>

                    {result.status === "idle" && (
                      <Alert severity="info" variant="outlined">
                        No call yet. Press the button to fetch a response.
                      </Alert>
                    )}

                    {result.status === "loading" && (
                      <Alert severity="info">Waiting for response...</Alert>
                    )}

                    {result.status === "success" && (
                      <Alert severity="success" sx={{ fontFamily: "monospace" }}>
                        {JSON.stringify(result.payload, null, 2)}
                      </Alert>
                    )}

                    {result.status === "error" && (
                      <Alert severity="error">{result.error}</Alert>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      </Stack>
    </Container>
  );
}

export default App;
