import { useCallback, useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";

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

type HistoryResponse = {
  count: number;
  results: Array<{
    id: number;
    value: number;
    createdAt: string;
  }>;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

function App() {
  const [responses, setResponses] = useState<Record<string, ApiResult>>({});
  const [historyLimit, setHistoryLimit] = useState(10);

  const endpoints = useMemo<Endpoint[]>(
    () => [
      { label: "Health", path: "/health", description: "Simple heartbeat check" },
      { label: "Test", path: "/test", description: "Returns a random number" },
      { label: "Info", path: "/info", description: "Static metadata payload" },
      { label: "History", path: "/history", description: "View recently persisted random numbers" },
    ],
    []
  );

  const callEndpoint = useCallback(async (endpoint: Endpoint) => {
    setResponses((prev) => ({
      ...prev,
      [endpoint.path]: { status: "loading" },
    }));

    try {
      const isHistory = endpoint.path === "/history";
      const limit = historyLimit || 1;
      const url = isHistory
        ? `${API_BASE_URL}${endpoint.path}?limit=${limit}`
        : `${API_BASE_URL}${endpoint.path}`;
      const response = await fetch(url);

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
  }, [API_BASE_URL, historyLimit]);

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
            const isHistory = endpoint.path === "/history";

            if (isHistory) {
              return (
                <Card key={endpoint.path} variant="outlined">
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "stretch", sm: "center" }}>
                        <Button
                          variant="contained"
                          onClick={() => callEndpoint(endpoint)}
                          disabled={result.status === "loading"}
                        >
                          {result.status === "loading" ? "Fetching..." : endpoint.label}
                        </Button>
                        <Chip label={endpoint.path} variant="outlined" size="small" />
                        <TextField
                          type="number"
                          label="Limit (1-50)"
                          value={historyLimit}
                          onChange={(event) => {
                            setHistoryLimit(Number(event.target.value) || 1);
                          }}
                          inputProps={{ min: 1, max: 50 }}
                          sx={{ width: { xs: "100%", sm: 150 } }}
                        />
                      </Stack>

                      <Typography variant="body2" color="text.secondary">
                        {endpoint.description}
                      </Typography>

                      {result.status === "idle" && (
                        <Alert severity="info" variant="outlined">
                          No history loaded yet.
                        </Alert>
                      )}

                      {result.status === "loading" && <Alert severity="info">Retrieving saved values...</Alert>}

                      {result.status === "error" && <Alert severity="error">{result.error}</Alert>}

                      {result.status === "success" && (
                        <Stack spacing={1}>
                          <Chip
                            label={`${(result.payload as HistoryResponse).count} records returned`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <List dense disablePadding sx={{ maxHeight: 320, overflow: "auto" }}>
                            {(result.payload as HistoryResponse).results.map((entry) => (
                              <ListItem key={entry.id} divider>
                                <ListItemText
                                  primary={`Value: ${entry.value}`}
                                  secondary={`Saved ${new Date(entry.createdAt).toLocaleString()}`}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Stack>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              );
            }

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
