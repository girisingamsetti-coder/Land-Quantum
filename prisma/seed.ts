import { PrismaClient } from '@prisma/client';

const db = new PrismaClient({ log: [] });

// Pre-computed bcrypt hash for 'Admin@12345' (12 rounds)
const PWD_HASH = '$2b$12$FobY7wlA2K6HWVErFj1kwuZ6hkUOrVVCcUWcQ.lB4U5HQHqwI/M4u';

async function main() {
  console.log('Seeding database...');

  // ============ ROLES ============
  const superAdminPerms = JSON.stringify(['*']);
  const landsPerms = JSON.stringify(['land:view','land:create','land:edit','application:view','application:review','application:approve','eligibility:review','eligibility:approve','possession:manage']);
  const techPerms = JSON.stringify(['dpr:view','dpr:review','dpr:approve','application:view','document:view','document:upload']);
  const financePerms = JSON.stringify(['payment:view','payment:manage','payment:approve','refund:manage','penalty:manage','report:finance']);
  const monitoringPerms = JSON.stringify(['construction:view','construction:update','compliance:view','compliance:manage','report:construction']);
  const grievancePerms = JSON.stringify(['grievance:view','grievance:manage','grievance:resolve','appeal:view','appeal:manage']);
  const investorPerms = JSON.stringify(['application:create','application:view:own','document:upload:own','payment:view:own','grievance:create:own']);
  const publicPerms = JSON.stringify(['land:view:published','public:info']);

  const roles = await Promise.all([
    db.role.upsert({ where: { name: 'Super Admin' }, update: {}, create: { name: 'Super Admin', description: 'Full system access', permissions: superAdminPerms, isSystem: true } }),
    db.role.upsert({ where: { name: 'System Administrator' }, update: {}, create: { name: 'System Administrator', description: 'Users, roles, settings', permissions: JSON.stringify(['user:manage','role:manage','settings:manage','workflow:configure']), isSystem: true } }),
    db.role.upsert({ where: { name: 'APCRDA Lands Officer' }, update: {}, create: { name: 'APCRDA Lands Officer', description: 'Land inventory, eligibility, allotment, possession', permissions: landsPerms, isSystem: true } }),
    db.role.upsert({ where: { name: 'Planning Officer' }, update: {}, create: { name: 'Planning Officer', description: 'Land use, planning, FSI/FAR, building approvals', permissions: JSON.stringify(['land:view','land:edit','planning:manage','building:view','building:approve']), isSystem: true } }),
    db.role.upsert({ where: { name: 'Technical Reviewer' }, update: {}, create: { name: 'Technical Reviewer', description: 'DPR and technical review', permissions: techPerms, isSystem: true } }),
    db.role.upsert({ where: { name: 'Economic Development Officer' }, update: {}, create: { name: 'Economic Development Officer', description: 'Economic scoring and development review', permissions: JSON.stringify(['economic:view','economic:review','economic:approve','application:view']), isSystem: true } }),
    db.role.upsert({ where: { name: 'LASC Member' }, update: {}, create: { name: 'LASC Member', description: 'LASC cases and recommendations', permissions: JSON.stringify(['lasc:view','lasc:review','lasc:recommend','application:view']), isSystem: true } }),
    db.role.upsert({ where: { name: 'GoM Secretariat' }, update: {}, create: { name: 'GoM Secretariat', description: 'GoM proposals', permissions: JSON.stringify(['gom:view','gom:review','gom:recommend']), isSystem: true } }),
    db.role.upsert({ where: { name: 'Cabinet Sub-Committee Secretariat' }, update: {}, create: { name: 'Cabinet Sub-Committee Secretariat', description: 'Cabinet sub-committee workflow', permissions: JSON.stringify(['cabinet:view','cabinet:review','cabinet:recommend']), isSystem: true } }),
    db.role.upsert({ where: { name: 'Authority Secretariat' }, update: {}, create: { name: 'Authority Secretariat', description: 'Authority approvals', permissions: JSON.stringify(['authority:view','authority:review','authority:approve']), isSystem: true } }),
    db.role.upsert({ where: { name: 'Finance Officer' }, update: {}, create: { name: 'Finance Officer', description: 'Payments, dues, refunds, penalties', permissions: financePerms, isSystem: true } }),
    db.role.upsert({ where: { name: 'Legal Officer' }, update: {}, create: { name: 'Legal Officer', description: 'Legal review, agreement, registration', permissions: JSON.stringify(['legal:view','legal:review','agreement:view','agreement:approve']), isSystem: true } }),
    db.role.upsert({ where: { name: 'Monitoring Officer' }, update: {}, create: { name: 'Monitoring Officer', description: 'Construction and compliance', permissions: monitoringPerms, isSystem: true } }),
    db.role.upsert({ where: { name: 'Grievance Officer' }, update: {}, create: { name: 'Grievance Officer', description: 'Grievances and appeals', permissions: grievancePerms, isSystem: true } }),
    db.role.upsert({ where: { name: 'Auditor' }, update: {}, create: { name: 'Auditor', description: 'Read-only access + audit reports', permissions: JSON.stringify(['audit:view','report:view','application:view']), isSystem: true } }),
    db.role.upsert({ where: { name: 'Investor' }, update: {}, create: { name: 'Investor', description: 'Own applications only', permissions: investorPerms, isSystem: true } }),
    db.role.upsert({ where: { name: 'Public User' }, update: {}, create: { name: 'Public User', description: 'Published information only', permissions: publicPerms, isSystem: true } }),
  ]);

  const roleMap: Record<string, string> = {};
  roles.forEach(r => { roleMap[r.name] = r.id; });

  // ============ DEPARTMENTS ============
  const depts = await Promise.all([
    db.department.upsert({ where: { code: 'ADMIN' }, update: {}, create: { name: 'Administration', code: 'ADMIN' } }),
    db.department.upsert({ where: { code: 'LANDS' }, update: {}, create: { name: 'Lands & Survey', code: 'LANDS' } }),
    db.department.upsert({ where: { code: 'PLANNING' }, update: {}, create: { name: 'Town Planning', code: 'PLANNING' } }),
    db.department.upsert({ where: { code: 'TECHNICAL' }, update: {}, create: { name: 'Technical Review', code: 'TECHNICAL' } }),
    db.department.upsert({ where: { code: 'FINANCE' }, update: {}, create: { name: 'Finance & Accounts', code: 'FINANCE' } }),
    db.department.upsert({ where: { code: 'LEGAL' }, update: {}, create: { name: 'Legal', code: 'LEGAL' } }),
    db.department.upsert({ where: { code: 'MONITORING' }, update: {}, create: { name: 'Monitoring & Compliance', code: 'MONITORING' } }),
    db.department.upsert({ where: { code: 'GRIEVANCE' }, update: {}, create: { name: 'Grievance Cell', code: 'GRIEVANCE' } }),
    db.department.upsert({ where: { code: 'ED' }, update: {}, create: { name: 'Economic Development', code: 'ED' } }),
  ]);
  const deptMap: Record<string, string> = {};
  depts.forEach(d => { deptMap[d.code] = d.id; });

  // ============ ZONES ============
  const zones = await Promise.all([
    db.zone.upsert({ where: { code: 'Z1' }, update: {}, create: { name: 'Core Capital Zone', code: 'Z1', description: 'Primary government and institutional area' } }),
    db.zone.upsert({ where: { code: 'Z2' }, update: {}, create: { name: 'Business District', code: 'Z2', description: 'Central business and commercial hub' } }),
    db.zone.upsert({ where: { code: 'Z3' }, update: {}, create: { name: 'Knowledge City', code: 'Z3', description: 'Education, IT, and research institutions' } }),
    db.zone.upsert({ where: { code: 'Z4' }, update: {}, create: { name: 'Industrial Zone', code: 'Z4', description: 'Manufacturing and industrial development' } }),
    db.zone.upsert({ where: { code: 'Z5' }, update: {}, create: { name: 'Residential Zone', code: 'Z5', description: 'High-density residential development' } }),
  ]);
  const zoneMap: Record<string, string> = {};
  zones.forEach(z => { zoneMap[z.code] = z.id; });

  // ============ LAND USES ============
  const landUses = await Promise.all([
    db.landUse.upsert({ where: { code: 'COMM' }, update: {}, create: { name: 'Commercial', code: 'COMM' } }),
    db.landUse.upsert({ where: { code: 'RESI' }, update: {}, create: { name: 'Residential', code: 'RESI' } }),
    db.landUse.upsert({ where: { code: 'MIXED' }, update: {}, create: { name: 'Mixed Use', code: 'MIXED' } }),
    db.landUse.upsert({ where: { code: 'INDUS' }, update: {}, create: { name: 'Industrial', code: 'INDUS' } }),
    db.landUse.upsert({ where: { code: 'INST' }, update: {}, create: { name: 'Institutional', code: 'INST' } }),
    db.landUse.upsert({ where: { code: 'IT' }, update: {}, create: { name: 'IT/ITES', code: 'IT' } }),
    db.landUse.upsert({ where: { code: 'HOSP' }, update: {}, create: { name: 'Hospitality', code: 'HOSP' } }),
    db.landUse.upsert({ where: { code: 'HEALTH' }, update: {}, create: { name: 'Healthcare', code: 'HEALTH' } }),
  ]);
  const luMap: Record<string, string> = {};
  landUses.forEach(l => { luMap[l.code] = l.id; });

  // ============ ALLOTMENT MODES ============
  const modes = await Promise.all([
    db.allotmentMode.upsert({ where: { code: 'NOM' }, update: {}, create: { name: 'Nomination / Suo Moto', code: 'NOM' } }),
    db.allotmentMode.upsert({ where: { code: 'QBS' }, update: {}, create: { name: 'Quality-Based Selection', code: 'QBS' } }),
    db.allotmentMode.upsert({ where: { code: 'QCPS' }, update: {}, create: { name: 'Quality-cum-Price Selection', code: 'QCPS' } }),
    db.allotmentMode.upsert({ where: { code: 'ETENDER' }, update: {}, create: { name: 'Public Tender / e-Tender', code: 'ETENDER' } }),
    db.allotmentMode.upsert({ where: { code: 'EAUCTION' }, update: {}, create: { name: 'Public Auction / e-Auction', code: 'EAUCTION' } }),
    db.allotmentMode.upsert({ where: { code: 'DRAW' }, update: {}, create: { name: 'Randomized Selection / Draw of Lots', code: 'DRAW' } }),
  ]);
  const modeMap: Record<string, string> = {};
  modes.forEach(m => { modeMap[m.code] = m.id; });

  // ============ SECTORS ============
  const sectors = ['IT & ITES', 'Real Estate', 'Healthcare', 'Education', 'Hospitality & Tourism', 'Manufacturing', 'Financial Services', 'Retail', 'Logistics', 'Energy', 'Agriculture', 'Media & Entertainment'];
  await Promise.all(sectors.map((s, i) =>
    db.sector.upsert({ where: { code: `SEC${i + 1}` }, update: {}, create: { name: s, code: `SEC${i + 1}`, priority: i + 1 } })
  ));

  // ============ USERS ============
  const pwd = PWD_HASH;
  const users = await Promise.all([
    db.user.upsert({ where: { email: 'admin@amaravati-demo.gov.in' }, update: {}, create: { email: 'admin@amaravati-demo.gov.in', password: pwd, name: 'R. Venkateshwara Rao', roleId: roleMap['Super Admin'], departmentId: deptMap['ADMIN'], designation: 'Commissioner', phone: '+91-9876543210', isActive: true } }),
    db.user.upsert({ where: { email: 'lands@amaravati-demo.gov.in' }, update: {}, create: { email: 'lands@amaravati-demo.gov.in', password: pwd, name: 'Anjana', roleId: roleMap['APCRDA Lands Officer'], departmentId: deptMap['LANDS'], designation: 'Deputy Commissioner', phone: '+91-9876543211' } }),
    db.user.upsert({ where: { email: 'technical@amaravati-demo.gov.in' }, update: {}, create: { email: 'technical@amaravati-demo.gov.in', password: pwd, name: 'M. Suresh Babu', roleId: roleMap['Technical Reviewer'], departmentId: deptMap['TECHNICAL'], designation: 'Chief Engineer', phone: '+91-9876543212' } }),
    db.user.upsert({ where: { email: 'finance@amaravati-demo.gov.in' }, update: {}, create: { email: 'finance@amaravati-demo.gov.in', password: pwd, name: 'K. Padmavathi', roleId: roleMap['Finance Officer'], departmentId: deptMap['FINANCE'], designation: 'Finance Controller', phone: '+91-9876543213' } }),
    db.user.upsert({ where: { email: 'monitoring@amaravati-demo.gov.in' }, update: {}, create: { email: 'monitoring@amaravati-demo.gov.in', password: pwd, name: 'P J Raju', roleId: roleMap['Monitoring Officer'], departmentId: deptMap['MONITORING'], designation: 'Director', phone: '+91-9876543214' } }),
    db.user.upsert({ where: { email: 'grievance@amaravati-demo.gov.in' }, update: {}, create: { email: 'grievance@amaravati-demo.gov.in', password: pwd, name: 'A. Nagendra', roleId: roleMap['Grievance Officer'], departmentId: deptMap['GRIEVANCE'], designation: 'Grievance Officer', phone: '+91-9876543215' } }),
    db.user.upsert({ where: { email: 'investor@amaravati-demo.in' }, update: {}, create: { email: 'investor@amaravati-demo.in', password: pwd, name: 'D. Ramachandra Reddy', roleId: roleMap['Investor'], designation: 'Director', phone: '+91-9876543216' } }),
  ]);
  const userMap: Record<string, string> = {};
  users.forEach(u => { userMap[u.email] = u.id; });

  // ============ WORKFLOW CONFIG ============
  const workflowStages = [
    { stageName: 'Application', stageOrder: 1, ownerRole: 'Investor', slaDays: 3, nextStages: '[]' },
    { stageName: 'Eligibility', stageOrder: 2, ownerRole: 'APCRDA Lands Officer', slaDays: 7, nextStages: '["DPR Review"]' },
    { stageName: 'DPR Review', stageOrder: 3, ownerRole: 'Technical Reviewer', slaDays: 14, nextStages: '["Economic Review"]' },
    { stageName: 'Economic Review', stageOrder: 4, ownerRole: 'Economic Development Officer', slaDays: 10, nextStages: '["LASC"]' },
    { stageName: 'LASC', stageOrder: 5, ownerRole: 'LASC Member', slaDays: 21, nextStages: '["GoM"]' },
    { stageName: 'GoM', stageOrder: 6, ownerRole: 'GoM Secretariat', slaDays: 14, nextStages: '["Cabinet Sub-Committee","Authority Approval"]' },
    { stageName: 'Cabinet Sub-Committee', stageOrder: 7, ownerRole: 'Cabinet Sub-Committee Secretariat', slaDays: 14, isOptional: true, nextStages: '["Authority Approval"]' },
    { stageName: 'Authority Approval', stageOrder: 8, ownerRole: 'Authority Secretariat', slaDays: 14, nextStages: '["Cabinet Approval","Government Order"]' },
    { stageName: 'Cabinet Approval', stageOrder: 9, ownerRole: 'Cabinet Sub-Committee Secretariat', slaDays: 21, isOptional: true, nextStages: '["Government Order"]' },
    { stageName: 'Government Order', stageOrder: 10, ownerRole: 'Legal Officer', slaDays: 10, nextStages: '["LOI"]' },
    { stageName: 'LOI', stageOrder: 11, ownerRole: 'APCRDA Lands Officer', slaDays: 7, nextStages: '["Payment"]' },
    { stageName: 'Payment', stageOrder: 12, ownerRole: 'Finance Officer', slaDays: 14, nextStages: '["Revised DPR"]' },
    { stageName: 'Revised DPR', stageOrder: 13, ownerRole: 'Technical Reviewer', slaDays: 14, nextStages: '["Agreement"]' },
    { stageName: 'Agreement', stageOrder: 14, ownerRole: 'Legal Officer', slaDays: 14, nextStages: '["Possession"]' },
    { stageName: 'Possession', stageOrder: 15, ownerRole: 'APCRDA Lands Officer', slaDays: 7, nextStages: '["Building Permission"]' },
    { stageName: 'Building Permission', stageOrder: 16, ownerRole: 'Planning Officer', slaDays: 21, nextStages: '["Construction"]' },
    { stageName: 'Construction', stageOrder: 17, ownerRole: 'Monitoring Officer', slaDays: 365, nextStages: '["Compliance"]' },
    { stageName: 'Compliance', stageOrder: 18, ownerRole: 'Monitoring Officer', slaDays: 365, nextStages: '[]' },
  ];
  await Promise.all(workflowStages.map(s =>
    db.workflowConfig.upsert({ where: { stageName: s.stageName }, update: {}, create: {
      stageName: s.stageName, stageOrder: s.stageOrder, ownerRole: s.ownerRole,
      slaDays: s.slaDays, isOptional: s.isOptional || false,
      nextStages: s.nextStages,
      decisionOptions: '["Proceed","Proceed with Conditions","Return","Reject","Defer"]',
    } })
  ));

  // ============ SYSTEM SETTINGS ============
  const settings = [
    { key: 'cabinet_approval_rules', value: JSON.stringify({ acreage_threshold: 10, land_value_threshold: 500000000, concessional_rate: true, sensitive_categories: ['Religious', 'Forest', 'Water Body'] }), category: 'Workflow', label: 'Cabinet Approval Decision Rules' },
    { key: 'penalty_rate', value: '0.02', category: 'Finance', label: 'Penalty Interest Rate (%)' },
    { key: 'loi_validity_days', value: '90', category: 'Workflow', label: 'LOI Validity (days)' },
    { key: 'application_fee', value: '10000', category: 'Finance', label: 'Application Fee (INR)' },
    { key: 'emd_percentage', value: '5', category: 'Finance', label: 'EMD Percentage (%)' },
  ];
  await Promise.all(settings.map(s =>
    db.systemSetting.upsert({ where: { key: s.key }, update: {}, create: s })
  ));

  // ============ LAND PARCELS (25) ============
  const parcelData = [
    { plotId: 'APCRDA-P-001', survey: 'SV/45/1', zone: 'Z1', lu: 'COMM', extent: 2.5, price: 125000000, fsi: 3.5, theme: 'Finance City', status: 'Allotted' },
    { plotId: 'APCRDA-P-002', survey: 'SV/45/2', zone: 'Z1', lu: 'INST', extent: 5.0, price: 150000000, fsi: 2.5, theme: 'Justice City', status: 'Allotted' },
    { plotId: 'APCRDA-P-003', survey: 'SV/46/1', zone: 'Z2', lu: 'COMM', extent: 3.0, price: 180000000, fsi: 4.0, theme: 'Business Hub', status: 'Under Application' },
    { plotId: 'APCRDA-P-004', survey: 'SV/46/2', zone: 'Z2', lu: 'MIXED', extent: 4.5, price: 225000000, fsi: 3.5, theme: 'Business Hub', status: 'Published' },
    { plotId: 'APCRDA-P-005', survey: 'SV/47/1', zone: 'Z2', lu: 'HOSP', extent: 2.0, price: 100000000, fsi: 3.0, theme: 'Hospitality District', status: 'Published' },
    { plotId: 'APCRDA-P-006', survey: 'SV/47/2', zone: 'Z3', lu: 'IT', extent: 6.0, price: 180000000, fsi: 3.5, theme: 'Knowledge City', status: 'Allotted' },
    { plotId: 'APCRDA-P-007', survey: 'SV/48/1', zone: 'Z3', lu: 'IT', extent: 8.0, price: 240000000, fsi: 4.0, theme: 'Knowledge City', status: 'Published' },
    { plotId: 'APCRDA-P-008', survey: 'SV/48/2', zone: 'Z3', lu: 'INST', extent: 10.0, price: 200000000, fsi: 2.0, theme: 'Education Hub', status: 'Published' },
    { plotId: 'APCRDA-P-009', survey: 'SV/49/1', zone: 'Z4', lu: 'INDUS', extent: 15.0, price: 300000000, fsi: 1.5, theme: 'Industrial Park', status: 'Published' },
    { plotId: 'APCRDA-P-010', survey: 'SV/49/2', zone: 'Z4', lu: 'INDUS', extent: 12.0, price: 240000000, fsi: 1.5, theme: 'Industrial Park', status: 'Under Application' },
    { plotId: 'APCRDA-P-011', survey: 'SV/50/1', zone: 'Z4', lu: 'INDUS', extent: 20.0, price: 400000000, fsi: 1.5, theme: 'Mega Industrial Zone', status: 'Published' },
    { plotId: 'APCRDA-P-012', survey: 'SV/50/2', zone: 'Z5', lu: 'RESI', extent: 1.5, price: 75000000, fsi: 3.0, theme: 'Residential District', status: 'Allotted' },
    { plotId: 'APCRDA-P-013', survey: 'SV/51/1', zone: 'Z5', lu: 'RESI', extent: 2.0, price: 100000000, fsi: 3.0, theme: 'Residential District', status: 'Published' },
    { plotId: 'APCRDA-P-014', survey: 'SV/51/2', zone: 'Z5', lu: 'MIXED', extent: 3.0, price: 150000000, fsi: 3.5, theme: 'Mixed Use District', status: 'Published' },
    { plotId: 'APCRDA-P-015', survey: 'SV/52/1', zone: 'Z1', lu: 'COMM', extent: 4.0, price: 200000000, fsi: 4.0, theme: 'Finance City', status: 'Reserved' },
    { plotId: 'APCRDA-P-016', survey: 'SV/52/2', zone: 'Z2', lu: 'COMM', extent: 5.0, price: 250000000, fsi: 4.5, theme: 'CBD Extension', status: 'Published' },
    { plotId: 'APCRDA-P-017', survey: 'SV/53/1', zone: 'Z3', lu: 'HEALTH', extent: 7.0, price: 210000000, fsi: 2.5, theme: 'Health City', status: 'Published' },
    { plotId: 'APCRDA-P-018', survey: 'SV/53/2', zone: 'Z2', lu: 'MIXED', extent: 3.5, price: 175000000, fsi: 3.5, theme: 'Business Hub', status: 'Under Application' },
    { plotId: 'APCRDA-P-019', survey: 'SV/54/1', zone: 'Z4', lu: 'INDUS', extent: 25.0, price: 500000000, fsi: 1.5, theme: 'Mega Industrial Zone', status: 'Published' },
    { plotId: 'APCRDA-P-020', survey: 'SV/54/2', zone: 'Z3', lu: 'IT', extent: 10.0, price: 300000000, fsi: 4.0, theme: 'IT Corridor', status: 'Allotted' },
    { plotId: 'APCRDA-P-021', survey: 'SV/55/1', zone: 'Z5', lu: 'RESI', extent: 1.0, price: 50000000, fsi: 3.0, theme: 'Residential District', status: 'Published' },
    { plotId: 'APCRDA-P-022', survey: 'SV/55/2', zone: 'Z1', lu: 'INST', extent: 8.0, price: 160000000, fsi: 2.0, theme: 'Admin Campus', status: 'Allotted' },
    { plotId: 'APCRDA-P-023', survey: 'SV/56/1', zone: 'Z2', lu: 'COMM', extent: 6.0, price: 300000000, fsi: 4.0, theme: 'Convention District', status: 'On Hold' },
    { plotId: 'APCRDA-P-024', survey: 'SV/56/2', zone: 'Z3', lu: 'IT', extent: 5.0, price: 150000000, fsi: 3.5, theme: 'Start-up Park', status: 'Published' },
    { plotId: 'APCRDA-P-025', survey: 'SV/57/1', zone: 'Z4', lu: 'INDUS', extent: 18.0, price: 360000000, fsi: 1.5, theme: 'Manufacturing Hub', status: 'Published' },
  ];

  const parcels = await Promise.all(parcelData.map(p =>
    db.landParcel.create({
      data: {
        plotId: p.plotId, surveyNumber: p.survey, zoneId: zoneMap[p.zone],
        landUseId: luMap[p.lu], extentAcres: p.extent, reservePrice: p.price,
        fsiFar: p.fsi, themeCity: p.theme, status: p.status,
        gisCoordinates: JSON.stringify({ lat: 16.5 + Math.random() * 0.1, lng: 80.5 + Math.random() * 0.1 }),
        allotmentModeId: p.status === 'Allotted' ? modeMap['NOM'] : (p.status === 'Under Application' ? modeMap['QBS'] : null),
      }
    })
  ));
  const parcelMap: Record<string, string> = {};
  parcels.forEach(p => { parcelMap[p.plotId] = p.id; });

  // ============ APPLICANTS (15) ============
  const applicantData = [
    { org: 'Sri Venkateswara Real Estates Pvt Ltd', type: 'Private Limited Company', pan: 'AABCS1234K', gst: '37AABCS1234K1ZG', regNo: 'CIN-U45200AP2020PTC123456', addr: 'Road No. 5, Banjara Hills, Hyderabad', person: 'D. Ramachandra Reddy', phone: '+91-9876543201', email: 'ram@svre.in', networth: 500000000, exp: '15 years in real estate development' },
    { org: 'Amaravati Tech Park LLP', type: 'LLP', pan: 'AABCT5678L', gst: '37AABCT5678L1ZG', regNo: 'LLPIN-AAB-5678', addr: 'HITEC City, Madhapur, Hyderabad', person: 'V. Krishnam Raju', phone: '+91-9876543202', email: 'kr@atpllp.in', networth: 1000000000, exp: '20 years in IT infrastructure' },
    { org: 'KBR Healthcare Solutions', type: 'Private Limited Company', pan: 'AABCH9012M', gst: '37AABCH9012M1ZG', regNo: 'CIN-U85110AP2019PTC234567', addr: 'Jubilee Hills, Hyderabad', person: 'K. Bhaskar Rao', phone: '+91-9876543203', email: 'bhaskar@kbrhealth.in', networth: 750000000, exp: '12 years in healthcare' },
    { org: 'Green Valley Constructions', type: 'Partnership', pan: 'AABCG3456N', gst: '37AABCG3456N1ZG', regNo: 'AAFG-2345', addr: 'Guntur, Andhra Pradesh', person: 'N. Srinivasa Rao', phone: '+91-9876543204', email: 'srinivas@greenvalley.in', networth: 350000000, exp: '10 years in construction' },
    { org: 'Mega Industrial Corp Ltd', type: 'Public Limited Company', pan: 'AABCM7890P', gst: '37AABCM7890P1ZG', regNo: 'CIN-U28100AP2018PLC345678', addr: 'Vijayawada, Andhra Pradesh', person: 'T. Ramesh Babu', phone: '+91-9876543205', email: 'ramesh@megaindustrial.in', networth: 2000000000, exp: '25 years in manufacturing' },
    { org: 'AP Educational Trust', type: 'Trust', pan: 'AABCE1234Q', gst: 'N/A', regNo: 'TRUST/AP/2019/123', addr: 'Tirupati, Andhra Pradesh', person: 'Dr. P. Lakshmi', phone: '+91-9876543206', email: 'lakshmi@apet.in', networth: 200000000, exp: '18 years in education sector' },
    { org: 'Sunrise Hospitality Group', type: 'Private Limited Company', pan: 'AABCS5678R', gst: '37AABCS5678R1ZG', regNo: 'CIN-U55101AP2021PTC456789', addr: 'Visakhapatnam, Andhra Pradesh', person: 'R. Surya Prakash', phone: '+91-9876543207', email: 'surya@sunrisehosp.in', networth: 600000000, exp: '14 years in hospitality' },
    { org: 'Krishna Agro Industries', type: 'Private Limited Company', pan: 'AABCK9012S', gst: '37AABCK9012S1ZG', regNo: 'CIN-U01122AP2017PTC567890', addr: 'Machilipatnam, Andhra Pradesh', person: 'K. Venkata Rao', phone: '+91-9876543208', email: 'venkat@krishnaagro.in', networth: 450000000, exp: '20 years in agri-processing' },
    { org: 'Capital City Developers', type: 'Private Limited Company', pan: 'AABCC3456T', gst: '37AABCC3456T1ZG', regNo: 'CIN-U45201AP2020PTC678901', addr: 'Amaravati, Andhra Pradesh', person: 'G. Siva Ram', phone: '+91-9876543209', email: 'siva@capitaldev.in', networth: 1500000000, exp: '22 years in urban development' },
    { org: 'Andhra FinTech Solutions', type: 'LLP', pan: 'AABCF7890U', gst: '37AABCF7890U1ZG', regNo: 'LLPIN-AAB-7890', addr: 'Financial District, Hyderabad', person: 'M. Padma', phone: '+91-9876543210', email: 'padma@afintech.in', networth: 300000000, exp: '8 years in fintech' },
    { org: 'NTR Memorial Housing Society', type: 'Society', pan: 'AABCH1234V', gst: 'N/A', regNo: 'SOC/AP/2018/456', addr: 'Hyderabad, Telangana', person: 'N. Harikrishna', phone: '+91-9876543211', email: 'hari@ntrhousing.in', networth: 250000000, exp: '16 years in affordable housing' },
    { org: 'East Coast Energy Pvt Ltd', type: 'Private Limited Company', pan: 'AABCE5678W', gst: '37AABCE5678W1ZG', regNo: 'CIN-U40108AP2019PTC789012', addr: 'Kakinada, Andhra Pradesh', person: 'S. Satyanarayana', phone: '+91-9876543212', email: 'satya@eastcoastenergy.in', networth: 1800000000, exp: '15 years in renewable energy' },
    { org: 'Vizag Logistics Park Ltd', type: 'Public Limited Company', pan: 'AABCM9012X', gst: '37AABCM9012X1ZG', regNo: 'CIN-U63090AP2020PLC890123', addr: 'Visakhapatnam, Andhra Pradesh', person: 'B. Rama Mohan', phone: '+91-9876543213', email: 'rama@vizaglogistics.in', networth: 900000000, exp: '18 years in logistics' },
    { org: 'Tollywood Media City Pvt Ltd', type: 'Private Limited Company', pan: 'AABCM3456Y', gst: '37AABCM3456Y1ZG', regNo: 'CIN-U92110AP2021PTC901234', addr: 'Film Nagar, Hyderabad', person: 'A. Chiranjeevi', phone: '+91-9876543214', email: 'chiran@tollywoodmedia.in', networth: 400000000, exp: '10 years in media & entertainment' },
    { org: 'State PSU - AP Industries Corp', type: 'PSU', pan: 'AABCP7890Z', gst: '37AABCP7890Z1ZG', regNo: 'PSU/AP/2016/001', addr: 'Secretariat, Amaravati', person: 'IAS Officer', phone: '+91-9876543215', email: 'md@apindustries.gov.in', networth: 5000000000, exp: 'Government undertaking' },
  ];

  const applicants = await Promise.all(applicantData.map((a, i) =>
    db.applicant.create({
      data: {
        applicantId: `APCRDA-INV-${String(i + 1).padStart(5, '0')}`,
        organizationName: a.org, entityType: a.type, pan: a.pan, gst: a.gst,
        registrationNumber: a.regNo, registeredAddress: a.addr,
        contactPerson: a.person, contactPhone: a.phone, contactEmail: a.email,
        netWorth: a.networth, experience: a.exp,
        userId: i === 0 ? userMap['investor@amaravati-demo.in'] : null,
      }
    })
  ));

  // ============ APPLICATIONS (15) at various stages ============
  const now = new Date();
  const day = (d: number) => new Date(now.getTime() + d * 86400000);
  const appConfigs = [
    // App 1: Completed full cycle
    { appNum: 'APCRDA-2024-0001', applicantIdx: 0, parcel: 'APCRDA-P-001', mode: 'NOM', stage: 'Compliance', status: 'Approved', priority: 'Normal', investment: 500000000, employment: 500, sector: 'Real Estate', proj: 'SV Towers Complex', desc: 'Mixed-use commercial towers in Finance City' },
    // App 2: Under Construction
    { appNum: 'APCRDA-2024-0002', applicantIdx: 1, parcel: 'APCRDA-P-006', mode: 'QBS', stage: 'Construction', status: 'Approved', priority: 'High', investment: 1000000000, employment: 2000, sector: 'IT & ITES', proj: 'Amaravati Tech Hub', desc: 'State-of-the-art IT park with SEZ facilities' },
    // App 3: At Building Permission
    { appNum: 'APCRDA-2024-0003', applicantIdx: 2, parcel: 'APCRDA-P-017', mode: 'NOM', stage: 'Building Permission', status: 'Approved', priority: 'Normal', investment: 750000000, employment: 800, sector: 'Healthcare', proj: 'KBR Super Specialty Hospital', desc: '500-bed multi-specialty hospital' },
    // App 4: At Payment
    { appNum: 'APCRDA-2024-0004', applicantIdx: 3, parcel: 'APCRDA-P-012', mode: 'QBS', stage: 'Payment', status: 'Approved', priority: 'Normal', investment: 200000000, employment: 200, sector: 'Real Estate', proj: 'Green Valley Residences', desc: 'Premium residential apartment complex' },
    // App 5: At LOI
    { appNum: 'APCRDA-2024-0005', applicantIdx: 4, parcel: 'APCRDA-P-019', mode: 'NOM', stage: 'LOI', status: 'Approved', priority: 'High', investment: 2000000000, employment: 5000, sector: 'Manufacturing', proj: 'Mega Industrial Complex', desc: 'Automobile and components manufacturing facility' },
    // App 6: At Authority Approval
    { appNum: 'APCRDA-2024-0006', applicantIdx: 5, parcel: 'APCRDA-P-008', mode: 'QBS', stage: 'Authority Approval', status: 'Under Review', priority: 'Normal', investment: 300000000, employment: 600, sector: 'Education', proj: 'AP Global University Campus', desc: 'World-class university with research facilities' },
    // App 7: At LASC
    { appNum: 'APCRDA-2024-0007', applicantIdx: 6, parcel: 'APCRDA-P-005', mode: 'QBS', stage: 'LASC', status: 'Under Review', priority: 'Normal', investment: 400000000, employment: 350, sector: 'Hospitality & Tourism', proj: 'Sunrise Luxury Resort', desc: '5-star resort and convention center' },
    // App 8: At Economic Review
    { appNum: 'APCRDA-2024-0008', applicantIdx: 7, parcel: 'APCRDA-P-009', mode: 'ETENDER', stage: 'Economic Review', status: 'Under Review', priority: 'Normal', investment: 600000000, employment: 400, sector: 'Agriculture', proj: 'Krishna Agro Processing Hub', desc: 'Food processing and cold storage facility' },
    // App 9: At DPR Review
    { appNum: 'APCRDA-2024-0009', applicantIdx: 8, parcel: 'APCRDA-P-003', mode: 'QCPS', stage: 'DPR Review', status: 'Under Review', priority: 'High', investment: 1500000000, employment: 1500, sector: 'Real Estate', proj: 'Capital City Mall', desc: 'Premium shopping mall and entertainment center' },
    // App 10: At Eligibility
    { appNum: 'APCRDA-2024-0010', applicantIdx: 9, parcel: 'APCRDA-P-016', mode: 'QBS', stage: 'Eligibility', status: 'Under Review', priority: 'Normal', investment: 350000000, employment: 300, sector: 'Financial Services', proj: 'Amaravati FinTech Tower', desc: 'Financial technology hub and incubation center' },
    // App 11: Submitted (new)
    { appNum: 'APCRDA-2024-0011', applicantIdx: 10, parcel: 'APCRDA-P-013', mode: 'NOM', stage: 'Application', status: 'Submitted', priority: 'Normal', investment: 250000000, employment: 250, sector: 'Real Estate', proj: 'NTR Housing Project', desc: 'Affordable housing for low-income groups' },
    // App 12: At GoM
    { appNum: 'APCRDA-2024-0012', applicantIdx: 11, parcel: 'APCRDA-P-020', mode: 'NOM', stage: 'GoM', status: 'Under Review', priority: 'High', investment: 1800000000, employment: 1000, sector: 'Energy', proj: 'East Coast Solar Park', desc: '500MW solar power generation facility' },
    // App 13: At Government Order
    { appNum: 'APCRDA-2024-0013', applicantIdx: 12, parcel: 'APCRDA-P-022', mode: 'NOM', stage: 'Government Order', status: 'Approved', priority: 'Normal', investment: 900000000, employment: 700, sector: 'Logistics', proj: 'AP Logistics Hub', desc: 'Integrated logistics and warehousing facility' },
    // App 14: At Possession
    { appNum: 'APCRDA-2024-0014', applicantIdx: 13, parcel: 'APCRDA-P-007', mode: 'QCPS', stage: 'Possession', status: 'Approved', priority: 'Normal', investment: 450000000, employment: 600, sector: 'Media & Entertainment', proj: 'Tollywood Studio City', desc: 'Film production and media entertainment hub' },
    // App 15: Rejected
    { appNum: 'APCRDA-2024-0015', applicantIdx: 14, parcel: 'APCRDA-P-010', mode: 'QBS', stage: 'Eligibility', status: 'Rejected', priority: 'Normal', investment: 5000000000, employment: 3000, sector: 'Manufacturing', proj: 'AP Heavy Industries', desc: 'Heavy machinery and equipment manufacturing', rejection: 'Applicant entity type (PSU) requires additional cabinet approval for direct land allotment in Industrial Zone.' },
  ];

  const workflowStageNames = ['Application', 'Eligibility', 'DPR Review', 'Economic Review', 'LASC', 'GoM', 'Cabinet Sub-Committee', 'Authority Approval', 'Cabinet Approval', 'Government Order', 'LOI', 'Payment', 'Revised DPR', 'Agreement', 'Possession', 'Building Permission', 'Construction', 'Compliance'];

  const applications = await Promise.all(appConfigs.map((cfg, idx) => {
    const currentStageIdx = workflowStageNames.indexOf(cfg.stage);
    return db.application.create({
      data: {
        applicationNumber: cfg.appNum,
        applicantId: applicants[cfg.applicantIdx].id,
        landParcelId: parcelMap[cfg.parcel],
        allotmentModeId: modeMap[cfg.mode],
        projectName: cfg.proj,
        sector: cfg.sector,
        proposedInvestment: cfg.investment,
        employmentCommitment: cfg.employment,
        projectDescription: cfg.desc,
        status: cfg.status,
        priority: cfg.priority,
        currentStage: cfg.stage,
        assignedOfficerId: userMap['lands@amaravati-demo.gov.in'],
        slaDueDate: day(currentStageIdx * 14 + 7),
        rejectionReason: cfg.rejection || null,
        createdAt: day(-90 + idx * 7),
        stages: {
          create: workflowStageNames.map((stageName, si) => {
            let stageStatus: string = 'Not Started';
            if (si < currentStageIdx) stageStatus = 'Completed';
            else if (si === currentStageIdx) stageStatus = cfg.status === 'Rejected' ? 'Rejected' : 'In Progress';
            else if (si === currentStageIdx + 1 && cfg.status === 'Approved') stageStatus = 'Not Started';
            return {
              stageName, stageOrder: si + 1, status: stageStatus,
              assignedToId: si === 0 ? null : userMap['lands@amaravati-demo.gov.in'],
              startedAt: si < currentStageIdx ? day(-90 + idx * 7 + si * 5) : (si === currentStageIdx ? day(-5) : null),
              completedAt: si < currentStageIdx ? day(-90 + idx * 7 + si * 5 + 3) : null,
              decision: si < currentStageIdx ? 'Approved' : null,
              slaDays: [3, 7, 14, 10, 21, 14, 14, 14, 21, 10, 7, 14, 14, 14, 7, 21, 365, 365][si] || 7,
            };
          })
        }
      },
      include: { stages: true }
    });
  }));

  // ============ PAYMENTS (for applications at payment stage and beyond) ============
  const paymentApps = [0, 1, 2, 3, 4, 12, 13]; // indices of apps that have payments
  for (const appIdx of paymentApps) {
    const app = applications[appIdx];
    const totalDue = app.proposedInvestment * 0.25; // 25% down payment
    const paid = appIdx < 3 ? totalDue : (appIdx < 5 ? totalDue * 0.5 : 0);
    await db.payment.create({
      data: {
        applicationId: app.id, paymentType: 'Down Payment', amountDue: totalDue, amountPaid: paid,
        dueDate: day(-30), paidDate: paid > 0 ? day(-25) : null,
        transactionRef: paid > 0 ? `TXN-${app.applicationNumber}-DP` : null,
        receiptNumber: paid > 0 ? `RCP-${app.applicationNumber}-DP` : null,
        status: paid >= totalDue ? 'Paid' : (paid > 0 ? 'Partially Paid' : 'Pending'),
      }
    });
    if (appIdx < 2) {
      const instDue = app.proposedInvestment * 0.15;
      await db.payment.create({
        data: {
          applicationId: app.id, paymentType: 'Installment', amountDue: instDue, amountPaid: instDue,
          dueDate: day(30), paidDate: day(28), transactionRef: `TXN-${app.applicationNumber}-I1`,
          receiptNumber: `RCP-${app.applicationNumber}-I1`, status: 'Paid',
        }
      });
    }
  }

  // ============ CONSTRUCTION PROJECTS ============
  for (const appIdx of [0, 1]) {
    const app = applications[appIdx];
    const physProg = appIdx === 0 ? 85 : 42;
    const finProg = appIdx === 0 ? 78 : 35;
    await db.constructionProject.create({
      data: {
        applicationId: app.id,
        plannedStartDate: day(-180), actualStartDate: day(-170),
        plannedEndDate: day(180 + appIdx * 90),
        physicalProgress: physProg, financialProgress: finProg,
        status: appIdx === 0 ? 'In Progress' : 'Delayed',
        progressUpdates: {
          create: [
            { updateDate: day(-30), physicalProgress: physProg - 15, financialProgress: finProg - 12, reportedById: userMap['monitoring@amaravati-demo.gov.in'] },
            { updateDate: day(-15), physicalProgress: physProg - 8, financialProgress: finProg - 6, reportedById: userMap['monitoring@amaravati-demo.gov.in'] },
            { updateDate: day(0), physicalProgress: physProg, financialProgress: finProg, reportedById: userMap['monitoring@amaravati-demo.gov.in'], remarks: appIdx === 1 ? 'Construction delayed due to monsoon. Expected to resume next week.' : null },
          ]
        }
      }
    });
  }

  // ============ GRIEVANCES (5) ============
  const grievanceData = [
    { appIdx: 8, stage: 'DPR Review', category: 'DPR Rejection', desc: 'The DPR was returned citing insufficient financial details, but all required documents were submitted as per guidelines. Requesting re-review.', status: 'In Progress' },
    { appIdx: 14, stage: 'Eligibility', category: 'Eligibility Rejection', desc: 'Application rejected stating PSU cannot apply through QBS mode. However, as per APCRDA notification 2024/15, PSUs are eligible. Requesting reconsideration.', status: 'Open' },
    { appIdx: 3, stage: 'Payment', category: 'Payment Issue', desc: 'EMD amount of INR 25,00,000 was deducted but confirmation not received. Bank statement attached.', status: 'Resolved' },
    { appIdx: 7, stage: 'Economic Review', category: 'Scoring Dispute', desc: 'Economic review score of 62% appears lower than expected. Our investment commitment of 600 Cr should warrant higher scoring under investment quantum criterion.', status: 'Open' },
    { appIdx: 1, stage: 'Construction', category: 'Construction Delay', desc: 'Requesting extension of 6 months due to unforeseen site conditions and COVID-related supply chain disruptions.', status: 'In Progress' },
  ];
  await Promise.all(grievanceData.map((g, i) =>
    db.grievance.create({
      data: {
        grievanceNumber: `GRV-${String(i + 1).padStart(5, '0')}`,
        applicantId: applicants[g.appIdx].id,
        applicationId: applications[g.appIdx].id,
        stage: g.stage, category: g.category, description: g.desc,
        status: g.status, assignedToId: userMap['grievance@amaravati-demo.gov.in'],
        slaDays: 7, submittedAt: day(-i * 5 - 2),
        response: g.status === 'Resolved' ? 'Payment confirmed. EMD receipt number RCP-APCRDA-2024-0004-EMD generated.' : null,
        resolvedAt: g.status === 'Resolved' ? day(-1) : null,
      }
    })
  ));

  // ============ CANCELLATION CASES (3) ============
  const cancelData = [
    { appIdx: 5, initBy: 'APCRDA', reason: 'Non-commencement of development within 6 months of possession', decision: 'Cancellation Recommended', status: 'Decision Made' },
    { appIdx: 6, initBy: 'Investor', reason: 'Unable to arrange required investment due to market conditions', decision: 'Withdrawn', status: 'Completed' },
    { appIdx: 8, initBy: 'APCRDA', reason: 'Non-payment of 2nd installment beyond 90 days grace period', decision: null, status: 'Notice Issued' },
  ];
  await Promise.all(cancelData.map((c, i) =>
    db.cancellationCase.create({
      data: {
        caseNumber: `CAN-${String(i + 1).padStart(5, '0')}`,
        applicationId: applications[c.appIdx].id,
        initiatedBy: c.initBy, reason: c.reason, decision: c.decision, status: c.status,
        noticeDate: day(-30 + i * 10), hearingDate: i === 0 ? day(5) : null,
        decisionDate: c.decision ? day(-10 + i * 10) : null,
      }
    })
  ));

  // ============ DPR VERSIONS ============
  for (const appIdx of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
    const app = applications[appIdx];
    await db.dPRVersion.create({
      data: {
        applicationId: app.id, version: 'R0',
        status: appIdx <= 5 ? 'Approved' : (appIdx === 9 ? 'Query Raised' : 'Under Review'),
        reviewerId: userMap['technical@amaravati-demo.gov.in'],
        reviewedAt: appIdx <= 5 ? day(-20 + appIdx) : null,
        approvedAt: appIdx <= 4 ? day(-18 + appIdx) : null,
        queries: appIdx === 9 ? { create: [{ query: 'Please provide detailed financial model with IRR and NPV calculations for the proposed investment.', raisedById: userMap['technical@amaravati-demo.gov.in'], status: 'Open' }] } : undefined,
      }
    });
    if (appIdx <= 4) {
      await db.dPRVersion.create({
        data: { applicationId: app.id, version: 'R1', status: appIdx <= 2 ? 'Approved' : 'Submitted', reviewerId: userMap['technical@amaravati-demo.gov.in'] }
      });
    }
  }

  // ============ ECONOMIC REVIEWS ============
  for (const appIdx of [1, 2, 3, 4, 5, 7, 8]) {
    const app = applications[appIdx];
    const totalScore = 70 + appIdx * 3;
    await db.economicReview.create({
      data: {
        applicationId: app.id, reviewerId: userMap['lands@amaravati-demo.gov.in'],
        totalScore, maxScore: 100, percentage: totalScore,
        rating: totalScore >= 80 ? 'Recommended' : 'Recommended with Conditions',
        recommendation: totalScore >= 80 ? 'Strong proposal with significant economic impact.' : 'Recommended with conditions on employment generation timeline.',
        scores: JSON.stringify([
          { criterion: 'Investment Quantum', weight: 20, maxScore: 20, score: 15 + Math.floor(appIdx / 2) },
          { criterion: 'Financial Credibility', weight: 15, maxScore: 15, score: 12 },
          { criterion: 'Employment Generation', weight: 15, maxScore: 15, score: 10 + appIdx % 3 },
          { criterion: 'Sector Priority', weight: 15, maxScore: 15, score: 10 + appIdx % 4 },
          { criterion: 'Development Potential', weight: 15, maxScore: 15, score: 12 },
          { criterion: 'Strategic Importance', weight: 20, maxScore: 20, score: 11 + appIdx % 5 },
        ]),
        status: 'Completed',
      }
    });
  }

  // ============ NOTIFICATIONS ============
  const notifData = [
    { userId: userMap['lands@amaravati-demo.gov.in'], type: 'Task Assigned', title: 'New Application Assigned', msg: 'Application APCRDA-2024-0011 assigned for eligibility review', refId: applications[10]?.id, refType: 'Application' },
    { userId: userMap['technical@amaravati-demo.gov.in'], type: 'Query Response', title: 'DPR Query Response', msg: 'Capital City Developers responded to DPR query', refId: applications[8]?.id, refType: 'Application' },
    { userId: userMap['finance@amaravati-demo.gov.in'], type: 'Payment Due', title: 'Payment Overdue', msg: 'Down payment for APCRDA-2024-0004 is overdue', refId: applications[3]?.id, refType: 'Payment' },
    { userId: userMap['monitoring@amaravati-demo.gov.in'], type: 'Construction Delayed', title: 'Construction Delay Alert', msg: 'Amaravati Tech Hub construction is behind schedule', refId: applications[1]?.id, refType: 'Application' },
    { userId: userMap['grievance@amaravati-demo.gov.in'], type: 'Grievance Update', title: 'New Grievance Filed', msg: 'Grievance GRV-00002 filed against eligibility rejection', refId: applications[14]?.id, refType: 'Grievance' },
  ];
  await Promise.all(notifData.map(n =>
    db.notification.create({
      data: { userId: n.userId, type: n.type, title: n.title, message: n.msg, referenceId: n.refId, referenceType: n.refType, isRead: false }
    })
  ));

  // ============ AUDIT LOGS ============
  const auditData = [
    { userId: userMap['admin@amaravati-demo.gov.in'], userName: 'R. Venkateshwara Rao', role: 'Super Admin', action: 'LOGIN', module: 'Auth' },
    { userId: userMap['lands@amaravati-demo.gov.in'], userName: 'S. Lakshmi Devi', role: 'APCRDA Lands Officer', action: 'APPROVE', module: 'Eligibility', recordId: applications[9]?.id },
    { userId: userMap['technical@amaravati-demo.gov.in'], userName: 'M. Suresh Babu', role: 'Technical Reviewer', action: 'APPROVE', module: 'DPR Review', recordId: applications[8]?.id },
    { userId: userMap['finance@amaravati-demo.gov.in'], userName: 'K. Padmavathi', role: 'Finance Officer', action: 'UPDATE', module: 'Payment', recordId: applications[3]?.id },
  ];
  await Promise.all(auditData.map((a, i) =>
    db.auditLog.create({ data: { ...a, createdAt: day(-i - 1) } })
  ));

  console.log('Seed completed successfully!');
  console.log(`Created: ${roles.length} roles, ${depts.length} departments, ${zones.length} zones, ${landUses.length} land uses, ${modes.length} allotment modes`);
  console.log(`Created: ${parcels.length} land parcels, ${applicants.length} applicants, ${applications.length} applications`);
}

main()
  .then(async () => { await db.$disconnect(); })
  .catch(async (e) => { console.error(e); await db.$disconnect(); process.exit(1); });
