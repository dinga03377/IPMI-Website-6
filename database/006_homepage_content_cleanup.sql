-- Remove only the unmodified starter statistic values. Any values the institute
-- has changed are retained and remain editable through the Site Content admin page.
UPDATE site_content
SET content = CASE
  WHEN content->>'statInitialPathways' = '10' THEN content - 'statInitialPathways'
  ELSE content
END
WHERE content_key = 'homepage';

UPDATE site_content
SET content = CASE
  WHEN content->>'statInitialLabel' = 'Initial pathways' THEN content - 'statInitialLabel'
  ELSE content
END
WHERE content_key = 'homepage';

UPDATE site_content
SET content = CASE
  WHEN content->>'statExpandValue' = '∞' THEN content - 'statExpandValue'
  ELSE content
END
WHERE content_key = 'homepage';

UPDATE site_content
SET content = CASE
  WHEN content->>'statExpandLabel' = 'Expandable disciplines' THEN content - 'statExpandLabel'
  ELSE content
END
WHERE content_key = 'homepage';

UPDATE site_content
SET content = CASE
  WHEN content->>'statAccessValue' = '24/7' THEN content - 'statAccessValue'
  ELSE content
END
WHERE content_key = 'homepage';

UPDATE site_content
SET content = CASE
  WHEN content->>'statAccessLabel' = 'Digital access' THEN content - 'statAccessLabel'
  ELSE content
END
WHERE content_key = 'homepage';

UPDATE site_content
SET content = CASE
  WHEN content->>'statUnifiedValue' = '01' THEN content - 'statUnifiedValue'
  ELSE content
END
WHERE content_key = 'homepage';

UPDATE site_content
SET content = CASE
  WHEN content->>'statUnifiedLabel' = 'Unified ecosystem' THEN content - 'statUnifiedLabel'
  ELSE content
END
WHERE content_key = 'homepage';

-- Supply missing configurable hero labels without overwriting values already set by staff.
UPDATE site_content
SET content = '{"heroEyebrow":"PROFESSIONAL DEVELOPMENT · CREDENTIALS · MEMBERSHIP","heroPrimaryCta":"Explore programmes","heroSecondaryCta":"Start an application","heroPanelLabel":"IPMI / DIGITAL INSTITUTE"}'::jsonb || content
WHERE content_key = 'homepage';
