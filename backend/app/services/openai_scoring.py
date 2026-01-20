"""
OpenAI Scoring Service

Handles AI-powered profile scoring using GPT-4.
Aligned with the deterministic scoring architecture in app/scoring/.
"""

import json
from typing import Any, Optional

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

from app.config import settings


# ============================================================================
# SCORING RUBRIC (Based on app/scoring/rules/base_rules.yaml)
# ============================================================================
SCORING_RUBRIC = """
SCORING RUBRIC - What to look for in each section:

## HEADLINE (1-10 points)
✅ POSITIVE signals:
- Clear professional role (Engineer, Manager, Director, Lead)
- Quantified achievements (e.g., "Increased revenue by 40%")
- Industry-relevant keywords

❌ NEGATIVE signals:
- "Open to work" or "Seeking opportunities" (job-seeker focused, not value-focused)
- Buzzwords like "Guru", "Ninja", "Rockstar", "Wizard"
- Emoji overuse (🚀✨⭐) in professional contexts

## ABOUT/SUMMARY (1-10 points)
✅ POSITIVE signals:
- Quantified achievements with numbers/metrics (e.g., "Led team of 10", "Grew revenue 200%")
- Industry keywords (Agile, Cloud, Python, AI, Machine Learning)
- Clear call to action ("Reach out", "Let's connect", "DM me")
- 200+ characters of meaningful content

❌ NEGATIVE signals:
- Buzzwords without proof: "passionate", "motivated", "creative", "strategic", "innovative", "driven", "dynamic"
- Missing entirely
- Very short (under 100 characters)

## EXPERIENCE (1-10 points)
✅ POSITIVE signals:
- Quantified results ("increased X by Y%", "reduced costs by $Z")
- Leadership indicators ("Manager", "Director", "VP", "Head of", "led team of N")
- Strong action verbs (Led, Built, Designed, Developed, Launched, Optimized, Scaled)
- Industry terms (Agile, Scrum, Cloud, Data, Analytics)

❌ NEGATIVE signals:
- "Responsible for" language (duties, not achievements)
- No metrics or quantified results
- Generic job descriptions

## CONNECTIONS (1-10 points)
- 500+ connections = 8-10 points
- 200-499 = 5-7 points
- 50-199 = 3-4 points
- Under 50 = 1-2 points

## EDUCATION (1-10 points)
✅ POSITIVE signals:
- Advanced degrees (Master's, MBA, PhD)
- High GPA (3.5+) or honors (cum laude)
- Relevant field of study

## SKILLS (1-10 points)
✅ POSITIVE signals:
- In-demand skills (Python, Java, SQL, AWS, Azure, React, Docker, Kubernetes, Machine Learning)
- System design expertise
- 10+ skills listed

❌ NEGATIVE signals:
- Basic skills like "Microsoft Office", "Internet", "Email", "Typing"
- Fewer than 5 skills

## LICENSES & CERTIFICATIONS (1-10 points)
✅ POSITIVE signals:
- Cloud certifications (AWS, Azure, GCP)
- Professional certifications (PMP, CPA, CFA)
- Industry-recognized credentials

## PROFILE PICTURE (1-10 points)
- Professional headshot = 8-10
- Casual but clear = 5-7
- Missing or inappropriate = 1-4

## VERIFIED & PREMIUM (1-10 points each)
- LinkedIn Verified badge = 10, none = 4
- LinkedIn Premium = 8, none = 5
"""

