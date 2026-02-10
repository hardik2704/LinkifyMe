"""
Licenses & Certifications Scorer

Evaluates: count and recency.
"""

from app.scoring.sections.base_sections import BaseSectionScorer


class LicensesCertsScorer(BaseSectionScorer):
    """Score Licenses & Certifications (1-10)."""
    
    key = "licenses_certs"
    display_name = "Licenses & Certifications Score"
    
    def score(self, profile: dict) -> dict:
        certs = profile.get("certifications", []) or profile.get("licenses", []) or []
        reasons = []
        signals = {}
        
        if not certs:
            return self._result(1.0, ["No certifications listed"], signals)
        
        score = 1.0
        cert_count = len(certs)
        signals["certification_count"] = cert_count
        
        # Count scoring
        if cert_count >= 5:
            score += 5.0
            reasons.append(f"Many certifications ({cert_count})")
        elif cert_count >= 3:
            score += 4.0
            reasons.append(f"Good certifications ({cert_count})")
        elif cert_count >= 2:
            score += 3.0
            reasons.append(f"Some certifications ({cert_count})")
        elif cert_count >= 1:
            score += 2.0
            reasons.append("Has certification")
        
        # Check for issuing organizations (adds credibility)
        has_issuer = 0
        for cert in certs:
            if isinstance(cert, dict) and cert.get("authority"):
                has_issuer += 1
        
        signals["certs_with_issuer"] = has_issuer
        if has_issuer >= 2:
            score += 2.5
            reasons.append("Certifications from recognized issuers")
        elif has_issuer >= 1:
            score += 1.5
            reasons.append("Certification from recognized issuer")
        
        return self._result(score, reasons, signals)
