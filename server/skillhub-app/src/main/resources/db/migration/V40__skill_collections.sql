-- User-owned skill collections: root aggregate, membership, contributors (Phase 1 COL/ROL groundwork)

CREATE TABLE skill_collection (
    id BIGSERIAL PRIMARY KEY,
    owner_id VARCHAR(128) NOT NULL REFERENCES user_account(id),
    slug VARCHAR(64) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    visibility VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (owner_id, slug)
);

CREATE INDEX idx_skill_collection_owner_id ON skill_collection(owner_id);

CREATE TABLE skill_collection_member (
    id BIGSERIAL PRIMARY KEY,
    skill_collection_id BIGINT NOT NULL REFERENCES skill_collection(id) ON DELETE CASCADE,
    skill_id BIGINT NOT NULL REFERENCES skill(id) ON DELETE RESTRICT,
    sort_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (skill_collection_id, skill_id)
);

CREATE INDEX idx_skill_collection_member_collection_id ON skill_collection_member(skill_collection_id);

CREATE TABLE skill_collection_contributor (
    id BIGSERIAL PRIMARY KEY,
    skill_collection_id BIGINT NOT NULL REFERENCES skill_collection(id) ON DELETE CASCADE,
    user_id VARCHAR(128) NOT NULL REFERENCES user_account(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (skill_collection_id, user_id)
);

CREATE INDEX idx_skill_collection_contributor_collection_id ON skill_collection_contributor(skill_collection_id);

COMMENT ON TABLE skill_collection IS 'User-owned named collection of skills (visibility PUBLIC/PRIVATE)';
COMMENT ON TABLE skill_collection_member IS 'Skill membership in a collection with display ordering';
COMMENT ON TABLE skill_collection_contributor IS 'Additional users who may edit collection membership per policy';
