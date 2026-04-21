import { createBrowserRouter } from "react-router-dom";
import Intro from "./pages/Intro";
import Quote from "./pages/Quote";
import QuoteResult from "./pages/QuoteResult";
import Application from "./pages/Application";
import Documents from "./pages/Documents";
import Signature from "./pages/Signature";

export const router = createBrowserRouter([
  { path: "/", element: <Intro /> },
  { path: "/quote", element: <Quote /> },
  { path: "/quote/result", element: <QuoteResult /> },

  { path: "/apply", element: <Application /> },
  { path: "/apply/documents", element: <Documents /> },
  { path: "/apply/signature", element: <Signature /> },
]);
