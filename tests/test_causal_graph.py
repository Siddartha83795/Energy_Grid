import unittest
import sys
from pathlib import Path

# Add directories to path
sys.path.append(str(Path(__file__).resolve().parents[1]))
sys.path.append(str(Path(__file__).resolve().parents[1] / "analytics-engine"))

from causal_graph import generate_causal_graph

class TestCausalGraphGenerator(unittest.TestCase):
    
    def test_causal_graph_structure(self):
        graph = generate_causal_graph(
            machine_id="CNC_Mill_1",
            anomaly_category="true_idle_waste",
            timestamp_str="2026-06-06 12:00:00",
            kw_demand=12.5,
            threshold_kw=4.0
        )
        
        self.assertIn("nodes", graph)
        self.assertIn("edges", graph)
        
        # Verify node structure
        nodes = graph["nodes"]
        self.assertTrue(len(nodes) > 1)
        self.assertEqual(nodes[0]["id"], "anomaly")
        self.assertIn("Excess Power Draw", nodes[0]["label"])
        
        # Verify edge structure
        edges = graph["edges"]
        self.assertTrue(len(edges) >= 1)
        self.assertEqual(edges[0]["source"], "cause_1")
        self.assertEqual(edges[0]["target"], "anomaly")
        self.assertIn("weight", edges[0])
        
    def test_stuck_auxiliary_categories(self):
        graph = generate_causal_graph(
            machine_id="Robotic_Welder_1",
            anomaly_category="stuck_auxiliary",
            timestamp_str="2026-06-06 12:00:00",
            kw_demand=7.5,
            threshold_kw=3.0
        )
        
        node_labels = [n["label"] for n in graph["nodes"]]
        self.assertTrue(any("Auxiliary Coolant" in label for label in node_labels))

if __name__ == "__main__":
    unittest.main()
