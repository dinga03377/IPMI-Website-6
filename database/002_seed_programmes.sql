-- Catalogue seed is also idempotently applied by the API at boot. Stable slugs are used by public forms.
INSERT INTO programmes(slug,code,title,category,level,description,duration,status) VALUES
('ppm','IPMI-PPM','Project & Programme Management','Management','Professional','Planning, governance, risk, stakeholders and delivery performance for professionals responsible for outcomes.','8–12 weeks','published'),
('hrm','IPMI-HRM','Human Resource Management','People','Professional','Workforce planning, talent, performance, employee experience and practical people operations.','8–12 weeks','published'),
('bme','IPMI-BME','Business Management & Entrepreneurship','Business','Professional','Commercial thinking, business models, operations, entrepreneurship and execution discipline.','8–12 weeks','published'),
('cx','IPMI-CX','Customer Experience & Relationship Management','Business','Professional','Customer journeys, service systems, relationship strategy and measurable experience improvement.','6–10 weeks','published'),
('hse','IPMI-HSE','Health, Safety & Environment','Safety','Professional','Safety systems, environmental responsibility, operational risk and incident-prevention practice.','8–12 weeks','published'),
('scm','IPMI-SCM','Supply Chain & Logistics Management','Operations','Professional','Sourcing, inventory, logistics, suppliers and operational resilience across modern supply chains.','8–12 weeks','published'),
('exec','IPMI-EXL','Executive Leadership & Strategic Management','Executive','Executive','Strategic thinking, governance, leadership systems, organisational alignment and execution.','6–10 weeks','published'),
('ai','IPMI-AI','Digital Productivity & AI for Professionals','Digital','Professional','Modern digital workflows, responsible AI, automation and practical knowledge-work systems.','4–8 weeks','published'),
('finance','IPMI-FIN','Financial Management for Managers','Finance','Professional','Financial literacy, budgeting, management reporting, controls and decision support.','6–10 weeks','published'),
('proc','IPMI-PCM','Procurement & Contract Management','Operations','Professional','Procurement strategy, sourcing, contract lifecycle, supplier governance and commercial controls.','6–10 weeks','published')
ON CONFLICT(slug) DO UPDATE SET title=EXCLUDED.title,category=EXCLUDED.category,level=EXCLUDED.level,description=EXCLUDED.description,duration=EXCLUDED.duration,status='published',updated_at=now();
