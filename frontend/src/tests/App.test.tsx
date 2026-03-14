import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../App";

test("renders Add Candidate link", () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
  const links = screen.getAllByRole("link", { name: /add candidate/i });
  expect(links.length).toBeGreaterThanOrEqual(1);
  expect(links[0]).toBeInTheDocument();
});