# ============================================================================
# SYSTEM PROMPT
# ============================================================================
SCORING_SYSTEM_PROMPT = """You are an expert LinkedIn profile optimization consultant who helps professionals improve their profiles for specific target audiences.

Your task is to analyze a LinkedIn profile and provide:
1. Section-by-section scores (1-10 scale)
2. Detailed reasoning for each score
3. SPECIFIC highlighting of what rubric items are MISSING from the profile
4. Cumulative score (sum of all section scores, max 100)

TARGET AUDIENCE: {target_group}

""" + SCORING_RUBRIC + """

CRITICAL INSTRUCTIONS:
1. For each section's reasoning, explicitly state which rubric items are PRESENT and which are MISSING
2. Use format: "PRESENT: [list items found] | MISSING: [list items not found]"
3. Be specific about what the user should ADD to improve their score
4. Each section score must be 1-10 (not 0, minimum is 1)
5. The Cumulative Sum should equal the sum of all 12 section scores

Return your analysis as a valid JSON object matching this exact schema:
{{
    "LinkedIn URL": "<profile_url>",
    "Headline Score": <1-10>,
    "Connection Count Score": <1-10>,
    "Follower Count Score": <1-10>,
    "About Score": <1-10>,
    "Profile Pic Score": <1-10>,
    "Cover_picture Score": <1-10>,
    "Experience Score": <1-10>,
    "Education Score": <1-10>,
    "Skills Score": <1-10>,
    "Licenses & Certifications Score": <1-10>,
    "is Verified Score": <1-10>,
    "is Premium Score": <1-10>,
    "Cumulative Sum of Score(100)": <sum of above scores>,
    "Headline Reasoning": "<analysis with PRESENT/MISSING items>",
    "Connection Reasoning": "<analysis>",
    "Follower Reasoning": "<analysis>",
    "About Reasoning": "<analysis with PRESENT/MISSING items>",
    "Profile Pic Reasoning": "<analysis>",
    "Cover_picture Reasoning": "<analysis>",
    "Experience Reasoning": "<analysis with PRESENT/MISSING items>",
    "Education Reasoning": "<analysis>",
    "Skills Reasoning": "<analysis with PRESENT/MISSING items>",
    "Licenses & Certifications Reasoning": "<analysis>",
    "Cumulative Sum Reasoning": "<executive summary and top 3 priorities>"
}}
"""

