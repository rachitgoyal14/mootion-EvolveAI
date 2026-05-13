SCIENTIST_REGISTRY = {
    "physics": {
        "kinematics": "newton",
        "motion": "newton",
        "relativity": "einstein",
        "quantum": "bohr",
        "electromagnetism": "maxwell"
    },
    "mathematics": {
        "calculus": "newton",
        "integration": "leibniz",
        "number theory": "ramanujan",
        "geometry": "euclid",
        "linear algebra": "gauss"
    },
    "chemistry": {
        "atomic": "bohr",
        "periodic": "mendeleev",
        "radioactivity": "curie"
    }
}

AVATAR_MAP = {
    "newton": "data/avatars/newton.jpg",
    "einstein": "data/avatars/einstein.webp",
    "ramanujan": "data/avatars/ramanujan.webp",
    "bohr": "data/avatars/bohr.webp",
    "mendeleev": "data/avatars/mendeleev.webp",
    "default": "data/avatars/newton.jpg"
}

def resolve_avatar(topic: str | None, category: str | None) -> str:
    if not topic or not category:
        return AVATAR_MAP["default"]

    topic = topic.lower()
    domain = SCIENTIST_REGISTRY.get(category.lower(), {})

    for keyword, scientist in domain.items():
        if keyword in topic:
            return AVATAR_MAP.get(scientist, AVATAR_MAP["default"])

    return AVATAR_MAP["default"]
