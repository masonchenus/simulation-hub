import React, { useMemo, useState } from "react";
import { Accordion } from "./accordion";
import { Alert } from "./alert";
import { Button, LinkButton } from "./button";
import { Carousel } from "./carousel";
import { Form } from "./form";
import { Image } from "./image";
import { Input } from "./input";
import { Loader } from "./loader";
import { Menu } from "./menu";
import { Modal } from "./modal";
import { Navbar } from "./navbar";
import { Pagination } from "./pagination";
import { Search } from "./search";
import { Sidebar } from "./sidebar";
import { Table } from "./table";
import { useToast } from "./toast";
import { LegacyComponentsShowcase } from "../legacy-components-showcase";

const demoSvg =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='360'%3E%3Cdefs%3E%3CradialGradient id='g' cx='35%25' cy='30%25' r='70%25'%3E%3Cstop offset='0' stop-color='%2360a5fa' stop-opacity='0.85'/%3E%3Cstop offset='0.55' stop-color='%2322d3ee' stop-opacity='0.45'/%3E%3Cstop offset='1' stop-color='%23ffffff' stop-opacity='0'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='%23ffffff'/%3E%3Crect width='100%25' height='100%25' fill='url(%23g)'/%3E%3C/svg%3E";

export function ComponentShowcase() {
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  const tableRows = useMemo(
    () => [
      ["Critical", "🛡️", "Personal safety / reset"],
      ["Simulation", "🌀", "Systems + dynamics"],
      ["Creative", "🎨", "Mood + texture"],
    ],
    [],
  );

  return (
    <section style={{ marginTop: 30 }}>
      <Accordion title="Component Lab (reusable-components)" defaultOpen={false}>
        <div style={{ display: "grid", gap: 18 }}>
          <Alert html="<strong>Heads up:</strong> This section is just to preview the reusable TSX components." />

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <Button variant="primary" onClick={() => toast.push("Primary button clicked")}>
              Primary Button
            </Button>
            <Button variant="ghost" onClick={() => toast.push("Ghost button clicked")}>
              Ghost Button
            </Button>
            <LinkButton variant="primary" href="info/read-more.html?id=fractal">
              Link Button
            </LinkButton>
          </div>

          <Navbar
            brand={<div className="eyebrow">Navbar component</div>}
          >
            <LinkButton variant="ghost" href="info/read-more.html?id=fractal">
              Docs
            </LinkButton>
            <Button variant="ghost" onClick={() => toast.push("Navbar action")}>
              Action
            </Button>
          </Navbar>

          <Form
            onSubmit={(e) => {
              e.preventDefault();
              toast.push(`Submitted: "${query || "…" }"`);
            }}
            style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}
          >
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Input component…" />
            <Search value={query} onChange={setQuery} />
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Form>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <Menu
              label="Menu"
              items={[
                { label: "Toast A", onSelect: () => toast.push("Menu: A") },
                { label: "Toast B", onSelect: () => toast.push("Menu: B") },
                { label: "Toast C", onSelect: () => toast.push("Menu: C") },
              ]}
            />
            <Pagination page={page} pageCount={5} onPageChange={setPage} />
            <Loader label="Loader component…" />
            <Button variant="ghost" onClick={() => setDemoModalOpen(true)}>
              Open Modal
            </Button>
          </div>

          <Modal open={demoModalOpen} onClose={() => setDemoModalOpen(false)} ariaLabel="Demo modal">
            <div className="preview-card">
              <h3>Modal component</h3>
              <p style={{ color: "var(--muted)" }}>Click outside or press Esc to close.</p>
              <div className="preview-actions">
                <Button variant="ghost" onClick={() => setDemoModalOpen(false)}>
                  Close
                </Button>
                <Button variant="primary" onClick={() => toast.push("Modal action")}>
                  Action
                </Button>
              </div>
            </div>
          </Modal>

          <Sidebar title="Sidebar component">
            <div style={{ color: "var(--muted)" }}>This is a lightweight aside container.</div>
          </Sidebar>

          <Table headers={["Type", "Icon", "Notes"]} rows={tableRows} />

          <Carousel>
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                style={{
                  minWidth: 240,
                  scrollSnapAlign: "start",
                  borderRadius: 18,
                  border: "1px solid var(--ring)",
                  background: "var(--glass-strong)",
                  padding: 14,
                  boxShadow: "0 24px 50px -42px rgba(18,16,12,0.35)",
                }}
              >
                <div className="eyebrow">Card {i + 1}</div>
                <div style={{ fontWeight: 700, marginTop: 6 }}>Carousel item</div>
                <div style={{ color: "var(--muted)", marginTop: 6, lineHeight: 1.4 }}>Swipe/scroll horizontally.</div>
              </div>
            ))}
          </Carousel>

          <div style={{ display: "grid", gap: 10 }}>
            <div className="eyebrow">Image component</div>
            <Image
              alt="Demo gradient"
              src={demoSvg}
              style={{
                width: "min(520px, 100%)",
                borderRadius: 18,
                border: "1px solid var(--ring)",
                boxShadow: "0 26px 60px -50px rgba(18,16,12,0.45)",
              }}
            />
          </div>

          <LegacyComponentsShowcase />
        </div>
      </Accordion>
    </section>
  );
}
