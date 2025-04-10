
import { Scenario } from "@/types/game";

export const scenarios: Scenario[] = [
  {
    id: "first-job",
    title: "Your First Job",
    description: "Navigate the challenges of having your first job and managing your own money.",
    ageGroup: "14-18",
    category: "Finance",
    thumbnail: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=2000&auto=format&fit=crop",
    initialMetrics: {
      health: 80,
      money: 50,
      happiness: 70,
      knowledge: 50,
      relationships: 70
    },
    scenes: [
      {
        id: "start",
        title: "The Job Offer",
        description: "Congratulations! You've been offered a part-time job at the local café. It pays $12 per hour, and you'll work 15 hours per week. What will you do with your first paycheck?",
        choices: [
          {
            id: "save",
            text: "Save most of it for college",
            nextSceneId: "saving-choice",
            metricChanges: {
              money: 10,
              happiness: -5,
              knowledge: 5
            },
            tooltip: "Building savings early is a smart financial habit"
          },
          {
            id: "spend",
            text: "Buy those new shoes you've been wanting",
            nextSceneId: "spending-choice",
            metricChanges: {
              money: -10,
              happiness: 10,
              relationships: 5
            },
            tooltip: "Treating yourself can boost happiness, but costs money"
          },
          {
            id: "balance",
            text: "Save half, spend half",
            nextSceneId: "balance-choice",
            metricChanges: {
              money: 5,
              happiness: 5,
              knowledge: 3
            },
            tooltip: "A balanced approach to finances"
          }
        ]
      },
      {
        id: "saving-choice",
        title: "The Saver",
        description: "You've decided to save most of your first paycheck. Your friends are going to the movies this weekend, but you're trying to stick to your savings plan.",
        choices: [
          {
            id: "strict-save",
            text: "Stick to your savings plan and skip the movies",
            nextSceneId: "missed-social",
            metricChanges: {
              money: 5,
              happiness: -5,
              relationships: -5
            }
          },
          {
            id: "budget-movies",
            text: "Go to the movies but skip the expensive snacks",
            nextSceneId: "budget-social",
            metricChanges: {
              money: -2,
              happiness: 3,
              relationships: 5
            }
          },
          {
            id: "ask-cheaper",
            text: "Suggest a cheaper alternative activity to your friends",
            nextSceneId: "alternative-fun",
            metricChanges: {
              money: 0,
              happiness: 5,
              relationships: 7,
              knowledge: 3
            }
          }
        ]
      },
      {
        id: "spending-choice",
        title: "The New Shoes",
        description: "You bought those awesome shoes you wanted! You look great, but now your car needs a small repair and you're a bit short on cash.",
        choices: [
          {
            id: "borrow",
            text: "Borrow money from your parents",
            nextSceneId: "borrowed-money",
            metricChanges: {
              money: 5,
              happiness: -3,
              relationships: -2
            }
          },
          {
            id: "extra-shift",
            text: "Pick up an extra shift at work",
            nextSceneId: "worked-more",
            metricChanges: {
              money: 8,
              health: -3,
              knowledge: 2
            }
          },
          {
            id: "delay-repair",
            text: "Delay the repair until next paycheck",
            nextSceneId: "delayed-repair",
            metricChanges: {
              money: 0,
              health: -2,
              happiness: -5
            }
          }
        ]
      },
      {
        id: "balance-choice",
        title: "The Middle Path",
        description: "You saved half and treated yourself with the other half. Now you've been invited to a concert that costs more than you planned to spend this month.",
        choices: [
          {
            id: "skip-concert",
            text: "Skip the concert to stick to your budget",
            nextSceneId: "responsible-choice",
            metricChanges: {
              money: 5,
              happiness: -5,
              relationships: -3
            }
          },
          {
            id: "adjust-budget",
            text: "Go to the concert but adjust next month's budget",
            nextSceneId: "budget-adjustment",
            metricChanges: {
              money: -5,
              happiness: 7,
              knowledge: 3,
              relationships: 5
            }
          },
          {
            id: "side-gig",
            text: "Find a quick side gig to earn extra money",
            nextSceneId: "entrepreneurial",
            metricChanges: {
              money: 3,
              health: -2,
              knowledge: 7,
              happiness: 2
            }
          }
        ]
      },
      {
        id: "missed-social",
        title: "Sticking to the Plan",
        description: "You skipped the movies to save money. Your savings account is growing, but you missed out on the fun everyone had.",
        choices: [
          {
            id: "ending-1",
            text: "See your results",
            nextSceneId: "ending-saver",
            metricChanges: {},
            tooltip: "See how your journey turned out"
          }
        ],
        isEnding: true
      },
      {
        id: "budget-social",
        title: "Budget Movie Night",
        description: "You went to the movies but skipped the expensive snacks. You had fun with friends while still mostly staying on budget.",
        choices: [
          {
            id: "ending-2",
            text: "See your results",
            nextSceneId: "ending-smart-spender",
            metricChanges: {},
            tooltip: "See how your journey turned out"
          }
        ],
        isEnding: true
      },
      {
        id: "alternative-fun",
        title: "Creative Social Planning",
        description: "Your suggestion of a board game night at your place was a hit! Everyone had fun and you spent almost nothing.",
        choices: [
          {
            id: "ending-3",
            text: "See your results",
            nextSceneId: "ending-social-planner",
            metricChanges: {},
            tooltip: "See how your journey turned out"
          }
        ],
        isEnding: true
      },
      {
        id: "borrowed-money",
        title: "Family Loan",
        description: "Your parents lent you the money for the car repair, but reminded you about financial responsibility.",
        choices: [
          {
            id: "ending-4",
            text: "See your results",
            nextSceneId: "ending-dependent",
            metricChanges: {},
            tooltip: "See how your journey turned out"
          }
        ],
        isEnding: true
      },
      {
        id: "worked-more",
        title: "Extra Hours",
        description: "You picked up extra shifts and earned enough for the repair. You're tired but proud of your work ethic.",
        choices: [
          {
            id: "ending-5",
            text: "See your results",
            nextSceneId: "ending-hard-worker",
            metricChanges: {},
            tooltip: "See how your journey turned out"
          }
        ],
        isEnding: true
      },
      {
        id: "delayed-repair",
        title: "Car Troubles",
        description: "Delaying the repair made the problem worse, and now it costs even more to fix.",
        choices: [
          {
            id: "ending-6",
            text: "See your results",
            nextSceneId: "ending-procrastinator",
            metricChanges: {},
            tooltip: "See how your journey turned out"
          }
        ],
        isEnding: true
      },
      {
        id: "responsible-choice",
        title: "Budget Master",
        description: "You skipped the concert and stuck to your budget. Your bank account looks healthy, but you missed a memorable night.",
        choices: [
          {
            id: "ending-7",
            text: "See your results",
            nextSceneId: "ending-budget-master",
            metricChanges: {},
            tooltip: "See how your journey turned out"
          }
        ],
        isEnding: true
      },
      {
        id: "budget-adjustment",
        title: "Flexibility Wins",
        description: "The concert was amazing! You'll need to be a bit more frugal next month, but the experience was worth it.",
        choices: [
          {
            id: "ending-8",
            text: "See your results",
            nextSceneId: "ending-flexible-planner",
            metricChanges: {},
            tooltip: "See how your journey turned out"
          }
        ],
        isEnding: true
      },
      {
        id: "entrepreneurial",
        title: "Side Hustle Hero",
        description: "You found some yard work in the neighborhood and earned enough for the concert! You're tired but learned about entrepreneurship.",
        choices: [
          {
            id: "ending-9",
            text: "See your results",
            nextSceneId: "ending-entrepreneur",
            metricChanges: {},
            tooltip: "See how your journey turned out"
          }
        ],
        isEnding: true
      }
    ]
  },
  {
    id: "peer-pressure",
    title: "Navigating Peer Pressure",
    description: "Learn to make your own decisions when friends are pressuring you to do something you're not sure about.",
    ageGroup: "10-14",
    category: "Social Skills",
    thumbnail: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2000&auto=format&fit=crop",
    initialMetrics: {
      health: 80,
      money: 60,
      happiness: 70,
      knowledge: 60,
      relationships: 75
    },
    scenes: [
      {
        id: "start",
        title: "The Invitation",
        description: "Your new friends invited you to hang out after school, but they're planning to skip their homework and play video games all night. You have a math test tomorrow.",
        choices: [
          {
            id: "join",
            text: "Join them - you don't want to seem uncool",
            nextSceneId: "join-friends",
            metricChanges: {
              happiness: 5,
              knowledge: -10,
              relationships: 5
            },
            tooltip: "Fitting in feels good, but at what cost?"
          },
          {
            id: "decline",
            text: "Decline and study for your test",
            nextSceneId: "study-alone",
            metricChanges: {
              happiness: -5,
              knowledge: 10,
              relationships: -5
            },
            tooltip: "Standing your ground can be difficult but rewarding"
          },
          {
            id: "compromise",
            text: "Suggest studying together first, then playing for a short time",
            nextSceneId: "compromise-solution",
            metricChanges: {
              happiness: 3,
              knowledge: 5,
              relationships: 7
            },
            tooltip: "Finding a middle ground can create win-win solutions"
          }
        ]
      },
      {
        id: "join-friends",
        title: "Gaming Night",
        description: "You had fun playing games with your friends, but now it's late and you haven't studied at all for tomorrow's test.",
        choices: [
          {
            id: "all-nighter",
            text: "Pull an all-nighter to catch up on studying",
            nextSceneId: "tired-for-test",
            metricChanges: {
              health: -10,
              knowledge: 5,
              happiness: -5
            }
          },
          {
            id: "wing-it",
            text: "Just wing the test - one bad grade won't matter",
            nextSceneId: "failed-test",
            metricChanges: {
              knowledge: -5,
              happiness: -5
            }
          },
          {
            id: "ask-friend",
            text: "Text a studious friend for help",
            nextSceneId: "friend-helps",
            metricChanges: {
              knowledge: 3,
              relationships: 5
            }
          }
        ]
      },
      // Additional scenes would be defined here...
      {
        id: "tired-for-test",
        title: "Test Day Exhaustion",
        description: "You stayed up all night studying but you're so tired you can barely keep your eyes open during the test.",
        choices: [
          {
            id: "ending-10",
            text: "See your results",
            nextSceneId: "ending-exhausted",
            metricChanges: {},
            tooltip: "See how your journey turned out"
          }
        ],
        isEnding: true
      },
      {
        id: "failed-test",
        title: "Test Consequences",
        description: "You failed the test. Your teacher seems disappointed and your parents aren't happy when they find out.",
        choices: [
          {
            id: "ending-11",
            text: "See your results",
            nextSceneId: "ending-slacker",
            metricChanges: {},
            tooltip: "See how your journey turned out"
          }
        ],
        isEnding: true
      },
      {
        id: "friend-helps",
        title: "Last-Minute Help",
        description: "Your friend sent you some study notes. You didn't learn everything, but you got the main concepts for the test.",
        choices: [
          {
            id: "ending-12",
            text: "See your results",
            nextSceneId: "ending-networker",
            metricChanges: {},
            tooltip: "See how your journey turned out"
          }
        ],
        isEnding: true
      }
    ]
  }
];
