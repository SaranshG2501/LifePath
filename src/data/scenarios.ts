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
  },
  {
    id: "first-paycheck",
    title: "First Paycheck — Budget or Blow It?",
    description: "Learn to manage your first salary and make smart financial decisions that impact your future.",
    ageGroup: "16-20",
    category: "Financial Literacy",
    thumbnail: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2000&auto=format&fit=crop",
    initialMetrics: {
      health: 80,
      money: 50,
      happiness: 70,
      knowledge: 50,
      relationships: 75
    },
    scenes: [
      {
        id: "start",
        title: "The Alert — You Got Paid!",
        description: "You wake up to your phone vibrating: \"₹38,000 credited to your account.\" It's your first ever paycheck. You're thrilled — but now what?",
        choices: [
          {
            id: "save",
            text: "Immediately transfer 30% to a savings account",
            nextSceneId: "wants-vs-needs",
            metricChanges: {
              money: 10,
              happiness: -2,
              knowledge: 8
            },
            tooltip: "Building good financial habits early pays off"
          },
          {
            id: "post",
            text: "Screenshot & post it with \"Let's GOOOO\" on Instagram",
            nextSceneId: "wants-vs-needs",
            metricChanges: {
              money: 0,
              happiness: 7,
              relationships: 5,
              knowledge: -2
            },
            tooltip: "Social validation can feel good, but be careful with financial info"
          },
          {
            id: "call-friend",
            text: "Call your best friend to plan a celebration",
            nextSceneId: "wants-vs-needs",
            metricChanges: {
              money: -2,
              happiness: 8,
              relationships: 8
            },
            tooltip: "Sharing joy with close friends strengthens bonds"
          }
        ]
      },
      {
        id: "wants-vs-needs",
        title: "Wants vs. Needs",
        description: "Your wishlist: New phone, sneakers, that designer hoodie. Your needs: Rent, commute, groceries, loan from a friend.",
        choices: [
          {
            id: "budget-split",
            text: "Create a \"fun\" vs \"needs\" split in a money app",
            nextSceneId: "roommate-deal",
            metricChanges: {
              money: 8,
              knowledge: 10,
              happiness: 3
            }
          },
          {
            id: "ask-parents",
            text: "Ask parents what they did with their first check",
            nextSceneId: "roommate-deal",
            metricChanges: {
              knowledge: 8,
              relationships: 5,
              money: 5
            }
          },
          {
            id: "go-shopping",
            text: "Go shopping. You'll budget next month",
            nextSceneId: "roommate-deal",
            metricChanges: {
              money: -10,
              happiness: 10,
              knowledge: -5
            }
          }
        ]
      },
      {
        id: "roommate-deal",
        title: "The Roommate Deal",
        description: "Your classmate wants to share a flat near your work. It's close, fun, but expensive. Your parents say stay home and save.",
        choices: [
          {
            id: "move-in",
            text: "Move in — freedom matters",
            nextSceneId: "impulse-trap",
            metricChanges: {
              money: -15,
              happiness: 10,
              relationships: 5,
              health: -3
            }
          },
          {
            id: "negotiate",
            text: "Negotiate a lower rent with your friend",
            nextSceneId: "impulse-trap",
            metricChanges: {
              money: -5,
              knowledge: 8,
              relationships: 5
            }
          },
          {
            id: "stay-home",
            text: "Stay at home for now and save",
            nextSceneId: "impulse-trap",
            metricChanges: {
              money: 15,
              happiness: -5,
              relationships: -3
            }
          }
        ]
      },
      {
        id: "impulse-trap",
        title: "The Impulse Trap",
        description: "At the mall, your favorite phone is on sale. Sales rep: \"Zero interest EMI! Just ₹2,500/month!\"",
        choices: [
          {
            id: "buy-it",
            text: "Buy it. You work now",
            nextSceneId: "celebration-isolation",
            metricChanges: {
              money: -15,
              happiness: 15,
              knowledge: -5
            }
          },
          {
            id: "compare-deals",
            text: "Compare with refurbished deals online",
            nextSceneId: "celebration-isolation",
            metricChanges: {
              money: -5,
              knowledge: 10,
              happiness: 3
            }
          },
          {
            id: "walk-away",
            text: "Walk away. You'll revisit later",
            nextSceneId: "celebration-isolation",
            metricChanges: {
              money: 5,
              knowledge: 8,
              happiness: -3
            }
          }
        ]
      },
      {
        id: "celebration-isolation",
        title: "Celebration or Isolation?",
        description: "Friends are planning a night out to celebrate your success. ₹3,000 split. You also owe your cousin ₹2,000.",
        choices: [
          {
            id: "join-pay",
            text: "Join and pay for the group — feel generous",
            nextSceneId: "emergency",
            metricChanges: {
              money: -10,
              happiness: 10,
              relationships: 15
            }
          },
          {
            id: "skip",
            text: "Say you're broke — skip and deal with FOMO",
            nextSceneId: "emergency",
            metricChanges: {
              money: 5,
              happiness: -10,
              relationships: -5
            }
          },
          {
            id: "budget-limit",
            text: "Go but set a spending limit",
            nextSceneId: "emergency",
            metricChanges: {
              money: -5,
              happiness: 8,
              knowledge: 5,
              relationships: 7
            }
          }
        ]
      },
      {
        id: "emergency",
        title: "The Emergency",
        description: "End of week: your laptop dies. Work deadline tomorrow. Repair will cost ₹4,000. You have ₹2,000 left.",
        choices: [
          {
            id: "borrow",
            text: "Ask a friend for a temporary loan",
            nextSceneId: "help-past-future",
            metricChanges: {
              money: 0,
              relationships: -2,
              happiness: -5
            }
          },
          {
            id: "emergency-fund",
            text: "Use your emergency fund (if you made one)",
            nextSceneId: "help-past-future",
            metricChanges: {
              money: -5,
              knowledge: 10,
              happiness: 5
            }
          },
          {
            id: "diy-fix",
            text: "Panic and try to DIY fix it",
            nextSceneId: "help-past-future",
            metricChanges: {
              knowledge: 5,
              happiness: -8,
              health: -5
            }
          }
        ]
      },
      {
        id: "help-past-future",
        title: "Help from the Past or Future?",
        description: "You find an online finance course: ₹799. A voice in your head says it's worth it. Another says wait till next month.",
        choices: [
          {
            id: "take-course",
            text: "Invest in yourself — take the course",
            nextSceneId: "credit-card-call",
            metricChanges: {
              money: -3,
              knowledge: 15,
              happiness: 5
            }
          },
          {
            id: "bookmark",
            text: "Bookmark it for later",
            nextSceneId: "credit-card-call",
            metricChanges: {
              money: 0,
              knowledge: 0,
              happiness: -3
            }
          },
          {
            id: "free-videos",
            text: "Watch free videos instead",
            nextSceneId: "credit-card-call",
            metricChanges: {
              money: 0,
              knowledge: 8,
              happiness: 3
            }
          }
        ]
      },
      {
        id: "credit-card-call",
        title: "Credit Card Call",
        description: "Your bank offers a credit card. ₹50,000 limit. \"Perfect for first earners like you!\" they say.",
        choices: [
          {
            id: "accept",
            text: "Accept it. Emergency backup, right?",
            nextSceneId: "rent-due",
            metricChanges: {
              money: 0,
              knowledge: -5,
              happiness: 5
            }
          },
          {
            id: "decline",
            text: "Decline politely",
            nextSceneId: "rent-due",
            metricChanges: {
              money: 3,
              knowledge: 5,
              happiness: 0
            }
          },
          {
            id: "accept-hide",
            text: "Accept but keep it hidden until needed",
            nextSceneId: "rent-due",
            metricChanges: {
              money: 0,
              knowledge: 3,
              happiness: 3
            }
          }
        ]
      },
      {
        id: "rent-due",
        title: "Rent is Due",
        description: "If you moved out, this is where rent hits. Unexpected power bill is also due. If you stayed home, this is where you're asked to contribute or help with chores.",
        choices: [
          {
            id: "cut-back",
            text: "Cut back on food/luxuries to afford bills",
            nextSceneId: "end-of-month",
            metricChanges: {
              money: 5,
              health: -5,
              happiness: -5
            }
          },
          {
            id: "early-payment",
            text: "Ask boss for early payment",
            nextSceneId: "end-of-month",
            metricChanges: {
              money: 3,
              relationships: -3,
              happiness: -3
            }
          },
          {
            id: "borrow-again",
            text: "Borrow again",
            nextSceneId: "end-of-month",
            metricChanges: {
              money: 5,
              relationships: -8,
              happiness: -5
            }
          }
        ]
      },
      {
        id: "end-of-month",
        title: "End of Month Debrief",
        description: "You've lived through your first month of adulting. You reflect on: How much is left in your account? How do you feel about your choices? What would you do differently next time?",
        choices: [
          {
            id: "see-future",
            text: "View a \"Future You\" scenario if you keep the same habits",
            nextSceneId: "ending-financial",
            metricChanges: {},
            tooltip: "See how your current habits affect your future self"
          },
          {
            id: "replay-saver",
            text: "Replay path with a saver mindset",
            nextSceneId: "ending-financial-reflective",
            metricChanges: {},
            tooltip: "Learn what might happen with more financial discipline"
          },
          {
            id: "get-template",
            text: "Download a budget template and start fresh",
            nextSceneId: "ending-financial-proactive",
            metricChanges: {},
            tooltip: "Take practical steps to improve your financial future"
          }
        ],
        isEnding: true
      },
      {
        id: "ending-financial",
        title: "Your Financial Future",
        description: "Based on your choices, you've learned important lessons about managing your first income. Your spending habits have set a foundation for your financial future.",
        choices: [
          {
            id: "complete",
            text: "Complete the journey",
            nextSceneId: "complete",
            metricChanges: {}
          }
        ],
        isEnding: true
      },
      {
        id: "ending-financial-reflective",
        title: "The Path of Saving",
        description: "You consider how your choices might have been different with a saver's mindset. This reflection gives you clarity for your next paycheck.",
        choices: [
          {
            id: "complete",
            text: "Complete the journey",
            nextSceneId: "complete",
            metricChanges: {}
          }
        ],
        isEnding: true
      },
      {
        id: "ending-financial-proactive",
        title: "Budget Master",
        description: "Armed with a budget template, you're ready to take control of your finances with your next paycheck. Financial literacy is a journey!",
        choices: [
          {
            id: "complete",
            text: "Complete the journey",
            nextSceneId: "complete",
            metricChanges: {}
          }
        ],
        isEnding: true
      }
    ]
  },
  {
    id: "party-pressure",
    title: "The Party Pressure",
    description: "Navigate the complex social dynamics of a high school party while staying true to your values and priorities.",
    ageGroup: "14-18",
    category: "Social Skills",
    thumbnail: "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?q=80&w=2000&auto=format&fit=crop",
    initialMetrics: {
      health: 85,
      money: 60,
      happiness: 70,
      knowledge: 75,
      relationships: 65
    },
    scenes: [
      {
        id: "start",
        title: "The Invite",
        description: "You're prepping for a high-stakes exam next week when Aryan texts: \"Party at mine. It's going to be EPIC. You're in, right?\"",
        choices: [
          {
            id: "say-yes",
            text: "Say yes immediately",
            nextSceneId: "hype-pressure",
            metricChanges: {
              happiness: 5,
              knowledge: -5,
              relationships: 5
            },
            tooltip: "Social acceptance feels good, but could impact your study time"
          },
          {
            id: "say-no",
            text: "Say no — you need to study",
            nextSceneId: "hype-pressure",
            metricChanges: {
              happiness: -5,
              knowledge: 8,
              relationships: -5
            },
            tooltip: "Prioritizing academics can be tough but valuable"
          },
          {
            id: "say-maybe",
            text: "Say \"maybe\" and keep options open",
            nextSceneId: "hype-pressure",
            metricChanges: {
              happiness: 2,
              knowledge: 3,
              relationships: 0
            },
            tooltip: "Keeping options open gives you time to think"
          }
        ]
      },
      {
        id: "hype-pressure",
        title: "Hype and Pressure",
        description: "You're bombarded with snaps of pre-party excitement. A friend says, \"Don't be boring, it's just ONE night.\"",
        choices: [
          {
            id: "cave-in",
            text: "Cave in — make it a short visit",
            nextSceneId: "crossroads",
            metricChanges: {
              happiness: 3,
              relationships: 5,
              knowledge: -3
            }
          },
          {
            id: "double-down",
            text: "Double down on studying — exam comes first",
            nextSceneId: "crossroads",
            metricChanges: {
              happiness: -3,
              relationships: -5,
              knowledge: 10
            }
          },
          {
            id: "host-movie",
            text: "Host a chill movie night at home instead",
            nextSceneId: "crossroads",
            metricChanges: {
              happiness: 7,
              relationships: 3,
              knowledge: 0
            }
          }
        ]
      },
      {
        id: "crossroads",
        title: "The Crossroads",
        description: "You get ready. Your sibling asks, \"Are you sure this is a good idea?\" You hesitate. Your backpack is packed — for the party or the library?",
        choices: [
          {
            id: "go-party",
            text: "Go to the party. YOLO",
            nextSceneId: "party-begins",
            metricChanges: {
              happiness: 8,
              relationships: 5,
              knowledge: -8
            }
          },
          {
            id: "go-library",
            text: "Head to the library",
            nextSceneId: "library-path",
            metricChanges: {
              happiness: -5,
              relationships: -5,
              knowledge: 15
            }
          },
          {
            id: "cafe-think",
            text: "Sit in a café and think it over",
            nextSceneId: "cafe-path",
            metricChanges: {
              happiness: 3,
              relationships: 0,
              knowledge: 5
            }
          }
        ]
      },
      {
        id: "party-begins",
        title: "The Party Begins",
        description: "Music's loud, drinks everywhere, someone's already passed out on the beanbag. Aryan grins: \"Finally! You made it!\"",
        choices: [
          {
            id: "join-dance",
            text: "Join the dance floor",
            nextSceneId: "drinks-dares",
            metricChanges: {
              happiness: 10,
              relationships: 8,
              health: -3
            }
          },
          {
            id: "stay-wall",
            text: "Stay near the wall — observe",
            nextSceneId: "drinks-dares",
            metricChanges: {
              happiness: 3,
              relationships:
