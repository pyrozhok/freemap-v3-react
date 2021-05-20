// eslint-disable-next-line
export interface Node extends Record<string, Node | string> {}

export const osmTagToNameMapping: Node = {
  highway: {
    '*': 'Cesta {}',
    track: {
      '*': 'Lesná / poľná cesta',
      tracktype: {
        grade1: 'Spevnená lesná / poľná cesta',
        grade2: 'Väčšinou spevnená lesná / poľná cesta',
        grade3: 'Menej pevná lesná / poľná cesta',
        grade4: 'Väčšinou mäkká lesná / poľná cesta',
        grade5: 'Mäkká lesná / poľná cesta',
      },
    },
    residential: 'Ulica',
    living_street: 'Obytná zóna',
    path: 'Cestička',
    primary: 'Cesta prvej triedy',
    secondary: 'Cesta druhej triedy',
    tertiary: 'Cesta tretej triedy',
    service: {
      '*': 'Servisná, príjazdová cesta',
      service: {
        '*': 'Servisná cesta {}',
        driveway: 'Príjazdová cesta',
        parking_aisle: 'Cesta parkoviska',
        alley: 'Prejazdová cesta',
        emergency_access: 'Požiarná cesta',
        'drive-through': 'Cesta pre nákup z auta',
        bus: 'Cesta vyhradená pre autobus',
      },
    },
    footway: 'Chodník',
    steps: 'Schody',
    trunk: 'Cesta pre motorové vozidlá',
    motorway: 'Diaľnica',
    unclassified: 'Neklasifikovaná cesta',
    primary_link: 'Napojenie na cestu prvej triedy',
    secondaty_link: 'Napojenie na cestu druhej triedy',
    tertiary_link: 'Napojenie na cestu tretej triedy',
    motorway_link: 'Napojenie na ďiaľnicu',
    trunk_link: 'Napojenie na cestu pre motorové vozidlá',
    construction: 'Cesta vo výstavbe',
    crossing: 'Prechod',
    cycleway: 'Cyklochodník',
  },
  boundary: {
    '*': 'Oblasť',
    administrative: {
      '*': 'Administratívna oblasť',
      admin_level: {
        '10': 'Katastrálne územie',
        '9': 'Obec',
        '8': 'Okres',
        '7': 'Oblasť',
        '6': 'Mesto',
        '5': 'Provincia',
        '4': 'Kraj',
        '3': 'Región',
        '2': 'Štát',
      },
    },
  },
  type: {
    route: {
      '*': 'Trasa',
      route: {
        '*': 'Trasa {}',
        hiking: 'Turistická trasa',
        foot: 'Pešia trasa',
        bicycle: 'Cyklotrasa',
        ski: 'Lyžiarská trasa',
        piste: 'Bežkárska trasa trasa',
        horse: 'Jazdecká trasa',
        railway: 'Železničná trasa',
        tram: 'Električková trasa',
        bus: 'Trasa autobusu',
        mtb: 'Trasa pre horské bicykle',
      },
    },
  },
  building: {
    '*': 'Budova {}',
    yes: 'Budova',
    apartments: 'Apartmány',
    bungalow: 'Bungalov',
    cabin: 'Búda, chatka',
    detached: 'Samostatne stojací rodinný dom',
    dormitory: 'Internát',
    farm: 'Statok',
    hotel: 'Budova hotela',
    house: 'Rodinný dom',
    houseboat: 'Hausbót',
    residential: 'Obytný dom',
    static_caravan: 'Obytný príves, karavan',
    terrace: 'Radový dom',
    semidetached_house: 'Duplex', // TODO
    commercial: 'Budova určená na komerčné účely',
    industrial: 'Budova určená na priemyslové účely',
    office: 'Budova s kanceláriami',
    church: 'Kostol',
    cathedral: 'Katedrála',
    chapel: 'Kaplnka',
    mosque: 'Mešita',
    synagogue: 'Synagóga',
    temple: 'Chrám',
    shrine: 'Svätyňa',
    garage: 'Garáž',
    train_station: 'Vlaková stanica',
  },
  amenity: {
    '*': '{}',
    hunting_stand: 'Poľovnícky posed',
    toilets: 'WC',
    shelter: {
      '*': 'Prístrešok',
      shelter_type: {
        '*': 'Prístrešok {}',
        basic_hut: 'Jednoduchá chata, bivak',
        changing_rooms: 'Prezliekáreň',
        field_shelter: 'Polný prístrešok',
        lean_to: 'Prístrešok s otvorenou stenou',
        picnic_shelter: 'Piknikový prístrešok',
        public_transport: 'Prístrešok verejnej dopravy',
        rock_shelter: 'Skalný úkryt',
        sun_shelter: 'Prístrešok proti slnku',
        weather_shelter: 'Prístrešok proti nepriaznivému počasiu',
      },
    },
    bench: 'Lavička',
    atm: 'Bankomat',
    bank: 'Banka',
    fuel: 'Čerpacia stanica',
    hospital: 'Nemocnica',
    place_of_worship: 'Miesto uctievania',
    restaurant: 'Reštaurácia',
    school: 'Škola',
    waste_basket: 'Odpadkový kôš',
    cafe: 'Kaviareň',
    fast_food: 'Rýchle občerstvenie',
    bicycle_parking: 'Parkovanie pre bicykle',
    pharmacy: 'Lekáreň',
    post_box: 'Poštová schránka',
    recycling: 'Recyklovanie',
    kindergarten: 'Škôlka',
    drinking_water: 'Pitná voda',
    bar: 'Bar',
    post_office: 'Pošta',
    townhall: 'Mestská radnica, obecný úrad',
    pub: 'Krčma',
    fountain: 'Fontána',
    police: 'Policia',
    waste_disposal: 'Odpadkový kôš',
    library: 'Knižnica',
    bus_station: 'Autobusová stanica',
  },
  waterway: {
    '*': 'Vodný tok {}',
    river: 'Rieka',
    stream: 'Potok',
    ditch: 'Kanál',
    drain: 'Odtok',
    waterfall: 'Vodopád',
    riverbank: 'Breh',
    dam: 'Priehrada',
  },
  landuse: {
    '*': '{}',
    forest: 'Les',
    residential: 'Rezidenčná zóna',
    commercial: 'Komerčná zóna',
    industrial: 'Industriálna zóna',
    allotments: 'Zahradkárska oblasť',
    farmland: 'Pole',
    farmyard: 'Družstvo',
    grass: 'Tráva',
    meadow: 'Lúka',
    orchard: 'Sad',
    vineyard: 'Vinica',
    cemetery: 'Cintorín',
    reservoir: 'Rezervoár',
    quarry: 'Lom',
    millitary: 'Vojenská oblasť',
  },
  leisure: {
    '*': '{}',
    firepit: 'Ohnisko',
    pitch: 'Ihrisko',
    swimming_pool: 'Bazén',
    park: 'Park',
    garden: 'Záhrada',
    playground: 'Ihrisko',
    track: 'Dráha',
    picnic_table: 'Pikniková stôl',
    stadium: 'Štadión',
  },
  natural: {
    '*': '{}',
    wood: 'Les',
    water: 'Vodná plocha',
    spring: 'Prameň',
    cave_entrance: 'Jaskyňa',
    basin: 'Kotlina',
    mountain_range: 'Pohorie',
    scrub: 'Kríky',
    heath: 'Step',
    valley: 'Dolina',
    ridge: 'Hrebeň',
    saddle: 'Sedlo',
    peak: 'Vrchol',
    tree: 'Strom',
    plateau: 'Planina',
    arch: 'Skalné okno',
  },
  man_made: {
    '*': '{}',
    pipeline: 'Potrubie',
    beehive: 'Úľ',
    chimney: 'Komín',
    clearcut: 'Rúbanisko',
  },
  power: {
    '*': '{}',
    pole: 'Elektrický stĺp',
    tower: 'Veža vysokého napätia',
    line: 'Elektrické vedenie',
    minor_line: 'Malé elektrické vedenie',
  },
  railway: 'Železnica',
  aerialway: 'Lanovka, vlek',
  shop: {
    '*': 'Obchod {}',
    convenience: 'Potraviny',
    supermarket: 'Supermarket',
    mall: 'Nákupné stredisko',
    department_store: 'Obchodný dom',
    bakery: 'Pekáreň',
    butcher: 'Mäsiareň',
    ice_cream: 'Zmrzlina',
    kiosk: 'Stánok',
    greengrocer: 'Ovocie a zelenina',
    clothes: 'Ochod s oblečením',
    shoes: 'Obuv',
    chemist: 'Drogéria',
    optician: 'Optika',
    florist: 'Kvetinárstvo',
    garden_center: 'Záhradné centrum',
    hardware: 'Železiarstvo',
    paint: 'Farby, laky',
    trade: 'Stavebniny',
  },
  historic: {
    '*': 'Historický objekt',
    wayside_cross: 'Prícestný kríž',
    wayside_shrine: 'Božia muka',
    archaeological_site: 'Archeologická nálezisko',
    monument: 'Pomník, monument',
    monastery: 'Kláštor',
    tomb: 'Hrobka',
    ruins: {
      '*': 'Ruiny',
      ruins: {
        castle: 'Zrúcanina hradu',
      },
    },
  },
  barrier: {
    '*': 'Bariéra {}',
    fence: 'Plot',
    wall: 'Múr',
    hedge: 'Živý plot',
    block: 'Blok',
    entrance: 'Vstup',
    gate: 'Brána',
    lift_gate: 'Závora',
    swing_gate: 'Otočná závora',
    bollard: 'Stĺpiky',
    chain: 'Reťaz',
  },
  sport: {
    '*': 'Šport {}',
    soccer: 'Futbal',
    tennis: 'Tenis',
  },
  tourism: {
    '*': '{}',
    viewpoint: 'Výhľad',
    information: {
      '*': 'Informácie',
      information: {
        '*': 'Informácie {}',
        office: 'Informačná kancelária',
        board: 'Informačná tabuľa',
        guidepost: 'Rázcestník, smerovník',
        map: 'Mapa',
      },
    },
    hotel: 'Hotel',
    attraction: 'Atrakcia',
    artwork: {
      '*': 'Umenie',
      artwork_type: {
        bust: 'Busta',
        sculpture: 'Plastika',
        statue: 'Socha',
        mural: 'Nástenná maľba',
        painting: 'Maľba',
        architecture: 'Významná budova, stavba',
      },
    },
    guest_house: 'Apartmán',
    picnic_site: 'Miesto na piknik',
    camp_site: 'Kemp',
    caravan_site: 'Autokemp pre karavány'
    museum: 'Múzeum',
    chalet: 'Chata',
    hostel: 'Hostel',
    motel: 'Motel',
    zoo: 'ZOO',
  },
  place: {
    '*': 'Miesto {}',
    locality: 'Lokalita',
    village: 'Dedina',
    city: 'Veľkomesto',
    town: 'Mesto',
    country: 'Krajina',
    state: 'Štát',
    suburb: 'Predmestie',
    hamlet: 'Osada',
    isolated_dwelling: 'Samota',
  },
};

export const colorNames: Record<string, string> = {
  red: 'Čevená',
  blue: 'Modrá',
  green: 'Zelená',
  yellow: 'Žltá',
  orange: 'Oranžová',
  purple: 'Fialová',
  violet: 'Fialová',
  white: 'Biela',
  black: 'Čierna',
  gray: 'Sivá',
  brown: 'Hnedá',
};
