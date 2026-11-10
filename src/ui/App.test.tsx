import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { App } from "./App";

// Placeholder (M0): server-renders the shell so no DOM library is needed yet.
describe("ui/App", () => {
  it("[placeholder] renders the app title", () => {
    expect(renderToStaticMarkup(<App />)).toContain("Radium Math");
  });
});
