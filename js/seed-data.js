/**
 * CleanInspect - Realistic Seed Data
 * js/seed-data.js
 */

// Helper to generate crisp SVG data URLs for realistic inspection photos
function createPhotoDataUrl(label, bgGradient1, bgGradient2, iconType) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgGradient1}"/>
        <stop offset="100%" stop-color="${bgGradient2}"/>
      </linearGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.3"/>
      </filter>
    </defs>
    <rect width="100%" height="100%" fill="url(#bg)"/>
    <g filter="url(#shadow)">
      <rect x="40" y="40" width="520" height="320" rx="16" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
    </g>
    <!-- Camera/Evidence grid lines -->
    <line x1="200" y1="40" x2="200" y2="360" stroke="rgba(255,255,255,0.1)" stroke-dasharray="4 4"/>
    <line x1="400" y1="40" x2="400" y2="360" stroke="rgba(255,255,255,0.1)" stroke-dasharray="4 4"/>
    <line x1="40" y1="150" x2="560" y2="150" stroke="rgba(255,255,255,0.1)" stroke-dasharray="4 4"/>
    <line x1="40" y1="250" x2="560" y2="250" stroke="rgba(255,255,255,0.1)" stroke-dasharray="4 4"/>
    
    <!-- Central inspection badge -->
    <circle cx="300" cy="180" r="48" fill="rgba(255,255,255,0.25)" stroke="#fff" stroke-width="3"/>
    <path d="M285 180 L295 190 L315 170" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    
    <!-- Tag banner -->
    <rect x="70" y="280" width="460" height="52" rx="8" fill="rgba(15, 23, 42, 0.75)"/>
    <text x="300" y="312" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" text-anchor="middle">${label}</text>
    <text x="530" y="70" fill="rgba(255,255,255,0.85)" font-family="monospace" font-size="12" text-anchor="end">CleanInspect Verified</text>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

// Preset photo assets using high-resolution CDN images
const SAMPLE_PHOTOS = {
  // High-gloss commercial lobby entrance floor
  lobbyFloor: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
  // Pristine reception desk and greeting station
  receptionDesk: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80',
  // Window sill with dust / pollen residue
  windowDust: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
  // Dried coffee stain & spill on pantry counter
  coffeeSpill: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
  // Sparkling clean executive restroom vanity & mirrors
  restroomVanity: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
  // Restroom dispenser fixture unit empty
  soapDispenser: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=800&q=80',
  // Polished mahogany conference boardroom table
  conferenceRoom: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80',
  // Unobstructed corridor & emergency exit passage
  storageCorridor: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80',
  // Clean vacuumed carpet across office rooms
  carpetVacuum: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80'
};