# ============================================================================
# USER PROMPT
# ============================================================================
SCORING_USER_PROMPT = """Analyze this LinkedIn profile for optimization opportunities:

LINKEDIN URL: {linkedin_url}

== PROFILE DATA ==

Name: {first_name} {last_name}
Location: {location}

HEADLINE:
{headline}

ABOUT SECTION:
{about}

CONNECTIONS: {connections}
FOLLOWERS: {followers}

PROFILE PICTURE: {has_profile_pic}
COVER IMAGE: {has_cover_image}
VERIFIED: {is_verified}
PREMIUM: {is_premium}

EXPERIENCE:
{experience}

EDUCATION:
{education}

SKILLS:
{skills}

LICENSES & CERTIFICATIONS:
{certifications}

== END PROFILE DATA ==

Please score each section (1-10), highlight MISSING rubric items in your reasoning, and provide the Cumulative Sum.
Target Audience: {target_group}
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
        linkedin_url: str = "",
    ) -> dict[str, Any]:
        """
        Score a LinkedIn profile using AI.
        
        Args:
            scraped_profile: Raw profile data from Apify
            target_group: Target audience (recruiters, clients, vcs)
            linkedin_url: Original LinkedIn URL
        
        Returns:
            Scoring results dict matching the expected schema
        """
        # Map target group to readable format
        target_map = {
            "recruiters": "Recruiters & Hiring Managers at Big Companies (FAANG, Fortune 500)",
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
        experience = scraped_profile.get("experience", []) or scraped_profile.get("positions", [])
        education = scraped_profile.get("education", []) or scraped_profile.get("educations", [])
        skills = scraped_profile.get("skills", [])
        certifications = scraped_profile.get("certifications", []) or scraped_profile.get("licenses", [])
        
        # Convert to readable strings
        if experience:
            exp_lines = []
            for exp in experience[:5]:
                title = exp.get("title", "Unknown Role")
                company = exp.get("companyName", exp.get("company", "Unknown Company"))
                desc = exp.get("description", "No description")[:300]
                exp_lines.append(f"• {title} at {company}\n  {desc}")
            experience_str = "\n\n".join(exp_lines)
        else:
            experience_str = "No experience listed"
        
        if education:
            edu_lines = []
            for edu in education[:3]:
                school = edu.get("schoolName", edu.get("school", "Unknown School"))
                degree = edu.get("degreeName", edu.get("degree", ""))
                field = edu.get("fieldOfStudy", "")
                edu_lines.append(f"• {degree} {field} - {school}")
            education_str = "\n".join(edu_lines)
        else:
            education_str = "No education listed"
        
        if skills:
            skills_str = ", ".join([s.get("name", str(s)) for s in skills[:15]])
        else:
            skills_str = "No skills listed"
        
        if certifications:
            cert_lines = []
            for cert in certifications[:5]:
                name = cert.get("name", cert.get("title", "Unknown"))
                authority = cert.get("authority", cert.get("issuer", ""))
                cert_lines.append(f"• {name} ({authority})" if authority else f"• {name}")
            certs_str = "\n".join(cert_lines)
        else:
            certs_str = "No certifications listed"
        
        # Detect presence of media
        has_profile_pic = "Yes" if scraped_profile.get("pictureUrl") or scraped_profile.get("profilePicture") else "No"
        has_cover_image = "Yes" if scraped_profile.get("backgroundUrl") or scraped_profile.get("coverImage") else "No"
        is_verified = "Yes" if scraped_profile.get("isVerified") else "No"
        is_premium = "Yes" if scraped_profile.get("isPremium") or scraped_profile.get("premium") else "No"
        
        # Invoke the LLM
        chain = prompt | self.llm
        
        response = chain.invoke({
            "target_group": target_readable,
            "linkedin_url": linkedin_url or scraped_profile.get("url", "Unknown"),
            "first_name": scraped_profile.get("firstName", "Unknown"),
            "last_name": scraped_profile.get("lastName", ""),
            "headline": scraped_profile.get("headline", "No headline"),
            "about": scraped_profile.get("about", scraped_profile.get("summary", "No about section")),
            "connections": scraped_profile.get("connectionsCount", scraped_profile.get("connections", "Unknown")),
            "followers": scraped_profile.get("followersCount", scraped_profile.get("followers", "Unknown")),
            "location": scraped_profile.get("geoLocationName", scraped_profile.get("location", "Unknown")),
            "experience": experience_str,
            "education": education_str,
            "skills": skills_str,
            "certifications": certs_str,
            "has_profile_pic": has_profile_pic,
            "has_cover_image": has_cover_image,
            "is_verified": is_verified,
            "is_premium": is_premium,
        })
        
        # Parse the JSON response
        try:
            result = json.loads(response.content)
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            result = {
                "LinkedIn URL": linkedin_url,
                "Headline Score": 5,
                "Connection Count Score": 5,
                "Follower Count Score": 5,
                "About Score": 5,
                "Profile Pic Score": 5,
                "Cover_picture Score": 5,
                "Experience Score": 5,
                "Education Score": 5,
                "Skills Score": 5,
                "Licenses & Certifications Score": 5,
                "is Verified Score": 5,
                "is Premium Score": 5,
                "Cumulative Sum of Score(100)": 60,
                "Headline Reasoning": "Unable to parse AI response",
                "Connection Reasoning": "Unable to parse AI response",
                "Follower Reasoning": "Unable to parse AI response",
                "About Reasoning": "Unable to parse AI response",
                "Profile Pic Reasoning": "Unable to parse AI response",
                "Cover_picture Reasoning": "Unable to parse AI response",
                "Experience Reasoning": "Unable to parse AI response",
                "Education Reasoning": "Unable to parse AI response",
                "Skills Reasoning": "Unable to parse AI response",
                "Licenses & Certifications Reasoning": "Unable to parse AI response",
                "Cumulative Sum Reasoning": "AI response could not be parsed. Please try again.",
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
