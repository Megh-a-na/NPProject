from dataclasses import dataclass
from typing import List, Dict

@dataclass
class SiteLocation:
    latitude: float
    longitude: float
    terrain_type: str
    population_density: float
    existing_infrastructure: Dict
    environmental_factors: Dict
    rf_characteristics: Dict = None  # Added for RF analysis
    accessibility_metrics: Dict = None  # Added for site access evaluation
    economic_factors: Dict = None  # Added for cost analysis
    regulatory_compliance: Dict = None  # Added for compliance checks

@dataclass
class SiteScore:
    location: SiteLocation
    total_score: float
    breakdown: Dict[str, float]  # Detailed scoring breakdown
    advantages: List[str]  # Key advantages of the site
    risks: List[str]  # Potential risks and challenges
    cost_estimate: Dict[str, float]  # Detailed cost breakdown