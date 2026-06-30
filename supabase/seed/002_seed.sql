-- ============================================================
-- BenefitsFlow HRIS Lab – Seed Data
-- ALL DATA IS FICTIONAL. No real employees, PHI, or SSNs.
-- ============================================================

-- ============================================================
-- ORGANIZATIONS
-- ============================================================

INSERT INTO organizations (id, name, org_type, location_state, location_city) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Ensign Services, Inc.', 'SERVICE_CENTER', 'CA', 'San Juan Capistrano'),
  ('a1000000-0000-0000-0000-000000000002', 'West Region', 'REGION', 'CA', 'Los Angeles'),
  ('a1000000-0000-0000-0000-000000000003', 'Pacific Northwest Region', 'REGION', 'WA', 'Seattle'),
  ('a1000000-0000-0000-0000-000000000004', 'Sunrise Post-Acute Care – San Juan Capistrano', 'FACILITY', 'CA', 'San Juan Capistrano'),
  ('a1000000-0000-0000-0000-000000000005', 'Emerald Coast Rehabilitation – Portland', 'FACILITY', 'OR', 'Portland'),
  ('a1000000-0000-0000-0000-000000000006', 'Blue Ridge Care Center – Boise', 'FACILITY', 'ID', 'Boise'),
  ('a1000000-0000-0000-0000-000000000007', 'Canyon View Nursing – Phoenix', 'FACILITY', 'AZ', 'Phoenix'),
  ('a1000000-0000-0000-0000-000000000008', 'Lakewood Skilled Nursing – Denver', 'FACILITY', 'CO', 'Denver'),
  ('a1000000-0000-0000-0000-000000000009', 'HR Technology Team', 'SERVICE_CENTER', 'CA', 'San Juan Capistrano');

-- ============================================================
-- JOB FAMILIES & PROFILES
-- ============================================================

INSERT INTO job_families (id, name, code) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Human Resources', 'HR'),
  ('b1000000-0000-0000-0000-000000000002', 'Nursing', 'NRS'),
  ('b1000000-0000-0000-0000-000000000003', 'Therapy', 'THR'),
  ('b1000000-0000-0000-0000-000000000004', 'Administration', 'ADM'),
  ('b1000000-0000-0000-0000-000000000005', 'Food & Nutrition', 'FNS'),
  ('b1000000-0000-0000-0000-000000000006', 'Housekeeping', 'HSK'),
  ('b1000000-0000-0000-0000-000000000007', 'Information Technology', 'IT');

