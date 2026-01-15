"""
OpenAI Scoring Service

Handles AI-powered profile scoring using GPT-4.
"""

import json
from typing import Any, Optional

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

from app.config import settings


SCORING_SYSTEM_PROMPT = """You are an expert LinkedIn profile consultant. 
Analyze the provided LinkedIn profile data and score it according to the rubric.

Target audience: {target_group}

Score each section out of the maximum points indicated.
Provide specific, actionable feedback for improvement.
Generate AI rewrite suggestions where applicable.

Return your analysis as a JSON object with the following structure:
{{
    "overall_score": <0-100>,
    "grade_label": "<EXCELLENT|GOOD|AVERAGE|NEEDS_WORK|POOR>",
    "executive_summary": "<2-3 sentence summary>",
    "sections": {{
        "profile_photo": {{
            "score": <0-10>,
            "max_score": 10,
            "analysis": "<feedback>",
            "status": "<optimized|needs_improvement|critical>"
        }},
        "headline": {{
            "score": <0-15>,
            "max_score": 15,
            "current_value": "<current headline>",
            "analysis": "<feedback>",
            "ai_rewrite": "<suggested headline>",
            "tags": ["Keywords", "Value Proposition", "Clarity"],
            "status": "<optimized|needs_improvement|critical>"
        }},
        "about": {{
            "score": <0-20>,
            "max_score": 20,
            "current_value": "<current about>",
            "analysis": "<feedback>",
            "ai_rewrite": "<suggested about>",
            "tags": ["Storytelling", "Keywords", "Call to Action"],
            "status": "<optimized|needs_improvement|critical>"
        }},
        "experience": {{
            "score": <0-20>,
            "max_score": 20,
            "analysis": "<feedback>",
            "status": "<optimized|needs_improvement|critical>"
        }},
        "connections": {{
            "score": <0-5>,
            "max_score": 5,
            "current_value": "<connection count>",
            "analysis": "<feedback>",
            "status": "<optimized|needs_improvement|critical>"
        }},
        "skills": {{
            "score": <0-10>,
            "max_score": 10,
            "analysis": "<feedback>",
            "status": "<optimized|needs_improvement|critical>"
        }},
        "education": {{
            "score": <0-10>,
            "max_score": 10,
            "analysis": "<feedback>",
            "status": "<optimized|needs_improvement|critical>"
        }},
        "certifications": {{
            "score": <0-10>,
            "max_score": 10,
            "analysis": "<feedback>",
            "status": "<optimized|needs_improvement|critical>"
        }}
    }},
    "top_priorities": ["<priority 1>", "<priority 2>", "<priority 3>"]
}}
"""

SCORING_USER_PROMPT = """Analyze this LinkedIn profile:

Profile Data:
- Name: {first_name} {last_name}
- Headline: {headline}
- About: {about}
- Connections: {connections}
- Followers: {followers}
- Location: {location}
- Experience: {experience}
- Education: {education}
- Skills: {skills}
- Certifications: {certifications}

Please provide a comprehensive scoring analysis optimized for: {target_group}
"""


class OpenAIScoringService:
    """Service for AI-powered profile scoring."""
    
    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-4-turbo-preview",
            api_key=settings.openai_api_key,
            temperature=0.3,
            response_format={"type": "json_object"},
        )
    
    def score_profile(
        self,
        scraped_profile: dict[str, Any],
        target_group: str,
    ) -> dict[str, Any]:
        """
        Score a LinkedIn profile using AI.
        
        Args:
            scraped_profile: Raw profile data from Apify
            target_group: Target audience (recruiters, clients, vcs)
        
        Returns:
            Scoring results dict
        """
        # Map target group to readable format
        target_map = {
            "recruiters": "Recruiters & Hiring Managers at top companies",
            "clients": "Potential Clients & Business Partners",
            "vcs": "Venture Capitalists & Investors",
        }
        target_readable = target_map.get(target_group, target_group)
        
        # Build the prompt
        prompt = ChatPromptTemplate.from_messages([
            ("system", SCORING_SYSTEM_PROMPT),
            ("user", SCORING_USER_PROMPT),
        ])
        
        # Format experience, education, skills for the prompt
        experience = scraped_profile.get("experience", [])
        education = scraped_profile.get("education", [])
        skills = scraped_profile.get("skills", [])
        certifications = scraped_profile.get("certifications", [])
        
        # Convert to strings
        experience_str = json.dumps(experience[:5], indent=2) if experience else "None listed"
        education_str = json.dumps(education[:3], indent=2) if education else "None listed"
        skills_str = ", ".join([s.get("name", "") for s in skills[:10]]) if skills else "None listed"
        certs_str = json.dumps(certifications[:5], indent=2) if certifications else "None listed"
        
        # Invoke the LLM
        chain = prompt | self.llm
        
        response = chain.invoke({
            "target_group": target_readable,
            "first_name": scraped_profile.get("firstName", "Unknown"),
            "last_name": scraped_profile.get("lastName", ""),
            "headline": scraped_profile.get("headline", "No headline"),
            "about": scraped_profile.get("about", "No about section"),
            "connections": scraped_profile.get("connectionsCount", "Unknown"),
            "followers": scraped_profile.get("followersCount", "Unknown"),
            "location": scraped_profile.get("geoLocationName", "Unknown"),
            "experience": experience_str,
            "education": education_str,
            "skills": skills_str,
            "certifications": certs_str,
        })
        
        # Parse the JSON response
        try:
            result = json.loads(response.content)
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            result = {
                "overall_score": 50,
                "grade_label": "AVERAGE",
                "executive_summary": "Unable to fully parse scoring. Please review manually.",
                "sections": {},
                "top_priorities": ["Review profile manually"],
            }
        
        return result


# Singleton instance
_scoring_service: Optional[OpenAIScoringService] = None


def get_scoring_service() -> OpenAIScoringService:
    """Get the singleton OpenAIScoringService instance."""
    global _scoring_service
    if _scoring_service is None:
        _scoring_service = OpenAIScoringService()
    return _scoring_service
