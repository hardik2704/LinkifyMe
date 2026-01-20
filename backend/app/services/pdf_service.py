"""
PDF Service - Standalone Report Generation

Generates PDF reports from scoring data.
This is a STANDALONE service - NOT part of the LangGraph agent workflow.
Called only when user clicks "Export Report".

Supports two backends:
1. PDFShift API (if PDFSHIFT_API_KEY is configured)
2. WeasyPrint (pure Python fallback, no external API)
"""

import base64
from datetime import datetime
from pathlib import Path
from typing import Any, Optional
import httpx

from app.config import settings


class PDFService:
    """
    Standalone PDF generation service.
    
    NOT part of the agentic workflow - called on-demand only.
    """
    
    def __init__(self):
        self._pdfshift_api_key = getattr(settings, 'pdfshift_api_key', None)
        self._pdfshift_base_url = "https://api.pdfshift.io/v3"
    
    def generate_report_html(
        self,
        scores: dict[str, Any],
        profile: dict[str, Any],
        customer_id: str,
    ) -> str:
        """
        Generate styled HTML report from scoring data.
        
        Args:
            scores: Pre-scores or AI scores dict
            profile: Profile information dict
            customer_id: Customer ID for the report
            
        Returns:
            Complete HTML string ready for PDF conversion
        """
        # Extract data
        first_name = profile.get("firstName", "") or profile.get("first_name", "") or "User"
        
        # Handle both pre-score format and legacy AI score format
        final_score = scores.get("Final Score", scores.get("Cumulative Sum of Score (out of 100)", 0))
        
        # Section scores (1-10 scale from new system)
        section_scores = {
            "headline": scores.get("Headline Score", 5),
            "connections": scores.get("Connection Score", 5),
            "followers": scores.get("Follower Score", 5),
            "about": scores.get("About Score", 5),
            "profile_pic": scores.get("Profile Pic Score", 5),
            "cover_picture": scores.get("Cover_picture Score", 5),
            "experience": scores.get("Experience Score", 5),
            "education": scores.get("Education Score", 5),
            "skills": scores.get("Skills Score", 5),
            "licenses_certs": scores.get("Licenses & Certifications Score", 5),
            "verified": scores.get("Is Verified Score", 5),
            "premium": scores.get("Is Premium Score", 5),
        }
        
        # Get debug info if available
        debug = scores.get("_debug", {})
        sections_detail = debug.get("sections", {})
        
        # Determine grade label
        if final_score >= 8:
            grade_label = "Excellent"
            grade_color = "#10b981"
        elif final_score >= 6:
            grade_label = "Good"
            grade_color = "#3b82f6"
        elif final_score >= 4:
            grade_label = "Needs Work"
            grade_color = "#f59e0b"
        else:
            grade_label = "Critical"
            grade_color = "#ef4444"
        
        # Build section rows
        section_rows = self._build_section_rows(section_scores, sections_detail)
        
        # Build recommendations
        recommendations = self._build_recommendations(sections_detail)
        
        html = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LinkedIn Profile Audit - {first_name}</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 40px;
            color: #1f2937;
        }}
        
        .container {{
            max-width: 850px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            overflow: hidden;
        }}
        
        .header {{
            background: linear-gradient(135deg, #0A66C2 0%, #0077B5 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }}
        
        .header h1 {{
            font-size: 28px;
            margin-bottom: 8px;
            font-weight: 700;
        }}
        
        .header .subtitle {{
            font-size: 16px;
            opacity: 0.9;
        }}
        
        .header .meta {{
            margin-top: 12px;
            font-size: 13px;
            opacity: 0.7;
        }}
        
        .score-hero {{
            text-align: center;
            padding: 40px;
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
        }}
        
        .score-circle {{
            width: 160px;
            height: 160px;
            border-radius: 50%;
            margin: 0 auto 16px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: white;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            border: 6px solid {grade_color};
        }}
        
        .score-number {{
            font-size: 52px;
            font-weight: 800;
            color: {grade_color};
            line-height: 1;
        }}
        
        .score-max {{
            font-size: 14px;
            color: #64748b;
        }}
        
        .score-label {{
            font-size: 18px;
            font-weight: 600;
            color: {grade_color};
            margin-top: 8px;
        }}
        
        .content {{
            padding: 32px 40px;
        }}
        
        h2 {{
            font-size: 20px;
            color: #0A66C2;
            margin: 32px 0 16px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e2e8f0;
        }}
        
        h2:first-child {{
            margin-top: 0;
        }}
        
        .scores-table {{
            width: 100%;
            border-collapse: collapse;
            margin: 16px 0;
        }}
        
        .scores-table th,
        .scores-table td {{
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
        }}
        
        .scores-table th {{
            background: #f8fafc;
            font-weight: 600;
            color: #334155;
            font-size: 13px;
        }}
        
        .scores-table td:nth-child(2) {{
            text-align: center;
            width: 80px;
        }}
        
        .score-badge {{
            display: inline-block;
            padding: 4px 10px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 13px;
        }}
        
        .score-good {{ background: #dcfce7; color: #166534; }}
        .score-avg {{ background: #fef3c7; color: #92400e; }}
        .score-low {{ background: #fee2e2; color: #991b1b; }}
        
        .recommendations {{
            background: #f0f9ff;
            border-left: 4px solid #0A66C2;
            padding: 20px;
            margin: 24px 0;
            border-radius: 0 8px 8px 0;
        }}
        
        .recommendations h3 {{
            font-size: 16px;
            color: #0A66C2;
            margin-bottom: 12px;
        }}
        
        .recommendations ul {{
            margin: 0;
            padding-left: 20px;
        }}
        
        .recommendations li {{
            margin: 8px 0;
            line-height: 1.5;
            color: #475569;
        }}
        
        .footer {{
            text-align: center;
            padding: 24px;
            background: #f8fafc;
            color: #64748b;
            font-size: 13px;
            border-top: 1px solid #e2e8f0;
        }}
        
        .footer a {{
            color: #0A66C2;
            text-decoration: none;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 LinkedIn Profile Audit Report</h1>
            <p class="subtitle">Personalized analysis for {first_name}</p>
            <p class="meta">Report ID: {customer_id} | Generated: {datetime.now().strftime("%B %d, %Y")}</p>
        </div>
        
        <div class="score-hero">
            <div class="score-circle">
                <span class="score-number">{final_score:.1f}</span>
                <span class="score-max">out of 10</span>
            </div>
            <div class="score-label">{grade_label} Profile</div>
        </div>
        
        <div class="content">
            <h2>📊 Section Scores</h2>
            <table class="scores-table">
                <tr>
                    <th>Section</th>
                    <th>Score</th>
                    <th>Status</th>
                </tr>
                {section_rows}
            </table>
            
            <div class="recommendations">
                <h3>🎯 Top Recommendations</h3>
                <ul>
                    {recommendations}
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <p>Generated by <a href="#">LinkifyMe</a> | Your LinkedIn Profile Optimization Partner</p>
            <p style="margin-top: 8px;">© {datetime.now().year} LinkifyMe. All rights reserved.</p>
        </div>
    </div>
</body>
</html>'''
        
        return html
    
    def _build_section_rows(
        self,
        scores: dict[str, float],
        details: dict[str, Any]
    ) -> str:
        """Build HTML table rows for section scores."""
        section_names = {
            "headline": "🎯 Headline",
            "about": "📝 About",
            "experience": "💼 Experience",
            "education": "🎓 Education",
            "skills": "🛠️ Skills",
            "licenses_certs": "🏆 Certifications",
            "connections": "🤝 Connections",
            "followers": "👥 Followers",
            "profile_pic": "📸 Profile Photo",
            "cover_picture": "🖼️ Cover Image",
            "verified": "✅ Verified",
            "premium": "💎 Premium",
        }
        
        rows = []
        for key, label in section_names.items():
            score = scores.get(key, 5)
            
            # Determine badge class
            if score >= 7:
                badge_class = "score-good"
                status = "Optimized"
            elif score >= 4:
                badge_class = "score-avg"
                status = "Needs Work"
            else:
                badge_class = "score-low"
                status = "Critical"
            
            rows.append(f'''
                <tr>
                    <td>{label}</td>
                    <td><span class="score-badge {badge_class}">{score:.1f}</span></td>
                    <td>{status}</td>
                </tr>
            ''')
        
        return "\n".join(rows)
    
    def _build_recommendations(self, sections_detail: dict[str, Any]) -> str:
        """Build recommendation list items from section details."""
        recommendations = []
        
        # Collect all reasons from sections with lower scores
        for key, detail in sections_detail.items():
            score = detail.get("after_rules", detail.get("raw", 5))
            reasons = detail.get("reasons", [])
            
            if score < 6 and reasons:
                # Get the first actionable reason
                for reason in reasons[:1]:
                    if "missing" in reason.lower() or "no " in reason.lower():
                        recommendations.append(f"<li><strong>{key.replace('_', ' ').title()}</strong>: {reason}</li>")
        
        # Default recommendations if none found
        if not recommendations:
            recommendations = [
                "<li>Add quantified achievements to your headline</li>",
                "<li>Include metrics in your experience descriptions</li>",
                "<li>Expand your skills section with relevant keywords</li>",
            ]
        
        return "\n".join(recommendations[:5])  # Max 5 recommendations
    
    async def generate_pdf_pdfshift(self, html: str, filename: str) -> bytes:
        """
        Generate PDF using PDFShift API.
        
        Returns PDF bytes.
        """
        if not self._pdfshift_api_key:
            raise ValueError("PDFShift API key not configured")
        
        auth = base64.b64encode(f"api:{self._pdfshift_api_key}".encode()).decode()
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self._pdfshift_base_url}/convert/pdf",
                headers={
                    "Authorization": f"Basic {auth}",
                    "Content-Type": "application/json",
                },
                json={
                    "source": html,
                    "filename": filename,
                    "format": "A4",
                    "margin": "20mm",
                    "sandbox": False,  # Remove watermark
                },
                timeout=60.0,
            )
            
            if not response.is_success:
                raise Exception(f"PDFShift API error: {response.status_code} - {response.text}")
            
            content_type = response.headers.get("content-type", "")
            
            if "application/json" in content_type:
                # Response is JSON with URL - download the PDF
                data = response.json()
                if "url" in data:
                    pdf_response = await client.get(data["url"])
                    return pdf_response.content
                raise Exception("PDFShift did not return a PDF")
            else:
                # Response is binary PDF
                return response.content
    
    def generate_pdf_weasyprint(self, html: str) -> bytes:
        """
        Generate PDF using WeasyPrint (pure Python, no external API).
        
        Fallback when PDFShift is not configured.
        """
        try:
            from weasyprint import HTML
            return HTML(string=html).write_pdf()
        except ImportError:
            raise ImportError(
                "WeasyPrint not installed. Install with: pip install weasyprint\n"
                "Or configure PDFSHIFT_API_KEY for cloud PDF generation."
            )
    
    async def generate_report(
        self,
        scores: dict[str, Any],
        profile: dict[str, Any],
        customer_id: str,
    ) -> tuple[bytes, str]:
        """
        Complete PDF report generation.
        
        This is the main entry point for PDF generation.
        NOT part of the agent workflow - call this directly when user clicks "Export".
        
        Args:
            scores: Pre-scores or AI scores dict
            profile: Profile information
            customer_id: Customer ID
            
        Returns:
            Tuple of (pdf_bytes, filename)
        """
        first_name = profile.get("firstName", "") or profile.get("first_name", "") or "User"
        filename = f"LinkifyMe_Report_{first_name}_{customer_id}.pdf"
        
        # Generate HTML
        html = self.generate_report_html(scores, profile, customer_id)
        
        # Generate PDF
        if self._pdfshift_api_key:
            pdf_bytes = await self.generate_pdf_pdfshift(html, filename)
        else:
            # Fallback to WeasyPrint
            pdf_bytes = self.generate_pdf_weasyprint(html)
        
        return pdf_bytes, filename


# Singleton instance
_pdf_service: Optional[PDFService] = None


def get_pdf_service() -> PDFService:
    """Get the singleton PDFService instance."""
    global _pdf_service
    if _pdf_service is None:
        _pdf_service = PDFService()
    return _pdf_service
