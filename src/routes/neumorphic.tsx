import { createFileRoute } from "@tanstack/react-router";
import { NeumorphicDashboard } from "@/components/NeumorphicDashboard";

export const Route = createFileRoute("/neumorphic")({
  head: () => ({
    meta: [
      { title: "Neumorphic Soft UI Dashboard — Energy Advisor" },
      {
        name: "description",
        content:
          "Neumorphic Soft UI control console with dual-shadow extrusion, molded substrate surfaces, and tactile switches.",
      },
    ],
  }),
  component: NeumorphicDashboard,
});
