export const createdVpsOrderRes = {
  doc: {
    createdAt: '2025-05-28T12:21:54.464Z',
    updatedAt: '2025-05-28T12:22:51.557Z',
    instanceId: 202629405,

    userData: {
      image: {
        imageId: 'afecbb85-e2fc-46f0-9684-b46b1faf00bb',
        priceId: 'price_1RT3pzE7vQPggCT0LP2aW5Cq',
      },

      product: {
        productId: 'V95',
        priceId: 'price_1RTEZbE7vQPggCT07UUTdzO3',
      },
      displayName: 'dflow-ryzolve',

      region: {
        code: 'US-central',
        priceId: 'price_1RTEf0E7vQPggCT0h8fy8YmS',
      },
      card: '',
      defaultUser: 'root',
      rootPassword: 141086,

      period: {
        months: 1,
        priceId: 'price_1RTEdAE7vQPggCT0qmgpILs2',
      },

      sshKeys: [168239],
      plan: '683192f7cde97fe261b06f1d',

      addOns: {
        backup: {},
        priceId: 'price_1RTEmOE7vQPggCT0T1jfPQ2e',
      },
    },

    instanceResponse: {
      tenantId: 'INT',
      customerId: '13750619',

      additionalIps: [],
      name: 'vmi2629405',
      displayName: 'dflow-ryzolve',
      instanceId: 202629405,
      dataCenter: 'United States (Central) 1',
      region: 'US-central',
      regionName: 'United States (Central)',
      productId: 'V95',
      imageId: 'afecbb85-e2fc-46f0-9684-b46b1faf00bb',

      ipConfig: {
        v4: {
          ip: '66.94.119.73',
          gateway: '66.94.119.1',
          netmask: '255.255.255.0',
          network: '66.94.119.0',
          broadcast: '66.94.119.255',
          netmaskCidr: 24,
        },

        v6: {
          ip: '2605:a140:2262:9405:0000:0000:0000:0001',
          gateway: 'fe80::1',
          netmaskCidr: 64,
        },
      },
      macAddress: '00:50:56:5a:e0:ab',
      ramMb: 12288,
      cpuCores: 6,
      osType: 'Linux',
      diskMb: 204800,

      sshKeys: [168239],
      createdDate: '2025-05-28T12:21:53.330Z',
      cancelDate: null,
      status: 'running',
      vHostId: 12656,
      vHostNumber: 16389,
      vHostName: 'm16389',

      addOns: [],
      productType: 'ssd',
      productName: '',
      defaultUser: 'root',
    },

    user: {
      createdAt: '2025-05-28T00:15:20.618Z',
      updatedAt: '2025-05-28T12:21:49.440Z',
      username: 'ryzolve',

      role: ['user'],

      discord: {},
      hasClaimedFreeCredits: false,
      stripe_customer_code: 'cus_SOKJFdiO90kKTN',
      apiKey: 'b7105e31-668a-4d73-9511-77fe912447c3',
      email: 'its@ryzolve.com',
      _verified: true,
      wallet: 0,
      emailVerified: '2025-05-28T00:00:00.000Z',
      enableAPIKey: true,
      id: '68365598ae45a6bd6e1ef34f',
      loginAttempts: 0,
    },

    plan: {
      createdAt: '2025-05-24T09:35:51.559Z',
      updatedAt: '2025-05-27T04:06:34.607Z',
      name: 'Cloud VPS 20',
      slug: 'cloud-vps-20',
      slugLock: true,
      platform: 'contabo',

      cpu: {
        type: 'virtual',
        cores: 6,
      },

      ram: {
        size: 12,
        unit: 'GB',
      },

      storageOptions: [
        {
          type: 'SSD',
          size: 200,
          unit: 'GB',

          price: {
            type: 'free',
          },
          productId: 'V95',
          stripePriceId: 'price_1RTEZbE7vQPggCT07UUTdzO3',
          id: '68318c04bb9f19781c6cd1fa',
        },

        {
          type: 'NVMe',
          size: 100,
          unit: 'GB',

          price: {
            type: 'free',
          },
          productId: 'V94',
          stripePriceId: 'price_1RTEbuE7vQPggCT0n1bGVlAX',
          id: '68318d84bb9f19781c6cd1fb',
        },

        {
          type: 'SSD',
          size: 400,
          unit: 'GB',

          price: {
            type: 'paid',
            amount: 4.8,
          },
          productId: 'V96',
          stripePriceId: 'price_1RTEcWE7vQPggCT0XGzPBqzv',
          id: '68318dc8bb9f19781c6cd1fc',
        },
      ],
      snapshots: 2,

      bandwidth: {
        traffic: 32,
        trafficUnit: 'TB',
        incomingUnlimited: true,
      },

      pricing: [
        {
          period: 1,
          price: 23.85,
          stripePriceId: 'price_1RTEdAE7vQPggCT0qmgpILs2',
          id: '68318e5dbb9f19781c6cd1fd',
        },
      ],

      regionOptions: [
        {
          region: 'European Union',
          regionCode: 'EU',
          latencyQuality: 'good',

          price: {
            type: 'free',
          },
          stripePriceId: 'price_1RT3gfE7vQPggCT0Tizb3yII',
          id: '68318ebdbb9f19781c6cd1fe',
        },

        {
          region: 'United States (Central)',
          regionCode: 'US-central',
          latencyQuality: 'good',

          price: {
            type: 'paid',
            amount: 3.6,
          },
          stripePriceId: 'price_1RTEf0E7vQPggCT0h8fy8YmS',
          id: '68318ee3bb9f19781c6cd1ff',
        },

        {
          region: 'United Kingdom',
          regionCode: 'UK',
          latencyQuality: 'good',

          price: {
            type: 'paid',
            amount: 3.6,
          },
          stripePriceId: 'price_1RTEgiE7vQPggCT0LS2mEs1g',
          id: '68318f6cbb9f19781c6cd200',
        },

        {
          region: 'United States (East)',
          regionCode: 'US-east',
          latencyQuality: 'good',

          price: {
            type: 'paid',
            amount: 5.6,
          },
          stripePriceId: 'price_1RTEhJE7vQPggCT0pEnPDpRv',
          id: '68318fc0bb9f19781c6cd201',
        },

        {
          region: 'United States (West)',
          regionCode: 'US-west',
          latencyQuality: 'good',

          price: {
            type: 'paid',
            amount: 4.6,
          },
          stripePriceId: 'price_1RTEhrE7vQPggCT0WoxHzaoM',
          id: '6831905abb9f19781c6cd202',
        },

        {
          region: 'Asia (Singapore)',
          regionCode: 'SIN',
          latencyQuality: 'best',

          price: {
            type: 'paid',
            amount: 8.8,
          },
          stripePriceId: 'price_1RTEiSE7vQPggCT0YA8C0RES',
          id: '683190a7bb9f19781c6cd203',
        },

        {
          region: 'Asia (Japan)',
          regionCode: 'JPN',
          latencyQuality: 'best',

          price: {
            type: 'paid',
            amount: 9,
          },
          stripePriceId: 'price_1RTEj7E7vQPggCT0YDXc24RO',
          id: '683190e9bb9f19781c6cd204',
        },

        {
          region: 'Asia (India)',
          regionCode: 'IND',
          latencyQuality: 'best',

          price: {
            type: 'paid',
            amount: 8.4,
          },
          stripePriceId: 'price_1RTEjhE7vQPggCT066v3UxhJ',
          id: '6831912fbb9f19781c6cd205',
        },

        {
          region: 'Australia (Sydney)',
          regionCode: 'AUS',
          latencyQuality: 'best',

          price: {
            type: 'paid',
            amount: 7.4,
          },
          stripePriceId: 'price_1RTEkDE7vQPggCT0tJXW9VwN',
          id: '68319184bb9f19781c6cd206',
        },
      ],

      images: [
        {
          category: 'os',
          name: 'ubuntu',
          label: 'Ubuntu',

          versions: [
            {
              imageId: 'afecbb85-e2fc-46f0-9684-b46b1faf00bb',
              version: 'ubuntu-22.04',
              label: 'Ubuntu-22.04',

              price: {
                type: 'included',
              },
              stripePriceId: 'price_1RT3pzE7vQPggCT0LP2aW5Cq',
              id: '683191cbbb9f19781c6cd208',
            },

            {
              imageId: 'db1409d2-ed92-4f2f-978e-7b2fa4a1ec90',
              version: 'ubuntu-20.04',
              label: 'Ubuntu-20.04',

              price: {
                type: 'included',
              },
              stripePriceId: 'price_1RT3rDE7vQPggCT0h8OCWsj3',
              id: '683191f7bb9f19781c6cd209',
            },
          ],
          id: '683191c2bb9f19781c6cd207',
        },
      ],

      loginDetails: {
        username: 'root',
        useSSHKeys: true,
      },

      backupOptions: [
        {
          type: 'none',
          label: 'None',
          mode: 'manual',
          frequency: 'on_demand',
          recovery: 'manual',

          price: {
            type: 'included',
          },
          stripePriceId: 'price_1RT3ryE7vQPggCT0ieS8aVsM',
          id: '68319213bb9f19781c6cd20a',
        },

        {
          type: 'auto',
          label: 'Auto Backup',
          mode: 'automated',
          frequency: 'daily',
          recovery: 'one_click',
          retention: 10,

          price: {
            type: 'paid',
            amount: 4.9,
          },
          stripePriceId: 'price_1RTEmOE7vQPggCT0T1jfPQ2e',
          id: '68319240bb9f19781c6cd20b',
        },
      ],

      networking: {
        privateNetworking: [],

        bandwidth: [],

        ipv4: [],
      },

      addOns: {
        objectStorage: [],

        serverManagement: [],

        monitoring: [],

        ssl: [],
      },
      id: '683192f7cde97fe261b06f1d',
    },
    stripe_subscription_id: 'sub_1RTizNE7vQPggCT0VrQWlLaA',
    last_billed_date: '2025-05-28T12:21:45.000Z',
    next_billing_date: '2025-06-28T12:21:45.000Z',
    cancel_at_period_end: false,
    subscription_status: 'active',
    id: '6836ffe230361734a8e2a864',
  },
  message: 'Vps Order successfully created.',
}
