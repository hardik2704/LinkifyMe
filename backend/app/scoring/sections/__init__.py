# Section scorers
from app.scoring.sections.base_sections import BaseSectionScorer
from app.scoring.sections.headline import HeadlineScorer
from app.scoring.sections.connections import ConnectionsScorer
from app.scoring.sections.followers import FollowersScorer
from app.scoring.sections.about import AboutScorer
from app.scoring.sections.profile_pic import ProfilePicScorer
from app.scoring.sections.cover_picture import CoverPictureScorer
from app.scoring.sections.experience import ExperienceScorer
from app.scoring.sections.education import EducationScorer
from app.scoring.sections.skills import SkillsScorer
from app.scoring.sections.licenses_certs import LicensesCertsScorer
from app.scoring.sections.verified import VerifiedScorer
from app.scoring.sections.premium import PremiumScorer

ALL_SCORERS = [
    HeadlineScorer(),
    ConnectionsScorer(),
    FollowersScorer(),
    AboutScorer(),
    ProfilePicScorer(),
    CoverPictureScorer(),
    ExperienceScorer(),
    EducationScorer(),
    SkillsScorer(),
    LicensesCertsScorer(),
    VerifiedScorer(),
    PremiumScorer(),
]

SCORER_MAP = {scorer.key: scorer for scorer in ALL_SCORERS}

__all__ = [
    "BaseSectionScorer",
    "ALL_SCORERS",
    "SCORER_MAP",
]
