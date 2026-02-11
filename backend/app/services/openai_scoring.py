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
        previous_profile: Optional[dict[str, Any]] = None,
        previous_scores: Optional[dict[str, Any]] = None,
    ) -> dict[str, Any]:
        """
        Score a LinkedIn profile using AI with Partial Scoring optimization.
        
        Args:
            scraped_profile: Raw profile data from Apify
            target_group: Target audience (recruiters, clients, vcs)
            linkedin_url: Original LinkedIn URL
            previous_profile: Profile data from previous attempt (for comparison)
            previous_scores: Scores from previous attempt (for reuse)
        
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
        
        # 1. Identify valid previous scores to reuse
        # We need both the previous profile AND previous scores to be present
        can_optimize = previous_profile is not None and previous_scores is not None
        
        # 2. Determine which sections need scoring
        sections_to_score = set()
        reused_scores = {}
        
        if can_optimize:
            changes = self._compare_profiles(previous_profile, scraped_profile)
            
            # Map change keys to Score keys
            # Keys in _compare_profiles: headline, about, experience, education, skills, certifications, connections, followers, profile_pic, cover_picture, verified, premium
            # Keys in Scores: Headline Score, About Score, ...
            
            section_map = {
                "headline": ("Headline Score", "Headline Reasoning"),
                "about": ("About Score", "About Reasoning"),
                "experience": ("Experience Score", "Experience Reasoning"),
                "education": ("Education Score", "Education Reasoning"),
                "skills": ("Skills Score", "Skills Reasoning"),
                "certifications": ("Licenses & Certifications Score", "Licenses & Certifications Reasoning"),
                "connections": ("Connection Count Score", "Connection Reasoning"),
                "followers": ("Follower Count Score", "Follower Reasoning"),
                "profile_pic": ("Profile Pic Score", "Profile Pic Reasoning"),
                "cover_picture": ("Cover_picture Score", "Cover_picture Reasoning"),
                "is_verified": ("is Verified Score", "Cumulative Sum Reasoning"), # Verified/Premium usually don't have distinct reasoning fields in the root JSON, but valid to check
                "is_premium": ("is Premium Score", "Cumulative Sum Reasoning"),
            }
            
            for section_key, (score_key, reasoning_key) in section_map.items():
                if changes.get(section_key, True): # Default to True (changed) if key missing
                    sections_to_score.add(section_key)
                else:
                    # REUSE: Copy score and reasoning
                    # Handle special cases for Verified/Premium which might not have reasoning
                    reused_scores[score_key] = previous_scores.get(score_key, 0)
                    if reasoning_key in previous_scores:
                        reused_scores[reasoning_key] = previous_scores.get(reasoning_key, "")
        else:
            # No previous data, score everything
            sections_to_score = {
                "headline", "about", "experience", "education", "skills", 
                "certifications", "connections", "followers", 
                "profile_pic", "cover_picture", "is_verified", "is_premium"
            }

        # If nothing to score, return previous result immediately (with updated timestamp if needed by caller)
        if not sections_to_score and previous_scores:
            return previous_scores

        # 3. Prepare data for the prompt (only for sections to score OR full if strictly needed for context)
        # We almost always want full context for the AI, but we instruct it to only score specific parts?
        # Actually, to save tokens, we should minimize the input. 
        # However, "Experience" often informs "About". 
        # For this implementation, we will send the FULL profile to ensure context is available, 
        # but the COST SAVING comes from the fact that we might skip this whole block if nothing changed.
        # Wait, user explicitly said "Code to AI only for those sections which have been edited... to save costs".
        # So we SHOULD try to limit input tokens if possible.
        # But 'About' needs 'Experience' to be accurate. 
        # Let's stick to sending the relevant data.
        
        # Format experience, education, skills
        experience = scraped_profile.get("experience", []) or scraped_profile.get("positions", [])
        education = scraped_profile.get("education", []) or scraped_profile.get("educations", [])
        skills = scraped_profile.get("skills", [])
        certifications = scraped_profile.get("certifications", []) or scraped_profile.get("licenses", [])
        
        # Strings are only needed if we are actually scoring those sections OR if they provoke context.
        # For simplicity and correctness, we generate the full strings, 
        # but we could potentially omit them from the prompt if the section isn't being scored.
        # Let's include them for now to ensure quality (context), but partial OUTPUT generation saves output tokens.
        
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
        has_profile_pic = "Yes" if (
            scraped_profile.get("pictureUrl") or 
            scraped_profile.get("profilePicture") or
            scraped_profile.get("profilePictureUrl")
        ) else "No"
        
        has_cover_image = "Yes" if (
            scraped_profile.get("coverImageUrl") or 
            scraped_profile.get("backgroundUrl") or 
            scraped_profile.get("backgroundImage") or
            scraped_profile.get("coverImage")
        ) else "No"
        
        is_verified = "Yes" if scraped_profile.get("isVerified") else "No"
        is_premium = "Yes" if scraped_profile.get("isPremium") or scraped_profile.get("premium") else "No"
        
        followers = str(scraped_profile.get("followerCount") or scraped_profile.get("followersCount") or scraped_profile.get("followers") or "Unknown")
        connections = str(scraped_profile.get("connectionsCount") or scraped_profile.get("connections") or "Unknown")

        # 4. Construct the prompt
        # We append a specific instruction about which sections to score.
        scoring_instruction = (
            f"IMPORTANT: You are performing a PARTIAL update. "
            f"ONLY score the following sections: {', '.join(sections_to_score)}. "
            f"For all other sections not listed, you MUST return null or 0 in the JSON to indicate no change."
        ) if can_optimize else ""

        # Using the standard system prompt + dynamic instruction
        final_system_prompt = SCORING_SYSTEM_PROMPT + "\n\n" + scoring_instruction
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", final_system_prompt),
            ("user", SCORING_USER_PROMPT),
        ])
        
        # Invoke the LLM
        chain = prompt | self.llm
        
        response = chain.invoke({
            "target_group": target_readable,
            "linkedin_url": linkedin_url or scraped_profile.get("url", "Unknown"),
            "first_name": scraped_profile.get("firstName", "Unknown"),
            "last_name": scraped_profile.get("lastName", ""),
            "headline": scraped_profile.get("headline", "No headline"),
            "about": scraped_profile.get("about", scraped_profile.get("summary", "No about section")),
            "connections": connections,
            "followers": followers,
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
        
        # 5. Parse and Merge
        try:
            new_results = json.loads(response.content)
        except json.JSONDecodeError:
            # Fallback logic...
            return {
                "LinkedIn URL": linkedin_url,
                "Headline Score": 5,
                "Cumulative Sum of Score(100)": 0,
                "Cumulative Sum Reasoning": "Error parsing AI response",
            }

        # Merge new_results into final_results (priority to new, fallback to reused)
        final_results = {}
        
        # Helper to get score from new_results ignoring 0/null if it was skipping
        # Actually proper logic: If section was in `sections_to_score`, taking new value. Else taking reused.
        
        section_map_reverse = {
            "Headline Score": "headline",
            "Connection Count Score": "connections",
            "Follower Count Score": "followers",
            "About Score": "about",
            "Profile Pic Score": "profile_pic",
            "Cover_picture Score": "cover_picture",
            "Experience Score": "experience",
            "Education Score": "education",
            "Skills Score": "skills",
            "Licenses & Certifications Score": "certifications",
            "is Verified Score": "is_verified",
            "is Premium Score": "is_premium",
        }
        
        cumulative_sum = 0
        
        # Iterate over all expected keys in the standard schema
        expected_keys = [
            "Headline Score", "Connection Count Score", "Follower Count Score", 
            "About Score", "Profile Pic Score", "Cover_picture Score", 
            "Experience Score", "Education Score", "Skills Score", 
            "Licenses & Certifications Score", "is Verified Score", "is Premium Score"
        ]
        
        for key in expected_keys:
            section = section_map_reverse[key]
            if section in sections_to_score:
                # Use new value
                val = new_results.get(key, 0) or 0 # Handle nulls if AI sends them
                final_results[key] = val
                
                # Also get reasoning
                reasoning_key = key.replace(" Score", "") + " Reasoning"
                if "Count" in reasoning_key: reasoning_key = reasoning_key.replace("Count ", "")
                if "is " in reasoning_key: reasoning_key = reasoning_key.replace("is ", "") # e.g. "Verified Reasoning" - wait schema is weird
                
                # Fix schema mapping for reasonings based on base file
                # Schema: "Headline Reasoning", "Connection Reasoning", ...
                if key == "Headline Score": r_key = "Headline Reasoning"
                elif key == "Connection Count Score": r_key = "Connection Reasoning"
                elif key == "Follower Count Score": r_key = "Follower Reasoning"
                elif key == "About Score": r_key = "About Reasoning"
                elif key == "Profile Pic Score": r_key = "Profile Pic Reasoning"
                elif key == "Cover_picture Score": r_key = "Cover_picture Reasoning"
                elif key == "Experience Score": r_key = "Experience Reasoning"
                elif key == "Education Score": r_key = "Education Reasoning"
                elif key == "Skills Score": r_key = "Skills Reasoning"
                elif key == "Licenses & Certifications Score": r_key = "Licenses & Certifications Reasoning"
                else: r_key = None
                
                if r_key:
                    final_results[r_key] = new_results.get(r_key, "")
            else:
                # Use reused value
                final_results[key] = reused_scores.get(key, 0)
                
                # Also copy reasoning
                if key == "Headline Score": r_key = "Headline Reasoning"
                elif key == "Connection Count Score": r_key = "Connection Reasoning"
                elif key == "Follower Count Score": r_key = "Follower Reasoning"
                elif key == "About Score": r_key = "About Reasoning"
                elif key == "Profile Pic Score": r_key = "Profile Pic Reasoning"
                elif key == "Cover_picture Score": r_key = "Cover_picture Reasoning"
                elif key == "Experience Score": r_key = "Experience Reasoning"
                elif key == "Education Score": r_key = "Education Reasoning"
                elif key == "Skills Score": r_key = "Skills Reasoning"
                elif key == "Licenses & Certifications Score": r_key = "Licenses & Certifications Reasoning"
                else: r_key = None
                
                if r_key:
                    final_results[r_key] = reused_scores.get(r_key, "")

            # Add to sum
            cumulative_sum += float(final_results[key])

        final_results["LinkedIn URL"] = linkedin_url
        final_results["Cumulative Sum of Score(100)"] = cumulative_sum
        
        # Combine reasoning for summary
        if can_optimize:
            final_results["Cumulative Sum Reasoning"] = f"Partial Scoring Updated. Changed sections: {list(sections_to_score)}. " + new_results.get("Cumulative Sum Reasoning", "")
        else:
            final_results["Cumulative Sum Reasoning"] = new_results.get("Cumulative Sum Reasoning", "")
        
        return final_results

    def _compare_profiles(self, old: dict, new: dict) -> dict[str, bool]:
        """
        Compare two profiles and return a dict of {section_name: is_changed}.
        True means Changed (needs scoring).
        False means Unchanged (copy score).
        """
        changes = {}
        
        # 1. Simple strings
        changes["headline"] = old.get("headline") != new.get("headline")
        changes["about"] = old.get("about") != new.get("about") and old.get("summary") != new.get("summary") # Handle alias
        changes["is_verified"] = old.get("isVerified") != new.get("isVerified")
        changes["is_premium"] = old.get("isPremium") != new.get("isPremium")
        changes["profile_pic"] = old.get("pictureUrl") != new.get("pictureUrl")
        changes["cover_picture"] = old.get("coverImageUrl") != new.get("coverImageUrl")
        
        # 2. Counts (allow small variance? No, user wants strict checks)
        changes["connections"] = old.get("connectionCount") != new.get("connectionCount")
        changes["followers"] = old.get("followerCount") != new.get("followerCount")
        
        # 3. Lists (Experience, Education, Skills, Certs)
        # We need to compare the content. Convert to JSON string for easy deep comparison.
        def get_json_str(data, key):
            val = data.get(key, [])
            return json.dumps(val, sort_keys=True)

        changes["experience"] = get_json_str(old, "experience") != get_json_str(new, "experience")
        changes["education"] = get_json_str(old, "education") != get_json_str(new, "education")
        changes["skills"] = get_json_str(old, "skills") != get_json_str(new, "skills")
        changes["certifications"] = get_json_str(old, "certifications") != get_json_str(new, "certifications")
        
        return changes


# Singleton instance
_scoring_service: Optional[OpenAIScoringService] = None


def get_scoring_service() -> OpenAIScoringService:
    """Get the singleton OpenAIScoringService instance."""
    global _scoring_service
    if _scoring_service is None:
        _scoring_service = OpenAIScoringService()
    return _scoring_service
