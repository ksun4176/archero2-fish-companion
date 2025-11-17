export const basePath = '/archero2-fish-companion';

export enum QuestName {
  SilverTickets = 'Silver Tickets',
  DailyLogin = 'Daily Login',
  SealBattle = 'Seal Battles',
  ClaimAfkRewards = 'Claim AFK Rewards',
  UseGems = 'Use Gems',
  Keys = 'Keys',
  Shovels = 'Shovels',
  GoldCave = 'Gold Cave',
  KillMinions = 'Kill Minions',
  KillBosses = 'Kill Bosses',
  Arena = 'Arena',
  Pack = 'Pack',
}

export type Quest = {
  name: QuestName;
  breakpoints: [number[], number[]];
  placeholderText: string;
};

export const Quests: Quest[] = [
  {
    name: QuestName.SilverTickets,
    breakpoints: [
      [20, 60, 120, 200],
      [20, 40, 60, 80],
    ],
    placeholderText: '# Bought',
  },
  {
    name: QuestName.Pack,
    breakpoints: [
      Array(7)
        .fill(0)
        .map((_v, index) => index + 1),
      Array(7).fill(2),
    ],
    placeholderText: '# Bought',
  },
  {
    name: QuestName.DailyLogin,
    breakpoints: [
      [1, 2, 3, 4, 5],
      [10, 5, 5, 5, 5],
    ],
    placeholderText: '# Days',
  },
  {
    name: QuestName.GoldCave,
    breakpoints: [[2, 4, 8, 10], Array(4).fill(5)],
    placeholderText: '# Done',
  },
  {
    name: QuestName.KillMinions,
    breakpoints: [[500, 1000, 1500, 2000, 3000], Array(5).fill(3)],
    placeholderText: '# Killed',
  },
  {
    name: QuestName.SealBattle,
    breakpoints: [[2, 6, 8, 10], Array(4).fill(5)],
    placeholderText: '# Done',
  },
  {
    name: QuestName.KillBosses,
    breakpoints: [[5, 10, 20, 30], Array(4).fill(3)],
    placeholderText: '# Killed',
  },
  {
    name: QuestName.ClaimAfkRewards,
    breakpoints: [[3, 5, 10, 15, 20], Array(5).fill(3)],
    placeholderText: '# Collected',
  },
  {
    name: QuestName.Arena,
    breakpoints: [
      Array(4)
        .fill(0)
        .map((_v, index) => (index + 1) * 5),
      Array(4).fill(5),
    ],
    placeholderText: '# Done',
  },
  {
    name: QuestName.Keys,
    breakpoints: [
      Array(5)
        .fill(0)
        .map((_v, index) => (index + 1) * 10),
      Array(5).fill(5),
    ],
    placeholderText: '# Used',
  },
  {
    name: QuestName.UseGems,
    breakpoints: [
      [200, 500, 1000, 2000, 3000],
      [5, 5, 5, 5, 5],
    ],
    placeholderText: '# Used',
  },
  {
    name: QuestName.Shovels,
    breakpoints: [
      [5, 10, 15, 20, 30, 40, 50, 60, 70, 80],
      [5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
    ],
    placeholderText: '# Used',
  },
];