INSERT INTO job_profiles (id, job_family_id, title, code, management_level, fast_track_benefits) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'HR Solutions Analyst – Workday', 'HR-WD-ANALYST', 'IC', TRUE),
  ('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'Benefits Partner', 'HR-BEN-PARTNER', 'IC', TRUE),
  ('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 'HR Director', 'HR-DIRECTOR', 'DIRECTOR', TRUE),
  ('c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000002', 'Registered Nurse', 'NRS-RN', 'IC', TRUE),
  ('c1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000002', 'LVN', 'NRS-LVN', 'IC', TRUE),
  ('c1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000002', 'Director of Nursing', 'NRS-DON', 'DIRECTOR', TRUE),
  ('c1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000003', 'Physical Therapist', 'THR-PT', 'IC', TRUE),
  ('c1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000003', 'Occupational Therapist', 'THR-OT', 'IC', TRUE),
  ('c1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000004', 'Administrator', 'ADM-ADMIN', 'DIRECTOR', TRUE),
  ('c1000000-0000-0000-0000-000000000010', 'b1000000-0000-0000-0000-000000000004', 'Business Office Manager', 'ADM-BOM', 'MANAGER', FALSE),
  ('c1000000-0000-0000-0000-000000000011', 'b1000000-0000-0000-0000-000000000005', 'Dietary Aide', 'FNS-AIDE', 'IC', FALSE),
  ('c1000000-0000-0000-0000-000000000012', 'b1000000-0000-0000-0000-000000000006', 'Housekeeper', 'HSK-HKPR', 'IC', FALSE),
  ('c1000000-0000-0000-0000-000000000013', 'b1000000-0000-0000-0000-000000000007', 'HRIS Analyst', 'IT-HRIS', 'IC', TRUE);

-- ============================================================
-- DENTAL CARRIERS
-- ============================================================

INSERT INTO dental_carriers (id, name, group_number, phone, website, states_served) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'Delta Dental', '19192', '800-765-6003', 'deltadentalins.com', ARRAY['ID','OR','WA']),
  ('d1000000-0000-0000-0000-000000000002', 'Cigna Dental', '2499682', '800-244-6224', 'cigna.com', NULL);

-- ============================================================
-- DENTAL PLANS (2026)
-- ============================================================

INSERT INTO dental_plans (id, plan_name, plan_type, carrier_id, states_eligible,
  deductible_individual, deductible_family, calendar_year_max, ortho_lifetime_max,
  ortho_covered, prev_diagnostic_pct, basic_restorative_pct, major_services_pct,
  ortho_pct, tmj_pct, is_dhmo, effective_date) VALUES
-- Delta Dental PPO (ID/OR/WA)
('e1000000-0000-0000-0000-000000000001',
 'Delta Dental PPO', 'PPO', 'd1000000-0000-0000-0000-000000000001',
 ARRAY['ID','OR','WA'], 50, 150, 1500, 1500,
 TRUE, 0, 10, 40, 50, 40, FALSE, '2026-01-01'),
-- Cigna Dental PPO (all other states)
('e1000000-0000-0000-0000-000000000002',
 'Cigna Dental PPO', 'PPO', 'd1000000-0000-0000-0000-000000000002',
 NULL, 50, 150, 1500, 1500,
 TRUE, 0, 10, 40, 50, 40, FALSE, '2026-01-01'),
-- Cigna DHMO (all states)
('e1000000-0000-0000-0000-000000000003',
 'Cigna Dental DHMO', 'DHMO', 'd1000000-0000-0000-0000-000000000002',
 NULL, 0, 0, NULL, NULL,
 FALSE, 5, 0, 0, 50, 0, TRUE, '2026-01-01');

-- Premiums (fictional estimates, marked as sample)
INSERT INTO dental_premiums (plan_id, coverage_tier, employee_monthly, employer_monthly) VALUES
('e1000000-0000-0000-0000-000000000001', 'EO', 8.50, 12.00),
('e1000000-0000-0000-0000-000000000001', 'ES', 22.00, 12.00),
('e1000000-0000-0000-0000-000000000001', 'EC', 18.00, 12.00),
('e1000000-0000-0000-0000-000000000001', 'EF', 28.00, 12.00),
('e1000000-0000-0000-0000-000000000002', 'EO', 8.50, 12.00),
('e1000000-0000-0000-0000-000000000002', 'ES', 22.00, 12.00),
('e1000000-0000-0000-0000-000000000002', 'EC', 18.00, 12.00),
('e1000000-0000-0000-0000-000000000002', 'EF', 28.00, 12.00),
('e1000000-0000-0000-0000-000000000003', 'EO', 5.00, 10.00),
('e1000000-0000-0000-0000-000000000003', 'ES', 14.00, 10.00),
('e1000000-0000-0000-0000-000000000003', 'EC', 12.00, 10.00),
('e1000000-0000-0000-0000-000000000003', 'EF', 20.00, 10.00);

-- ============================================================
-- DHMO PROVIDERS (50 Mock Dentists)
-- ============================================================

INSERT INTO dhmo_providers (id, npi, provider_name, practice_name, address, city, state, zip, phone, accepting_new_patients, languages, specialties) VALUES
('f1000000-0000-0000-0000-000000000001','1234567890','Dr. Maria Santos','Sunshine Family Dental','123 Pacific Ave','San Juan Capistrano','CA','92675','949-555-0101',TRUE,ARRAY['English','Spanish'],ARRAY['General Dentistry']),
('f1000000-0000-0000-0000-000000000002','1234567891','Dr. James Park','OC Dental Group','456 Crown Valley Pkwy','Laguna Niguel','CA','92677','949-555-0102',TRUE,ARRAY['English','Korean'],ARRAY['General Dentistry','Cosmetic']),
('f1000000-0000-0000-0000-000000000003','1234567892','Dr. Lisa Chen','Coastal Smiles','789 El Camino Real','San Clemente','CA','92672','949-555-0103',FALSE,ARRAY['English','Mandarin'],ARRAY['General Dentistry','Pediatric']),
('f1000000-0000-0000-0000-000000000004','1234567893','Dr. Robert Kim','Mission Dental Care','101 Mission Rd','Dana Point','CA','92629','949-555-0104',TRUE,ARRAY['English'],ARRAY['General Dentistry','Implants']),
('f1000000-0000-0000-0000-000000000005','1234567894','Dr. Angela Torres','South Orange County Dental','202 Avenida Vista','San Juan Capistrano','CA','92675','949-555-0105',TRUE,ARRAY['English','Spanish'],ARRAY['General Dentistry']),
('f1000000-0000-0000-0000-000000000006','1234567895','Dr. Michael Nguyen','Capistrano Dental Arts','303 Ortega Hwy','San Juan Capistrano','CA','92675','949-555-0106',TRUE,ARRAY['English','Vietnamese'],ARRAY['General Dentistry','Orthodontics']),
('f1000000-0000-0000-0000-000000000007','1234567896','Dr. Sarah Johnson','Hillside Dental','404 Moulton Pkwy','Laguna Hills','CA','92653','949-555-0107',TRUE,ARRAY['English'],ARRAY['General Dentistry']),
('f1000000-0000-0000-0000-000000000008','1234567897','Dr. David Lee','Premier Dental Associates','505 La Paz Rd','Laguna Hills','CA','92653','949-555-0108',FALSE,ARRAY['English','Korean','Mandarin'],ARRAY['General Dentistry','Periodontics']),
('f1000000-0000-0000-0000-000000000009','1234567898','Dr. Jessica Martinez','Beach Cities Dental','606 Main St','Huntington Beach','CA','92648','714-555-0109',TRUE,ARRAY['English','Spanish'],ARRAY['General Dentistry','Cosmetic']),
('f1000000-0000-0000-0000-000000000010','1234567899','Dr. Kevin Walsh','Newport Family Dental','707 Newport Blvd','Newport Beach','CA','92663','949-555-0110',TRUE,ARRAY['English'],ARRAY['General Dentistry']),
('f1000000-0000-0000-0000-000000000011','1234567900','Dr. Emily Patel','Irvine Dental Center','808 Alton Pkwy','Irvine','CA','92618','949-555-0111',TRUE,ARRAY['English','Hindi'],ARRAY['General Dentistry']),
('f1000000-0000-0000-0000-000000000012','1234567901','Dr. Carlos Rivera','AZ Family Dental','100 N Central Ave','Phoenix','AZ','85004','602-555-0112',TRUE,ARRAY['English','Spanish'],ARRAY['General Dentistry']),
('f1000000-0000-0000-0000-000000000013','1234567902','Dr. Patricia Wong','Desert Smiles Dental','200 E Camelback Rd','Phoenix','AZ','85016','602-555-0113',TRUE,ARRAY['English','Cantonese'],ARRAY['General Dentistry','Pediatric']),
('f1000000-0000-0000-0000-000000000014','1234567903','Dr. Thomas Brown','Scottsdale Premier Dental','300 N Scottsdale Rd','Scottsdale','AZ','85251','480-555-0114',TRUE,ARRAY['English'],ARRAY['General Dentistry','Implants']),
('f1000000-0000-0000-0000-000000000015','1234567904','Dr. Rachel Green','Denver Dental Studio','100 16th St Mall','Denver','CO','80202','720-555-0115',TRUE,ARRAY['English'],ARRAY['General Dentistry','Cosmetic']),
('f1000000-0000-0000-0000-000000000016','1234567905','Dr. Daniel Kim','Rocky Mountain Dental','200 E Colfax Ave','Denver','CO','80203','720-555-0116',TRUE,ARRAY['English','Korean'],ARRAY['General Dentistry']),
('f1000000-0000-0000-0000-000000000017','1234567906','Dr. Amanda Scott','Portland Dental Group','100 SW Broadway','Portland','OR','97205','503-555-0117',TRUE,ARRAY['English'],ARRAY['General Dentistry']),
('f1000000-0000-0000-0000-000000000018','1234567907','Dr. Brian Clark','Eastside Dental','200 NE Sandy Blvd','Portland','OR','97232','503-555-0118',TRUE,ARRAY['English','Spanish'],ARRAY['General Dentistry','Periodontics']),
('f1000000-0000-0000-0000-000000000019','1234567908','Dr. Nicole Adams','Boise Family Dentistry','100 W State St','Boise','ID','83702','208-555-0119',TRUE,ARRAY['English'],ARRAY['General Dentistry']),
('f1000000-0000-0000-0000-000000000020','1234567909','Dr. Steven Lopez','Garden City Dental','200 N Milwaukee','Boise','ID','83704','208-555-0120',TRUE,ARRAY['English','Spanish'],ARRAY['General Dentistry']),
-- Seattle/WA providers (will show Delta Dental for PPO)
('f1000000-0000-0000-0000-000000000021','1234567910','Dr. Jennifer Lee','Seattle Dental Arts','100 Pike St','Seattle','WA','98101','206-555-0121',TRUE,ARRAY['English','Korean'],ARRAY['General Dentistry','Cosmetic']),
('f1000000-0000-0000-0000-000000000022','1234567911','Dr. Mark Wilson','Capitol Hill Dental','200 Broadway E','Seattle','WA','98102','206-555-0122',TRUE,ARRAY['English'],ARRAY['General Dentistry']),
-- Texas
('f1000000-0000-0000-0000-000000000023','1234567912','Dr. Rosa Hernandez','Dallas Smiles Dental','100 Main St','Dallas','TX','75201','214-555-0123',TRUE,ARRAY['English','Spanish'],ARRAY['General Dentistry']),
('f1000000-0000-0000-0000-000000000024','1234567913','Dr. Andrew Miller','Uptown Dental Group','200 Cedar Springs Rd','Dallas','TX','75219','214-555-0124',TRUE,ARRAY['English'],ARRAY['General Dentistry','Implants']),
-- Nevada
('f1000000-0000-0000-0000-000000000025','1234567914','Dr. Christina Chang','Las Vegas Dental Center','100 Fremont St','Las Vegas','NV','89101','702-555-0125',TRUE,ARRAY['English','Mandarin'],ARRAY['General Dentistry']);

-- ============================================================
-- ADA PROCEDURE CODES (Key Dental Procedures)
-- ============================================================

INSERT INTO dental_procedure_codes (ada_code, description, category, service_class, frequency_limit, waiting_period_months, typical_fee_low, typical_fee_high, dhmo_copay, notes) VALUES
-- Diagnostic
('D0120','Periodic oral evaluation – established patient','Diagnostic','PREV_DIAG','2x per calendar year',0,55,85,5,'Standard recall exam'),
('D0150','Comprehensive oral evaluation – new/established patient','Diagnostic','PREV_DIAG','Once per 3 years',0,95,145,5,'New patient exam'),
('D0210','Intraoral – complete series of radiographic images','Diagnostic','PREV_DIAG','Once per 3-5 years',0,130,200,5,'FMX – full mouth x-rays'),
('D0220','Periapical radiographic image – first image','Diagnostic','PREV_DIAG','As needed',0,30,55,5,'Single PA x-ray'),
('D0272','Bitewing radiographic images – two images','Diagnostic','PREV_DIAG','1x per calendar year',0,55,90,5,'BWX – two films'),
('D0274','Bitewing radiographic images – four images','Diagnostic','PREV_DIAG','1x per calendar year',0,80,130,5,'BWX – four films'),
('D0330','Panoramic radiographic image','Diagnostic','PREV_DIAG','Once per 3-5 years',0,120,185,5,'Panorex – full jaw image'),
-- Preventive
('D1110','Prophylaxis – adult','Preventive','PREV_DIAG','2x per calendar year',0,95,145,5,'Adult cleaning'),
('D1120','Prophylaxis – child','Preventive','PREV_DIAG','2x per calendar year',0,65,95,5,'Child cleaning (under 14)'),
('D1208','Topical application of fluoride – adult','Preventive','PREV_DIAG','1x per calendar year',0,30,50,5,'Adult fluoride'),
('D1351','Sealant – per tooth','Preventive','PREV_DIAG','Once per tooth per lifetime (typically under 16)',0,35,65,15,'Pit and fissure sealant'),
-- Basic / Restorative
('D2140','Amalgam restoration, one surface, primary or permanent','Basic/Restorative','BASIC',NULL,0,130,185,25,'1-surface silver filling'),
('D2150','Amalgam restoration, two surfaces, primary or permanent','Basic/Restorative','BASIC',NULL,0,165,235,35,'2-surface silver filling'),
('D2160','Amalgam restoration, three surfaces, primary or permanent','Basic/Restorative','BASIC',NULL,0,195,275,45,'3-surface silver filling'),
('D2330','Resin-based composite, one surface, anterior','Basic/Restorative','BASIC',NULL,0,145,210,30,'1-surface white filling, front tooth'),
('D2331','Resin-based composite, two surfaces, anterior','Basic/Restorative','BASIC',NULL,0,185,265,40,'2-surface white filling, front tooth'),
('D2391','Resin-based composite, one surface, posterior – primary or permanent','Basic/Restorative','BASIC',NULL,0,150,225,30,'1-surface white filling, back tooth'),
('D2392','Resin-based composite, two surfaces, posterior – primary or permanent','Basic/Restorative','BASIC',NULL,0,195,280,40,'2-surface white filling, back tooth'),
('D2393','Resin-based composite, three surfaces, posterior – primary or permanent','Basic/Restorative','BASIC',NULL,0,230,320,50,'3-surface white filling, back tooth'),
('D2950','Core buildup, including any pins when required','Basic/Restorative','BASIC',NULL,0,185,285,55,'Build-up before crown'),
-- Major
('D2710','Crown – resin-based composite (indirect)','Major','MAJOR',NULL,12,650,950,175,'Resin crown'),
('D2740','Crown – porcelain/ceramic substrate','Major','MAJOR',NULL,12,1100,1650,225,'All-ceramic crown (PFZ/e.max)'),
('D2750','Crown – porcelain fused to high noble metal','Major','MAJOR',NULL,12,1050,1550,200,'PFM crown'),
('D2930','Prefabricated stainless steel crown – primary tooth','Major','MAJOR',NULL,0,250,400,50,'Stainless steel crown, child'),
-- Endodontics
('D3310','Endodontic therapy, anterior tooth (excluding final restoration)','Endodontics','BASIC',NULL,0,700,1050,175,'Root canal – front tooth'),
('D3320','Endodontic therapy, premolar tooth (excluding final restoration)','Endodontics','BASIC',NULL,0,850,1250,200,'Root canal – premolar'),
('D3330','Endodontic therapy, molar tooth (excluding final restoration)','Endodontics','BASIC',NULL,0,1000,1450,250,'Root canal – molar'),
-- Periodontics
('D4341','Periodontal scaling and root planing – four or more teeth per quadrant','Periodontics','BASIC',NULL,0,225,350,75,'SRP – quad, 4+ teeth'),
('D4342','Periodontal scaling and root planing – one to three teeth per quadrant','Periodontics','BASIC',NULL,0,185,275,60,'SRP – quad, 1-3 teeth'),
('D4910','Periodontal maintenance','Periodontics','BASIC','4x per calendar year after active treatment',0,110,175,30,'Perio maintenance – replaces prophy'),
-- Oral Surgery
('D7140','Extraction, erupted tooth or exposed root','OralSurgery','BASIC',NULL,0,145,225,35,'Simple extraction'),
('D7210','Extraction, erupted tooth requiring removal of bone and/or sectioning of tooth','OralSurgery','BASIC',NULL,0,250,385,75,'Surgical extraction'),
('D7240','Removal of impacted tooth – completely bony','OralSurgery','BASIC',NULL,0,325,500,125,'Fully impacted wisdom tooth'),
('D7241','Removal of impacted tooth – completely bony, with unusual surgical complications','OralSurgery','BASIC',NULL,0,425,650,175,'Complex impacted wisdom tooth'),
-- Orthodontia
('D8080','Comprehensive orthodontic treatment of adolescent dentition','Orthodontics','ORTHO',NULL,0,4500,6500,NULL,'Braces – teen. Not covered under DHMO.'),
('D8090','Comprehensive orthodontic treatment of adult dentition','Orthodontics','ORTHO',NULL,0,5000,7500,NULL,'Braces – adult. Not covered under DHMO.'),
('D8660','Pre-orthodontic examination','Orthodontics','ORTHO',NULL,0,95,145,NULL,'Ortho consult'),
('D8670','Periodic orthodontic treatment visit (as part of contract)','Orthodontics','ORTHO',NULL,0,0,0,NULL,'Monthly ortho adjustment'),
('D8680','Orthodontic retention (removal of appliances, construction and placement of retainer(s))','Orthodontics','ORTHO',NULL,0,350,600,NULL,'Retainers after braces'),
-- Adjunctive
('D9230','Inhalation of nitrous oxide / analgesia, anxiolysis','Adjunctive','BASIC',NULL,0,65,125,35,'Nitrous oxide sedation'),
('D9310','Consultation – diagnostic service provided by dentist or physician other than requesting dentist or physician','Adjunctive','PREV_DIAG',NULL,0,95,150,5,'Specialist consultation'),
('D9940','Occlusal guard, by report','Adjunctive','MAJOR',NULL,0,450,750,100,'Night guard for bruxism');

-- ============================================================
-- WORKERS (Fictional Demo Directory)
-- ============================================================

INSERT INTO workers (id, employee_id, first_name, last_name, email, hire_date, employment_type, avg_weekly_hours, employee_category, job_profile_id, organization_id, work_state, work_city, role) VALUES
-- Service Center / HR Team (fast-track, CA)
('91000000-0000-0000-0000-000000000000','ESI-10000','Nathan','Song','nathan.song@benefitsflow.demo','2024-01-15','FULL_TIME',40,'FAST_TRACK','c1000000-0000-0000-0000-000000000013','a1000000-0000-0000-0000-000000000009','CA','San Juan Capistrano','HRIS_ANALYST'),
('91000000-0000-0000-0000-000000000001','ESI-10001','Jordan','Rivera','jordan.rivera@benefitsflow.demo','2026-06-01','FULL_TIME',40,'FAST_TRACK','c1000000-0000-0000-0000-000000000001','a1000000-0000-0000-0000-000000000009','CA','San Juan Capistrano','HRIS_ANALYST'),
('91000000-0000-0000-0000-000000000002','ESI-10002','Taylor','Chen','taylor.chen@benefitsflow.demo','2026-05-15','FULL_TIME',40,'FAST_TRACK','c1000000-0000-0000-0000-000000000002','a1000000-0000-0000-0000-000000000009','CA','San Juan Capistrano','BENEFITS_PARTNER'),
('91000000-0000-0000-0000-000000000003','ESI-10003','Morgan','Walsh','morgan.walsh@benefitsflow.demo','2025-03-10','FULL_TIME',40,'FAST_TRACK','c1000000-0000-0000-0000-000000000003','a1000000-0000-0000-0000-000000000001','CA','San Juan Capistrano','HR_LEADERSHIP'),
-- SJC Facility – Nurses (fast-track, CA)
('91000000-0000-0000-0000-000000000004','ESI-10004','Elena','Vasquez','elena.vasquez@benefitsflow.demo','2026-06-15','FULL_TIME',36,'FAST_TRACK','c1000000-0000-0000-0000-000000000004','a1000000-0000-0000-0000-000000000004','CA','San Juan Capistrano','EMPLOYEE'),
('91000000-0000-0000-0000-000000000005','ESI-10005','Marcus','Williams','marcus.williams@benefitsflow.demo','2026-06-15','FULL_TIME',40,'FAST_TRACK','c1000000-0000-0000-0000-000000000004','a1000000-0000-0000-0000-000000000004','CA','San Juan Capistrano','EMPLOYEE'),
('91000000-0000-0000-0000-000000000006','ESI-10006','Priya','Sharma','priya.sharma@benefitsflow.demo','2026-04-20','FULL_TIME',40,'FAST_TRACK','c1000000-0000-0000-0000-000000000004','a1000000-0000-0000-0000-000000000004','CA','San Juan Capistrano','EMPLOYEE'),
('91000000-0000-0000-0000-000000000007','ESI-10007','Dmitri','Petrov','dmitri.petrov@benefitsflow.demo','2026-03-01','FULL_TIME',40,'FAST_TRACK','c1000000-0000-0000-0000-000000000005','a1000000-0000-0000-0000-000000000004','CA','San Juan Capistrano','MANAGER'),
-- SJC – Standard employees (dietary, housekeeping – 60-day wait)
('91000000-0000-0000-0000-000000000008','ESI-10008','Carmen','Lopez','carmen.lopez@benefitsflow.demo','2026-06-01','FULL_TIME',40,'STANDARD','c1000000-0000-0000-0000-000000000011','a1000000-0000-0000-0000-000000000004','CA','San Juan Capistrano','EMPLOYEE'),
('91000000-0000-0000-0000-000000000009','ESI-10009','James','Patterson','james.patterson@benefitsflow.demo','2026-05-15','FULL_TIME',40,'STANDARD','c1000000-0000-0000-0000-000000000012','a1000000-0000-0000-0000-000000000004','CA','San Juan Capistrano','EMPLOYEE'),
('91000000-0000-0000-0000-000000000010','ESI-10010','Fatima','Hassan','fatima.hassan@benefitsflow.demo','2026-04-01','FULL_TIME',32,'STANDARD','c1000000-0000-0000-0000-000000000010','a1000000-0000-0000-0000-000000000004','CA','San Juan Capistrano','EMPLOYEE'),
-- Portland Facility (OR – Delta Dental state)
('91000000-0000-0000-0000-000000000011','ESI-10011','Aisha','Montgomery','aisha.montgomery@benefitsflow.demo','2026-05-01','FULL_TIME',40,'FAST_TRACK','c1000000-0000-0000-0000-000000000004','a1000000-0000-0000-0000-000000000005','OR','Portland','EMPLOYEE'),
('91000000-0000-0000-0000-000000000012','ESI-10012','Sean','O Brien','sean.obrien@benefitsflow.demo','2026-04-15','FULL_TIME',40,'FAST_TRACK','c1000000-0000-0000-0000-000000000007','a1000000-0000-0000-0000-000000000005','OR','Portland','EMPLOYEE'),
('91000000-0000-0000-0000-000000000013','ESI-10013','Yuki','Tanaka','yuki.tanaka@benefitsflow.demo','2026-06-10','FULL_TIME',40,'STANDARD','c1000000-0000-0000-0000-000000000012','a1000000-0000-0000-0000-000000000005','OR','Portland','EMPLOYEE'),
-- Boise Facility (ID – Delta Dental state)
('91000000-0000-0000-0000-000000000014','ESI-10014','Robert','Johnson','robert.johnson@benefitsflow.demo','2026-03-15','FULL_TIME',40,'FAST_TRACK','c1000000-0000-0000-0000-000000000006','a1000000-0000-0000-0000-000000000006','ID','Boise','MANAGER'),
('91000000-0000-0000-0000-000000000015','ESI-10015','Maria','Gonzalez','maria.gonzalez@benefitsflow.demo','2026-05-20','FULL_TIME',40,'FAST_TRACK','c1000000-0000-0000-0000-000000000004','a1000000-0000-0000-0000-000000000006','ID','Boise','EMPLOYEE'),
('91000000-0000-0000-0000-000000000016','ESI-10016','Kevin','Park','kevin.park@benefitsflow.demo','2026-04-01','FULL_TIME',36,'STANDARD','c1000000-0000-0000-0000-000000000011','a1000000-0000-0000-0000-000000000006','ID','Boise','EMPLOYEE'),
-- Phoenix Facility (AZ – Cigna state)
('91000000-0000-0000-0000-000000000017','ESI-10017','Angela','Davis','angela.davis@benefitsflow.demo','2026-05-01','FULL_TIME',40,'FAST_TRACK','c1000000-0000-0000-0000-000000000009','a1000000-0000-0000-0000-000000000007','AZ','Phoenix','MANAGER'),
('91000000-0000-0000-0000-000000000018','ESI-10018','Miguel','Santos','miguel.santos@benefitsflow.demo','2026-05-15','FULL_TIME',40,'FAST_TRACK','c1000000-0000-0000-0000-000000000004','a1000000-0000-0000-0000-000000000007','AZ','Phoenix','EMPLOYEE'),
('91000000-0000-0000-0000-000000000019','ESI-10019','Linda','Thompson','linda.thompson@benefitsflow.demo','2026-06-01','FULL_TIME',40,'FAST_TRACK','c1000000-0000-0000-0000-000000000005','a1000000-0000-0000-0000-000000000007','AZ','Phoenix','EMPLOYEE'),
('91000000-0000-0000-0000-000000000020','ESI-10020','David','Brown','david.brown@benefitsflow.demo','2026-04-15','FULL_TIME',40,'STANDARD','c1000000-0000-0000-0000-000000000012','a1000000-0000-0000-0000-000000000007','AZ','Phoenix','EMPLOYEE'),
-- Denver Facility (CO – Cigna state)
('91000000-0000-0000-0000-000000000021','ESI-10021','Sofia','Rodriguez','sofia.rodriguez@benefitsflow.demo','2026-05-01','FULL_TIME',40,'FAST_TRACK','c1000000-0000-0000-0000-000000000007','a1000000-0000-0000-0000-000000000008','CO','Denver','EMPLOYEE'),
('91000000-0000-0000-0000-000000000022','ESI-10022','Christopher','Lee','christopher.lee@benefitsflow.demo','2026-04-20','FULL_TIME',40,'FAST_TRACK','c1000000-0000-0000-0000-000000000008','a1000000-0000-0000-0000-000000000008','CO','Denver','EMPLOYEE'),
-- Part-time workers (Limited benefit tier)
('91000000-0000-0000-0000-000000000023','ESI-10023','Ashley','Kim','ashley.kim@benefitsflow.demo','2026-05-01','PART_TIME',30,'STANDARD','c1000000-0000-0000-0000-000000000012','a1000000-0000-0000-0000-000000000004','CA','San Juan Capistrano','EMPLOYEE'),
('91000000-0000-0000-0000-000000000024','ESI-10024','Brandon','White','brandon.white@benefitsflow.demo','2026-04-15','PART_TIME',31,'STANDARD','c1000000-0000-0000-0000-000000000011','a1000000-0000-0000-0000-000000000007','AZ','Phoenix','EMPLOYEE'),
-- On-call (Casual – no benefits)
('91000000-0000-0000-0000-000000000025','ESI-10025','Rachel','Green','rachel.green@benefitsflow.demo','2026-05-20','ON_CALL',15,'STANDARD','c1000000-0000-0000-0000-000000000004','a1000000-0000-0000-0000-000000000004','CA','San Juan Capistrano','EMPLOYEE');

-- ============================================================
-- DEPENDENTS (Realistic scenarios for testing)
-- ============================================================

INSERT INTO dependents (worker_id, first_name, last_name, date_of_birth, relationship, has_other_employer_coverage, doc_status) VALUES
-- Jordan Rivera (w001) – married, spouse has other coverage (surcharge triggers)
('91000000-0000-0000-0000-000000000001','Sarah','Rivera','1990-03-15','SPOUSE',TRUE,'VERIFIED'),
('91000000-0000-0000-0000-000000000001','Emma','Rivera','2018-07-22','CHILD',FALSE,'VERIFIED'),
('91000000-0000-0000-0000-000000000001','Noah','Rivera','2020-11-05','CHILD',FALSE,'VERIFIED'),
-- Elena Vasquez (w004) – two kids, orthodontia case
('91000000-0000-0000-0000-000000000004','Carlos','Vasquez','2012-04-10','CHILD',FALSE,'VERIFIED'),
('91000000-0000-0000-0000-000000000004','Isabella','Vasquez','2015-09-18','CHILD',FALSE,'VERIFIED'),
-- Marcus Williams (w005) – domestic partner (limited plan eligibility)
('91000000-0000-0000-0000-000000000005','Alex','Williams','1992-06-30','DOMESTIC_PARTNER',FALSE,'PENDING'),
-- Maria Gonzalez (w015) – spouse, no other coverage
('91000000-0000-0000-0000-000000000015','Diego','Gonzalez','1988-12-01','SPOUSE',FALSE,'VERIFIED'),
('91000000-0000-0000-0000-000000000015','Luna','Gonzalez','2019-05-14','CHILD',FALSE,'UPLOADED'),
-- Angela Davis (w017) – disabled adult child over 26
('91000000-0000-0000-0000-000000000017','Marcus','Davis','1997-01-25','DISABLED_ADULT_CHILD',FALSE,'VERIFIED');

-- ============================================================
-- DENTAL ELECTIONS (Mix of enrolled, waived, in-progress)
-- ============================================================

INSERT INTO dental_elections (worker_id, plan_id, coverage_tier, effective_date, enrollment_status, event_type, submitted_at, primary_dhmo_provider_id) VALUES
-- Jordan Rivera – PPO Family (CA → Cigna)
('91000000-0000-0000-0000-000000000001','e1000000-0000-0000-0000-000000000002','EF','2026-07-01','ACTIVE','NEW_HIRE',NOW() - INTERVAL '10 days', NULL),
-- Taylor Chen – DHMO Employee Only (CA)
('91000000-0000-0000-0000-000000000002','e1000000-0000-0000-0000-000000000003','EO','2026-06-01','ACTIVE','NEW_HIRE',NOW() - INTERVAL '20 days','f1000000-0000-0000-0000-000000000001'),
-- Morgan Walsh – PPO Employee+Spouse (CA)
('91000000-0000-0000-0000-000000000003','e1000000-0000-0000-0000-000000000002','ES','2026-04-01','ACTIVE','NEW_HIRE',NOW() - INTERVAL '80 days', NULL),
-- Elena Vasquez – PPO Family (CA) – ortho case
('91000000-0000-0000-0000-000000000004','e1000000-0000-0000-0000-000000000002','EF','2026-07-01','ACTIVE','NEW_HIRE',NOW() - INTERVAL '5 days', NULL),
-- Priya Sharma – in progress
('91000000-0000-0000-0000-000000000006','e1000000-0000-0000-0000-000000000002','EF',NULL,'IN_PROGRESS','NEW_HIRE',NULL, NULL),
-- Aisha Montgomery – Delta Dental PPO (OR)
('91000000-0000-0000-0000-000000000011','e1000000-0000-0000-0000-000000000001','EO','2026-06-01','ACTIVE','NEW_HIRE',NOW() - INTERVAL '30 days', NULL),
-- Robert Johnson – Delta Dental PPO (ID)
('91000000-0000-0000-0000-000000000014','e1000000-0000-0000-0000-000000000001','ES','2026-04-01','ACTIVE','NEW_HIRE',NOW() - INTERVAL '75 days', NULL),
-- Angela Davis (AZ – Cigna) – waived dental
('91000000-0000-0000-0000-000000000017',NULL,NULL,NULL,'WAIVED','NEW_HIRE',NOW() - INTERVAL '50 days', NULL),
-- Miguel Santos – DHMO + primary provider
('91000000-0000-0000-0000-000000000018','e1000000-0000-0000-0000-000000000003','EF','2026-06-01','ACTIVE','NEW_HIRE',NOW() - INTERVAL '25 days','f1000000-0000-0000-0000-000000000012');

UPDATE dental_elections SET waived = TRUE WHERE enrollment_status = 'WAIVED';

-- ============================================================
-- DENTAL ACCUMULATORS (YTD usage – 2026)
-- ============================================================

INSERT INTO dental_accumulators (worker_id, plan_year, deductible_individual_used, deductible_family_used, annual_max_used, ortho_lifetime_used) VALUES
-- Jordan Rivera – family on PPO, deductible met, significant usage
('91000000-0000-0000-0000-000000000001',2026,50,150,847.50,0),
-- Morgan Walsh – some preventive + basic
('91000000-0000-0000-0000-000000000003',2026,50,50,285.00,0),
-- Elena Vasquez – ortho started for child (Carlos), partial lifetime used
('91000000-0000-0000-0000-000000000004',2026,50,150,1500.00,750.00),
-- Aisha Montgomery – preventive only (OR)
('91000000-0000-0000-0000-000000000011',2026,0,0,0,0),
-- Robert Johnson – preventive + one crown (ID)
('91000000-0000-0000-0000-000000000014',2026,50,100,680.00,0);

-- ============================================================
-- INBOX TASKS (Open enrollment tasks for new hires)
-- ============================================================

INSERT INTO inbox_tasks (worker_id, task_type, title, description, due_date, status) VALUES
('91000000-0000-0000-0000-000000000006','BENEFIT_CHANGE_NEW_HIRE','Benefit Change – New Hire',
 'Complete your benefits enrollment. You have until your 30-day deadline to enroll in Medical, Dental, Vision, FSA, and Life benefits.',
 '2026-05-20','PENDING'),
('91000000-0000-0000-0000-000000000008','BENEFIT_CHANGE_NEW_HIRE','Benefit Change – New Hire',
 'Complete your benefits enrollment. Coverage begins the first of the month after 60 days of employment.',
 '2026-07-01','PENDING'),
('91000000-0000-0000-0000-000000000013','BENEFIT_CHANGE_NEW_HIRE','Benefit Change – New Hire',
 'Complete your benefits enrollment.',
 '2026-07-10','PENDING'),
('91000000-0000-0000-0000-000000000019','BENEFIT_CHANGE_NEW_HIRE','Benefit Change – New Hire',
 'Complete your benefits enrollment.',
 '2026-07-01','IN_PROGRESS'),
-- QLE task for worker with birth event
('91000000-0000-0000-0000-000000000015','BENEFIT_CHANGE_QLE','Benefit Change – Qualifying Life Event',
 'You reported a qualifying life event (birth of child). Update your benefits within 30 days.',
 '2026-07-14','PENDING');

-- ============================================================
-- QLE EVENTS
-- ============================================================

INSERT INTO qle_events (worker_id, qle_code, event_date, deadline, status, documentation_submitted) VALUES
('91000000-0000-0000-0000-000000000015','QLE_BIRTH','2026-06-14','2026-07-14','PENDING',FALSE);

-- ============================================================
-- VISION ELECTIONS (Sample)
-- ============================================================

INSERT INTO vision_elections (worker_id, plan_name, coverage_tier, effective_date, enrollment_status) VALUES
('91000000-0000-0000-0000-000000000001','VSP Choice','EF','2026-07-01','ACTIVE'),
('91000000-0000-0000-0000-000000000002','VSP Choice','EO','2026-06-01','ACTIVE'),
('91000000-0000-0000-0000-000000000003','VSP Choice','ES','2026-04-01','ACTIVE'),
('91000000-0000-0000-0000-000000000004','VSP Choice','EF','2026-07-01','ACTIVE'),
('91000000-0000-0000-0000-000000000011','VSP Choice','EO','2026-06-01','ACTIVE');

-- ============================================================
-- ENROLLMENT EVENTS (Timeline entries)
-- ============================================================

INSERT INTO enrollment_events (worker_id, event_type, event_date, description) VALUES
('91000000-0000-0000-0000-000000000001','DENTAL_ENROLLED',NOW() - INTERVAL '10 days','Enrolled in Cigna Dental PPO – Family coverage'),
('91000000-0000-0000-0000-000000000001','DEPENDENT_ADDED',NOW() - INTERVAL '10 days','Added dependent: Sarah Rivera (Spouse)'),
('91000000-0000-0000-0000-000000000001','DEPENDENT_ADDED',NOW() - INTERVAL '10 days','Added dependent: Emma Rivera (Child)'),
('91000000-0000-0000-0000-000000000001','DEPENDENT_ADDED',NOW() - INTERVAL '10 days','Added dependent: Noah Rivera (Child)'),
('91000000-0000-0000-0000-000000000002','DENTAL_ENROLLED',NOW() - INTERVAL '20 days','Enrolled in Cigna Dental DHMO – Employee Only. Primary dentist: Dr. Maria Santos'),
('91000000-0000-0000-0000-000000000004','DENTAL_ENROLLED',NOW() - INTERVAL '5 days','Enrolled in Cigna Dental PPO – Family coverage'),
('91000000-0000-0000-0000-000000000017','DENTAL_WAIVED',NOW() - INTERVAL '50 days','Waived dental coverage');
