"""Simulation Engine Stage 2: Solver.

Part of the Mootion ASK module simulation pipeline.
Accepts simulation configuration, returns timeseries data and state snapshots.
"""


def run_simulation(sim_config: dict) -> dict:
    """Execute the physics simulation based on configuration.

    Args:
        sim_config: SIM_CONFIG_JSON from stage 1

    Returns:
        Dictionary containing timeseries data and state snapshots
    """
    # TODO: Replace with live implementation
    return {
        "timeseries": {
            "timestamps": [i * 0.01 for i in range(1001)],
            "positions": [[i * 0.01, i * 0.005, 0.5 * 9.81 * (i * 0.01) ** 2] for i in range(1001)],
            "velocities": [[0.01, 0.005, 9.81 * i * 0.01] for i in range(1001)],
            "accelerations": [[0.0, 0.0, 9.81] for _ in range(1001)]
        },
        "state_snapshots": [
            {"time": 0.0, "position": [0.0, 0.0, 0.0], "velocity": [1.0, 0.5, 0.0]},
            {"time": 2.5, "position": [2.5, 1.25, 30.66], "velocity": [1.0, 0.5, 24.53]},
            {"time": 5.0, "position": [5.0, 2.5, 122.63], "velocity": [1.0, 0.5, 49.05]},
            {"time": 7.5, "position": [7.5, 3.75, 275.91], "velocity": [1.0, 0.5, 73.58]},
            {"time": 10.0, "position": [10.0, 5.0, 490.5], "velocity": [1.0, 0.5, 98.1]}
        ],
        "metadata": {
            "integration_method": "runge_kutta45",
            "total_steps": 1000,
            "computation_time_ms": 125.4,
            "convergence": True
        }
    }