const SeedData = {
  getCategories() {
    return [
      {
        id: 'cat-entrance',
        name: 'Entrance & Reception',
        icon: 'door-open',
        description: 'Main lobby, entrance glass doors, welcome reception desk, and guest seating areas.'
      },
      {
        id: 'cat-office',
        name: 'Office Rooms',
        icon: 'briefcase',
        description: 'Private office suites, cubicles, computer desks, monitor wiping, and waste disposal.'
      },
      {
        id: 'cat-conference',
        name: 'Conference Room',
        icon: 'users',
        description: 'Meeting tables, presentation screens, chairs, carpet vacuuming, and whiteboard cleaning.'
      },
      {
        id: 'cat-kitchen',
        name: 'Kitchen & Pantry',
        icon: 'coffee',
        description: 'Food preparation counters, microwave interiors, sinks, refrigerators, and sanitizing.'
      },
      {
        id: 'cat-toilets',
        name: 'Toilets & Bathrooms',
        icon: 'bath',
        description: 'Toilets, urinals, washbasins, mirror cleaning, soap and paper towel replenishment.'
      },
      {
        id: 'cat-corridors',
        name: 'Corridors & Staircases',
        icon: 'git-commit',
        description: 'Hallways, handrails, stair treads, fire exits, emergency signage, and baseboards.'
      },
      {
        id: 'cat-storage',
        name: 'Storage Room',
        icon: 'box',
        description: 'Supply closets, inventory shelving, equipment storage, floor sweeping, and ventilation.'
      },
      {
        id: 'cat-common',
        name: 'Common Areas',
        icon: 'layout',
        description: 'Elevator cabins, drinking water stations, break lounges, and recycling bins.'
      }
    ];
  },

  /**
   * Generates standard checklist template items for an inspection
   */
  generateChecklistItems() {
    return [
      // 1. Entrance & Reception
      {
        id: 'item-ent-1',
        categoryId: 'cat-entrance',
        categoryName: 'Entrance & Reception',
        task: 'Floor is clean and properly mopped with non-slip neutral cleaner.',
        status: 'completed',
        comment: 'Tile floor buffed to high shine. Entrance mats aligned.',
        photos: [SAMPLE_PHOTOS.lobbyFloor]
      },
      {
        id: 'item-ent-2',
        categoryId: 'cat-entrance',
        categoryName: 'Entrance & Reception',
        task: 'Reception desk is clean, dust-free, and sanitized.',
        status: 'completed',
        comment: 'Surface wiped with disinfectant. Acrylic barriers clean.',
        photos: [SAMPLE_PHOTOS.receptionDesk]
      },
      {
        id: 'item-ent-3',
        categoryId: 'cat-entrance',
        categoryName: 'Entrance & Reception',
        task: 'Entrance glass doors and side windows are smudge-free.',
        status: 'completed',
        comment: 'Fingerprints wiped off inner and outer surfaces.',
        photos: []
      },
      {
        id: 'item-ent-4',
        categoryId: 'cat-entrance',
        categoryName: 'Entrance & Reception',
        task: 'Waste bins are emptied and new liners installed.',
        status: 'completed',
        comment: 'Emptied and deodorized.',
        photos: []
      },

      // 2. Office Rooms
      {
        id: 'item-off-1',
        categoryId: 'cat-office',
        categoryName: 'Office Rooms',
        task: 'Visible desk surfaces and workstation tops are dust-free.',
        status: 'completed',
        comment: 'All open desk spaces wiped thoroughly.',
        photos: []
      },
      {
        id: 'item-off-2',
        categoryId: 'cat-office',
        categoryName: 'Office Rooms',
        task: 'Windows and window sills are clean without dirt buildup.',
        status: 'partial',
        comment: 'East-facing window sill has noticeable pollen and dust buildup.',
        photos: [SAMPLE_PHOTOS.windowDust]
      },
      {
        id: 'item-off-3',
        categoryId: 'cat-office',
        categoryName: 'Office Rooms',
        task: 'Carpets are vacuumed thoroughly along edges and under desks.',
        status: 'completed',
        comment: 'No debris found.',
        photos: []
      },
      {
        id: 'item-off-4',
        categoryId: 'cat-office',
        categoryName: 'Office Rooms',
        task: 'Individual wastebaskets and recycling bins emptied.',
        status: 'completed',
        comment: 'All 14 cubicle bins cleared.',
        photos: []
      },

      // 3. Conference Room
      {
        id: 'item-conf-1',
        categoryId: 'cat-conference',
        categoryName: 'Conference Room',
        task: 'Main conference table is polished, sanitized, and streak-free.',
        status: 'completed',
        comment: 'Mahogany conference table polished with wood conditioner.',
        photos: [SAMPLE_PHOTOS.conferenceRoom]
      },
      {
        id: 'item-conf-2',
        categoryId: 'cat-conference',
        categoryName: 'Conference Room',
        task: 'Conference chairs are neatly arranged and free of crumbs.',
        status: 'completed',
        comment: 'All 12 executive chairs wiped and tucked.',
        photos: []
      },
      {
        id: 'item-conf-3',
        categoryId: 'cat-conference',
        categoryName: 'Conference Room',
        task: 'Whiteboards and markers are cleaned and eraser tray vacuumed.',
        status: 'completed',
        comment: 'Marker residue removed with whiteboard cleaner.',
        photos: []
      },
      {
        id: 'item-conf-4',
        categoryId: 'cat-conference',
        categoryName: 'Conference Room',
        task: 'Audio-visual screen frame and display glass dusted gently.',
        status: 'completed',
        comment: 'Microfiber cloth used on 75" display.',
        photos: []
      },

      // 4. Kitchen & Pantry
      {
        id: 'item-kit-1',
        categoryId: 'cat-kitchen',
        categoryName: 'Kitchen & Pantry',
        task: 'Food preparation counters and sink are scrubbed and sanitized.',
        status: 'not_completed',
        comment: 'Dried coffee spill and sticky residue behind espresso maker.',
        photos: [SAMPLE_PHOTOS.coffeeSpill]
      },
      {
        id: 'item-kit-2',
        categoryId: 'cat-kitchen',
        categoryName: 'Kitchen & Pantry',
        task: 'Microwave interior and turntable plate washed.',
        status: 'completed',
        comment: 'Cleaned and turntable washed.',
        photos: []
      },
      {
        id: 'item-kit-3',
        categoryId: 'cat-kitchen',
        categoryName: 'Kitchen & Pantry',
        task: 'Refrigerator exterior and door handles disinfected.',
        status: 'completed',
        comment: 'Handles sanitized with multi-surface spray.',
        photos: []
      },
      {
        id: 'item-kit-4',
        categoryId: 'cat-kitchen',
        categoryName: 'Kitchen & Pantry',
        task: 'Trash and organic compost bins emptied and relined.',
        status: 'completed',
        comment: 'Emptied and interior bin wiped.',
        photos: []
      },

      // 5. Toilets & Bathrooms
      {
        id: 'item-toi-1',
        categoryId: 'cat-toilets',
        categoryName: 'Toilets & Bathrooms',
        task: 'Toilet bowls and urinals disinfected and descaled.',
        status: 'completed',
        comment: 'Hospital-grade disinfectant applied to all fixtures.',
        photos: []
      },
      {
        id: 'item-toi-2',
        categoryId: 'cat-toilets',
        categoryName: 'Toilets & Bathrooms',
        task: 'Mirrors and chrome faucets polished streak-free.',
        status: 'completed',
        comment: 'No water spots or streaks found.',
        photos: [SAMPLE_PHOTOS.restroomVanity]
      },
      {
        id: 'item-toi-3',
        categoryId: 'cat-toilets',
        categoryName: 'Toilets & Bathrooms',
        task: 'Soap, toilet paper, and paper towel dispensers replenished.',
        status: 'not_completed',
        comment: 'Dispenser #2 in East wing men\'s restroom completely empty.',
        photos: [SAMPLE_PHOTOS.soapDispenser]
      },
      {
        id: 'item-toi-4',
        categoryId: 'cat-toilets',
        categoryName: 'Toilets & Bathrooms',
        task: 'Floors mopped with antibacterial germicidal solution.',
        status: 'completed',
        comment: 'Floor sanitized and dry with safety cones placed.',
        photos: []
      },

      // 6. Corridors & Staircases
      {
        id: 'item-cor-1',
        categoryId: 'cat-corridors',
        categoryName: 'Corridors & Staircases',
        task: 'Staircase handrails and balusters disinfected along whole path.',
        status: 'completed',
        comment: 'Sanitizing wipe pass completed.',
        photos: []
      },
      {
        id: 'item-cor-2',
        categoryId: 'cat-corridors',
        categoryName: 'Corridors & Staircases',
        task: 'Emergency exit doors and fire escape corridors clear of obstructions.',
        status: 'completed',
        comment: 'Corridors fully unobstructed and lighted.',
        photos: [SAMPLE_PHOTOS.storageCorridor]
      },
      {
        id: 'item-cor-3',
        categoryId: 'cat-corridors',
        categoryName: 'Corridors & Staircases',
        task: 'Floor tiles/carpets vacuumed and free of scuff marks.',
        status: 'completed',
        comment: 'Light scuffs removed with white pad.',
        photos: []
      },
      {
        id: 'item-cor-4',
        categoryId: 'cat-corridors',
        categoryName: 'Corridors & Staircases',
        task: 'Wall baseboards and corners free of cobwebs and dust.',
        status: 'completed',
        comment: 'Baseboards wiped down.',
        photos: []
      },

      // 7. Storage Room
      {
        id: 'item-sto-1',
        categoryId: 'cat-storage',
        categoryName: 'Storage Room',
        task: 'Shelving units dusted and supplies organized systematically.',
        status: 'completed',
        comment: 'Shelves neat, chemical bottles labeled.',
        photos: []
      },
      {
        id: 'item-sto-2',
        categoryId: 'cat-storage',
        categoryName: 'Storage Room',
        task: 'Floor swept and mop bucket cleaned and stored properly inverted.',
        status: 'completed',
        comment: 'Cleaned and dried.',
        photos: []
      },
      {
        id: 'item-sto-3',
        categoryId: 'cat-storage',
        categoryName: 'Storage Room',
        task: 'Hazardous cleaning materials locked in safety cabinet.',
        status: 'completed',
        comment: 'Cabinet locked and key tagged.',
        photos: []
      },
      {
        id: 'item-sto-4',
        categoryId: 'cat-storage',
        categoryName: 'Storage Room',
        task: 'Air vents and extraction fan filter checked.',
        status: 'completed',
        comment: 'Ventilation working properly.',
        photos: []
      },

      // 8. Common Areas
      {
        id: 'item-com-1',
        categoryId: 'cat-common',
        categoryName: 'Common Areas',
        task: 'Elevator interiors, call buttons, and floor tracks cleaned.',
        status: 'completed',
        comment: 'Buttons sanitized and stainless steel polished.',
        photos: []
      },
      {
        id: 'item-com-2',
        categoryId: 'cat-common',
        categoryName: 'Common Areas',
        task: 'Drinking fountains/water coolers sanitized and stainless steel buffed.',
        status: 'completed',
        comment: 'Disinfected with food-contact safe spray.',
        photos: []
      },
      {
        id: 'item-com-3',
        categoryId: 'cat-common',
        categoryName: 'Common Areas',
        task: 'Break area dining tables and chairs wiped clean.',
        status: 'completed',
        comment: 'Crumb-free and sanitized.',
        photos: []
      },
      {
        id: 'item-com-4',
        categoryId: 'cat-common',
        categoryName: 'Common Areas',
        task: 'High-touch points (light switches, door knobs) sanitized.',
        status: 'completed',
        comment: 'All handles wiped.',
        photos: []
      }
    ];
  },

  getInspections() {
    const defaultItems = this.generateChecklistItems();

    // 1. Completed Inspection: Westfield Mall
    const westfieldItems = JSON.parse(JSON.stringify(defaultItems));
    // Westfield has all items completed except 1 partial
    westfieldItems.forEach((it, idx) => {
      if (idx === 5) {
        it.status = 'partial';
        it.comment = 'Minor dust on decorative moulding.';
      } else {
        it.status = 'completed';
      }
    });

    // 2. In-Progress Inspection: Sunrise Office Center (Mixed results)
    const sunriseItems = JSON.parse(JSON.stringify(defaultItems));
    // Let's leave some unassessed, some completed, some partial, some not_completed
    sunriseItems.forEach((it, idx) => {
      if (idx < 12) {
        // First 12 are assessed
        if (idx === 5) it.status = 'partial';
        else if (idx === 10) it.status = 'not_completed';
        else it.status = 'completed';
      } else {
        it.status = 'unassessed';
        it.comment = '';
        it.photos = [];
      }
    });

    // 3. Pending Inspection: Riverside Hotel
    const riversideItems = JSON.parse(JSON.stringify(defaultItems));
    riversideItems.forEach(it => {
      it.status = 'unassessed';
      it.comment = '';
      it.photos = [];
    });

    // 4. Completed Inspection: Grandview Executive Suites
    const grandviewItems = JSON.parse(JSON.stringify(defaultItems));

    const inspections = [
      {
        id: 'INS-2026-001',
        reference: 'INS-2026-001',
        reportId: 'REP-2026-001',
        client: 'Westfield Commercial Properties',
        location: 'Westfield Mall',
        address: '2500 Galleria Parkway, Level 2 Food & Common Area, Houston, TX',
        inspector: 'David Wilson',
        scheduledDate: '2026-10-16T14:00:00.000Z',
        completedDate: '2026-10-16T15:45:00.000Z',
        status: 'completed',
        categoriesIncluded: ['Entrance & Reception', 'Office Rooms', 'Conference Room', 'Kitchen & Pantry', 'Toilets & Bathrooms', 'Corridors & Staircases', 'Storage Room', 'Common Areas'],
        items: westfieldItems,
        generalObservations: 'Exceptional standard of cleanliness maintained across all food court common seating and entrance lobbies. High-traffic tile floors exhibit deep polish with zero hazing.',
        areasRequiringAttention: 'East wing decorative column moulding requires high-reach dusting during the next scheduled deep cleaning shift.',
        recommendedActions: 'Maintain current sanitization cadence; schedule high-reach vacuuming wand for decorative arches.',
        signOff: {
          inspectorName: 'David Wilson',
          supervisorReviewed: true,
          reviewDate: '2026-10-16T17:00:00.000Z',
          supervisorName: 'Sarah Jenkins (Operations Director)'
        }
      },
      {
        id: 'INS-2026-002',
        reference: 'INS-2026-002',
        reportId: 'REP-2026-002',
        client: 'Sunrise Corporate Management',
        location: 'Sunrise Office Center',
        address: '100 Corporate Blvd, Suite 400, Chicago, IL',
        inspector: 'David Wilson',
        scheduledDate: '2026-10-17T09:00:00.000Z',
        status: 'in_progress',
        categoriesIncluded: ['Entrance & Reception', 'Office Rooms', 'Conference Room', 'Kitchen & Pantry', 'Toilets & Bathrooms', 'Corridors & Staircases', 'Storage Room', 'Common Areas'],
        items: sunriseItems,
        generalObservations: 'Reception area and conference rooms inspected. Kitchen pantry and east restrooms have pending hygiene concerns requiring immediate janitorial dispatch.',
        areasRequiringAttention: 'Kitchen counter coffee stains and missing restroom hand soap.',
        recommendedActions: 'Dispatch day porter immediately to restock hygiene dispensers and sanitize kitchen pantry.',
        signOff: {
          inspectorName: 'David Wilson',
          supervisorReviewed: false
        }
      },
      {
        id: 'INS-2026-003',
        reference: 'INS-2026-003',
        reportId: 'REP-2026-003',
        client: 'Harbor Luxury Hospitality LLC',
        location: 'Riverside Hotel',
        address: '742 Harbor Promenade, Miami, FL',
        inspector: 'David Wilson',
        scheduledDate: '2026-10-17T13:30:00.000Z',
        status: 'pending',
        categoriesIncluded: ['Entrance & Reception', 'Office Rooms', 'Conference Room', 'Kitchen & Pantry', 'Toilets & Bathrooms', 'Corridors & Staircases', 'Storage Room', 'Common Areas'],
        items: riversideItems,
        generalObservations: '',
        areasRequiringAttention: '',
        recommendedActions: '',
        signOff: {
          inspectorName: 'David Wilson',
          supervisorReviewed: false
        }
      },
      {
        id: 'INS-2026-004',
        reference: 'INS-2026-004',
        reportId: 'REP-2026-004',
        client: 'Grandview Tower Holdings',
        location: 'Grandview Executive Suites',
        address: '888 Skyline Boulevard, Floors 12-14, Seattle, WA',
        inspector: 'David Wilson',
        scheduledDate: '2026-10-15T10:00:00.000Z',
        completedDate: '2026-10-15T12:15:00.000Z',
        status: 'completed',
        categoriesIncluded: ['Entrance & Reception', 'Office Rooms', 'Conference Room', 'Kitchen & Pantry', 'Toilets & Bathrooms', 'Corridors & Staircases', 'Storage Room', 'Common Areas'],
        items: grandviewItems,
        generalObservations: 'Good overall condition. Minor deficiencies in pantry counters and window ledges were rectified during post-inspection follow-up.',
        areasRequiringAttention: 'Ensure nighttime janitors wipe under desktop monitors and top of microwave ovens.',
        recommendedActions: 'Weekly audit checklist provided to on-site shift supervisor.',
        signOff: {
          inspectorName: 'David Wilson',
          supervisorReviewed: true,
          reviewDate: '2026-10-15T14:30:00.000Z',
          supervisorName: 'Marcus Vance (Regional QA Manager)'
        }
      }
    ];

    // Compute metrics for each inspection
    inspections.forEach(insp => {
      StorageService.prototype.recalculateInspectionStats(insp);
    });

    return inspections;
  },

  getIssues() {
    return [
      {
        id: 'ISSUE-001',
        title: 'Empty Soap Dispenser - East Men\'s Restroom',
        inspectionId: 'INS-2026-002',
        inspectionRef: 'INS-2026-002',
        location: 'Sunrise Office Center',
        category: 'Toilets & Bathrooms',
        checklistItem: 'Soap, toilet paper, and paper towel dispensers replenished.',
        priority: 'high',
        status: 'reported', // Reported -> Under Review -> Assigned -> In Progress -> Resolved -> Verified/Closed
        reportedDate: '2026-10-17T09:20:00.000Z',
        comment: 'Dispenser #2 in East wing men\'s restroom completely empty. Hand hygiene compliance hazard.',
        photos: [SAMPLE_PHOTOS.soapDispenser],
        resolutionNotes: 'Scheduled for immediate replenishment by midday shift porter.'
      },
      {
        id: 'ISSUE-002',
        title: 'Dried Coffee Spills & Sticky Residue behind Espresso Unit',
        inspectionId: 'INS-2026-002',
        inspectionRef: 'INS-2026-002',
        location: 'Sunrise Office Center',
        category: 'Kitchen & Pantry',
        checklistItem: 'Food preparation counters and sink are scrubbed and sanitized.',
        priority: 'medium',
        status: 'assigned',
        reportedDate: '2026-10-17T09:25:00.000Z',
        comment: 'Sticky coffee stains dried on laminate backsplash behind espresso machine.',
        photos: [SAMPLE_PHOTOS.coffeeSpill],
        resolutionNotes: 'Assigned to cleaner Maria Santos. Scheduled for sanitation at 11:00 AM.'
      },
      {
        id: 'ISSUE-003',
        title: 'Pollen and Heavy Dust on East Window Sills',
        inspectionId: 'INS-2026-002',
        inspectionRef: 'INS-2026-002',
        location: 'Sunrise Office Center',
        category: 'Office Rooms',
        checklistItem: 'Windows and window sills are clean without dirt buildup.',
        priority: 'low',
        status: 'in_progress',
        reportedDate: '2026-10-17T09:15:00.000Z',
        comment: 'Pollen buildup on sills along perimeter offices facing east garden.',
        photos: [SAMPLE_PHOTOS.windowDust],
        resolutionNotes: 'Special microfiber electrostatic dusting kits dispatched.'
      },
      {
        id: 'ISSUE-004',
        title: 'Minor Dust on Decorative Column Moulding',
        inspectionId: 'INS-2026-001',
        inspectionRef: 'INS-2026-001',
        location: 'Westfield Mall',
        category: 'Entrance & Reception',
        checklistItem: 'Visible surfaces and archways are dust-free.',
        priority: 'low',
        status: 'resolved',
        reportedDate: '2026-10-16T14:40:00.000Z',
        comment: 'Dust collected on high horizontal ledge near main atrium archway.',
        photos: [SAMPLE_PHOTOS.windowDust],
        resolutionNotes: 'Wiped clean using extension wand by night crew on Oct 16 at 22:00.'
      }
    ];
  },

  getSettings() {
    return {
      theme: 'light',
      companyName: 'CleanInspect Quality Control',
      inspectorName: 'David Wilson',
      inspectorEmail: 'admin@gmail.com',
      autoSave: true,
      notifications: true
    };
  }
};
