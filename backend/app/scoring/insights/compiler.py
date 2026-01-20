"""
HR Insights Compiler

Compiles HR interview markdown files into scoring rules.
Each markdown file follows a template format and is parsed
to extract rules that can modify scores.

Usage:
    python -m app.scoring.insights.compiler
"""

import re
from pathlib import Path
from typing import Any
import yaml


INSIGHTS_DIR = Path(__file__).parent / "hr"
OUTPUT_FILE = Path(__file__).parent.parent / "rules" / "hr_insights_compiled.yaml"


def parse_insight_markdown(filepath: Path) -> dict[str, Any] | None:
    """
    Parse an HR insight markdown file.
    
    Expected format:
    ```
    # insights/hr/YYYY-MM-DD__description.md
    
    ## Persona
    big_company_recruiter
    
    ## What they cared about
    - item 1
    - item 2
    
    ## Add-on scoring ideas
    - If X, add +0.3 to Y
    
    ## Red flags
    - X => -0.3 Z
    ```
    """
    try:
        content = filepath.read_text()
    except Exception:
        return None
    
    result = {
        "source": filepath.name,
        "persona": None,
        "rules": [],
    }
    
    # Extract persona
    persona_match = re.search(r"##\s*Persona\s*\n([^\n#]+)", content)
    if persona_match:
        result["persona"] = persona_match.group(1).strip().lower().replace(" ", "_")
    
    # Extract add-on rules
    addon_section = re.search(r"##\s*Add-on scoring ideas?\s*\n(.*?)(?=##|$)", content, re.DOTALL)
    if addon_section:
        lines = addon_section.group(1).strip().split("\n")
        for line in lines:
            rule = _parse_rule_line(line, "addon")
            if rule:
                result["rules"].append(rule)
    
    # Extract red flags
    redflag_section = re.search(r"##\s*Red flags?\s*\n(.*?)(?=##|$)", content, re.DOTALL)
    if redflag_section:
        lines = redflag_section.group(1).strip().split("\n")
        for line in lines:
            rule = _parse_rule_line(line, "redflag")
            if rule:
                result["rules"].append(rule)
    
    return result if result["rules"] else None


def _parse_rule_line(line: str, rule_type: str) -> dict | None:
    """
    Parse a single rule line.
    
    Patterns:
    - "If X, add +0.3 to Section"
    - "X => -0.3 Section"
    - "If contains 'keyword', +0.2 headline"
    """
    line = line.strip()
    if not line or line.startswith("#"):
        return None
    
    # Remove list markers
    line = re.sub(r"^[-*•]\s*", "", line)
    
    # Pattern: "If X, add +/-N to Section"
    match = re.search(
        r"[Ii]f\s+(.+?),?\s+add\s+([+-]?\d+\.?\d*)\s+to\s+(\w+)", 
        line
    )
    if match:
        condition_text = match.group(1).strip()
        delta = float(match.group(2))
        section = match.group(3).lower()
        
        return {
            "id": f"hr_{rule_type}_{hash(line) % 10000}",
            "section": section,
            "when": {"any_regex": [_text_to_regex(condition_text)]},
            "effect": {"delta": delta},
            "reason": f"HR insight: {condition_text[:50]}",
        }
    
    # Pattern: "X => +/-N Section"
    match = re.search(r"(.+?)\s*=>\s*([+-]?\d+\.?\d*)\s+(\w+)", line)
    if match:
        condition_text = match.group(1).strip()
        delta = float(match.group(2))
        section = match.group(3).lower()
        
        return {
            "id": f"hr_{rule_type}_{hash(line) % 10000}",
            "section": section,
            "when": {"any_regex": [_text_to_regex(condition_text)]},
            "effect": {"delta": delta},
            "reason": f"HR insight: {condition_text[:50]}",
        }
    
    return None


def _text_to_regex(text: str) -> str:
    """Convert description text to a regex pattern."""
    # Extract quoted strings if any
    quoted = re.findall(r"['\"]([^'\"]+)['\"]", text)
    if quoted:
        # Use the quoted string as the pattern
        return re.escape(quoted[0])
    
    # Extract key terms
    keywords = ["metrics", "quantified", "impact", "experience", "about", "headline"]
    for kw in keywords:
        if kw in text.lower():
            return rf"\b{kw}\b"
    
    # Fallback: use first significant word
    words = [w for w in text.split() if len(w) > 4]
    if words:
        return rf"\b{re.escape(words[0])}\b"
    
    return text


def compile_all_insights() -> dict[str, Any]:
    """Compile all HR insight files into a rules config."""
    result = {
        "version": 1,
        "compiled_from": [],
        "rules": [],
    }
    
    if not INSIGHTS_DIR.exists():
        return result
    
    for md_file in sorted(INSIGHTS_DIR.glob("*.md")):
        parsed = parse_insight_markdown(md_file)
        if parsed:
            result["compiled_from"].append(md_file.name)
            result["rules"].extend(parsed["rules"])
    
    return result


def main():
    """Compile and save HR insights."""
    print(f"🔍 Scanning: {INSIGHTS_DIR}")
    
    compiled = compile_all_insights()
    
    print(f"📝 Found {len(compiled['compiled_from'])} insight files")
    print(f"📋 Generated {len(compiled['rules'])} rules")
    
    # Write output
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, 'w') as f:
        f.write("# HR Insights Compiled - Auto-generated\n")
        f.write("# DO NOT EDIT MANUALLY\n\n")
        yaml.dump(compiled, f, default_flow_style=False, sort_keys=False)
    
    print(f"✅ Saved to: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
