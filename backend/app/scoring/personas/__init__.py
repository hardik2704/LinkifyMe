# Personas module init

from pathlib import Path
from typing import Any
import yaml

PERSONAS_DIR = Path(__file__).parent


def load_persona(name: str) -> dict[str, Any]:
    """Load a persona configuration by name."""
    persona_file = PERSONAS_DIR / f"{name}.yaml"
    if not persona_file.exists():
        raise ValueError(f"Unknown persona: {name}")
    
    with open(persona_file) as f:
        config = yaml.safe_load(f)
    
    # Use normalized weights if available, otherwise compute from raw weights
    if "weights_normalized" in config:
        config["weights"] = config["weights_normalized"]
    else:
        # Flatten nested weights (use senior values as default)
        raw_weights = config.get("weights", {})
        flat_weights = {}
        total = 0
        for key, value in raw_weights.items():
            if isinstance(value, dict):
                # Use 'senior' value if nested, otherwise first value
                flat_weights[key] = value.get("senior", list(value.values())[0])
            else:
                flat_weights[key] = value
            total += flat_weights[key]
        
        # Normalize to sum to 1.0
        if total > 0:
            config["weights"] = {k: v / total for k, v in flat_weights.items()}
    
    # Validate weights sum to ~1.0
    weights = config.get("weights", {})
    total = sum(weights.values())
    if not (0.99 <= total <= 1.01):
        # Attempt to normalize
        if total > 0:
            config["weights"] = {k: v / total for k, v in weights.items()}
    
    return config


def list_personas() -> list[str]:
    """List all available persona names."""
    return [
        f.stem for f in PERSONAS_DIR.glob("*.yaml")
        if f.stem != "__init__"
    ]


__all__ = ["load_persona", "list_personas"]
