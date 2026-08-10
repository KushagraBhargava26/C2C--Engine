import axios from "axios";
import { getMockIncidentsPage } from "../data/mockIncidents.js";
import { getMockHeatmap } from "../data/mockHeatmap.js";
import { getMockPortfolioExposure } from "../data/mockPortfolio.js";
import { getMockSentimentTimeseries, getMockSectorImpact, getMockIncidentVolume } from "../data/mockAnalytics.js";
import { getMockGraph, getMockNodeDetails } from "../data/mockGraph";
import { getMockCountryDetail } from "../data/mockCountries.js";

// --- Mode switch -----------------------------------------------------------
// Change this to false once your friend's Spring Boot endpoints are live.
// This is the ONE line the whole app depends on for the mock -> real swap.
const USE_MOCK = false;
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
});

// Attach the JWT (once logged in) to every outgoing request automatically,
// since /api/v1/** now requires auth on the backend.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("c2c_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Simulates network latency in mock mode, so loading states are actually
// visible and testable before the real backend exists.
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function normalizeError(err) {
  if (err.response?.data) {
    return err.response.data;
  }
  return {
    status: err.response?.status ?? 0,
    error: err.code === "ECONNABORTED" ? "Timeout" : "Network Error",
    message: err.message || "The backend is unreachable.",
  };
}

/**
 * GET /api/v1/incidents?page=&size=
 */
export async function getIncidents({ page = 0, size = 20 } = {}) {
  if (USE_MOCK) {
    await wait(400);
    return getMockIncidentsPage({ page, size });
  }
  try {
    const { data } = await client.get("/api/v1/incidents", { params: { page, size } });
    return data;
  } catch (err) {
    throw normalizeError(err);
  }
}

/**
 * GET /api/v1/exposure/heatmap
 */
export async function getHeatmap() {
  if (USE_MOCK) {
    await wait(500);
    return getMockHeatmap();
  }
  try {
    const { data } = await client.get("/api/v1/exposure/heatmap");
    return data;
  } catch (err) {
    throw normalizeError(err);
  }
}
/**
 * GET /api/v1/portfolio/exposure
 */
export async function getPortfolioExposure() {
  if (USE_MOCK) {
    await wait(500);
    return getMockPortfolioExposure();
  }
  try {
    const { data } = await client.get("/api/v1/portfolio/exposure");
    return data;
  } catch (err) {
    throw normalizeError(err);
  }
}
/**
 * GET /api/v1/countries/{isoCode}
 */
export async function getCountryDetail(isoCode) {
  if (USE_MOCK) {
    await wait(300);
    return getMockCountryDetail(isoCode);
  }
  try {
    const { data } = await client.get(`/api/v1/countries/${isoCode}`);
    return data;
  } catch (err) {
    throw normalizeError(err);
  }
}
/**
 * GET /api/v1/graph
 */
export async function getGraph() {
  if (USE_MOCK) {
    await wait(400);
    return getMockGraph();
  }
  try {
    const { data } = await client.get("/api/v1/graph");
    return data;
  } catch (error) {
    console.error("getGraph failed:", error);
    throw error;
  }
}

/**
 * GET /api/v1/analytics/sentiment-timeseries
 */
export async function getSentimentTimeseries() {
  if (USE_MOCK) {
    await wait(400);
    return getMockSentimentTimeseries();
  }
  try {
    const { data } = await client.get("/api/v1/analytics/sentiment-timeseries");
    return data;
  } catch (err) {
    throw normalizeError(err);
  }
}

/**
 * GET /api/v1/analytics/sector-impact
 */
export async function getSectorImpact() {
  if (USE_MOCK) {
    await wait(400);
    return getMockSectorImpact();
  }
  try {
    const { data } = await client.get("/api/v1/analytics/sector-impact");
    return data;
  } catch (err) {
    throw normalizeError(err);
  }
}

/**
 * Incident volume isn't in CONTRACT.md v2 yet — piggybacking on the same
 * analytics namespace for now. Flag this with the backend teammate before
 * the real swap.
 */
export async function getIncidentVolume() {
  if (USE_MOCK) {
    await wait(400);
    return getMockIncidentVolume();
  }
  try {
    const { data } = await client.get("/api/v1/analytics/incident-volume");
    return data;
  } catch (err) {
    throw normalizeError(err);
  }
}

export const apiConfig = { USE_MOCK, BASE_URL };

// --- Auth ---------------------------------------------------------------

/**
 * POST /api/auth/login
 * Returns { token, email, expiresIn } on success.
 * Throws the normalized backend error body on failure (e.g. { error: "Invalid email or password." }).
 */
export async function login({ email, password }) {
  try {
    const { data } = await client.post("/api/auth/login", { email, password });
    return data;
  } catch (err) {
    throw normalizeError(err);
  }
}

/**
 * POST /api/auth/register
 * Returns { token, email, expiresIn } on success.
 */
export async function register({ email, password }) {
  try {
    const { data } = await client.post("/api/auth/register", { email, password });
    return data;
  } catch (err) {
    throw normalizeError(err);
  }
}

/**
 * POST /api/auth/forgot-password
 * In test mode (no email service configured yet) the backend hands back
 * devResetLink directly instead of emailing it.
 */
export async function forgotPassword({ email }) {
  try {
    const { data } = await client.post("/api/auth/forgot-password", { email });
    return data;
  } catch (err) {
    throw normalizeError(err);
  }
}

/**
 * POST /api/auth/reset-password
 */
export async function resetPassword({ token, newPassword }) {
  try {
    const { data } = await client.post("/api/auth/reset-password", { token, newPassword });
    return data;
  } catch (err) {
    throw normalizeError(err);
  }
}

/**
 * POST /api/auth/google
 * idToken is the credential Google's Sign-In button hands back client-side.
 */
export async function googleAuth({ idToken }) {
  try {
    const { data } = await client.post("/api/auth/google", { idToken });
    return data;
  } catch (err) {
    throw normalizeError(err);
  }
}
