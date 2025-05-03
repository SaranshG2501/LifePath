import { Scenario } from "@/types/game";

export const scenarios: Scenario[] = [
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
              relationships: 0,
              knowledge: 5
            }
          }
        ]
      },
      {
        id: "drinks-dares",
        title: "Drinks and Dares",
        description: "You're at the party. A dare: \"Who's the most attractive person in the room?\"",
        choices: [
          {
            id: "answer-dare",
            text: "Answer the dare",
            nextSceneId: "party-fun",
            metricChanges: {
              happiness: 5,
              relationships: 5,
              knowledge: 5
            }
          },
          {
            id: "ignore-dare",
            text: "Ignore the dare",
            nextSceneId: "party-fun",
            metricChanges: {
              happiness: 0,
              relationships: 0,
              knowledge: 0
            }
          }
        ]
      },
      {
        id: "party-fun",
        title: "Party Fun",
        description: "You're having a great time. You meet new people, have fun, and enjoy the music.",
        choices: [
          {
            id: "ending-13",
            text: "See your results",
            nextSceneId: "ending-party",
            metricChanges: {},
            tooltip: "See how your journey turned out"
          }
        ],
        isEnding: true
      },
      {
        id: "ending-party",
        title: "The Party",
        description: "You've had a great time at the party. You're tired but happy. You're proud of yourself for staying true to your values.",
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
    id: "climate-council",
    title: "The Climate Council",
    description: "Make difficult decisions about climate policy as part of a youth climate council.",
    ageGroup: "14-20",
    category: "Ethics",
    thumbnail: "https://images.unsplash.com/photo-1518495973542-4542c06a5843",
    initialMetrics: {
      health: 80,
      money: 65,
      happiness: 70,
      knowledge: 75,
      relationships: 70
    },
    scenes: [
      {
        id: "start",
        title: "The Summoning",
        description: "You're chosen to be on your country's Youth Climate Council. You're joining a summit where decisions will affect global carbon policy.",
        choices: [
          {
            id: "speak-boldly",
            text: "Speak boldly about climate injustice",
            nextSceneId: "global-stakeholders",
            metricChanges: {
              knowledge: 8,
              relationships: 5,
              happiness: 5
            },
            tooltip: "Speaking your truth can inspire others"
          },
          {
            id: "focus-realistic",
            text: "Focus on realistic, economically viable ideas",
            nextSceneId: "global-stakeholders",
            metricChanges: {
              knowledge: 5,
              money: 8,
              relationships: 3
            },
            tooltip: "Practical solutions may be easier to implement"
          },
          {
            id: "observe",
            text: "Quietly observe the political dynamics first",
            nextSceneId: "global-stakeholders",
            metricChanges: {
              knowledge: 10,
              happiness: -2,
              relationships: 0
            },
            tooltip: "Sometimes it's wise to understand before speaking"
          }
        ]
      },
      {
        id: "global-stakeholders",
        title: "Global Stakeholders",
        description: "You sit in a room with ministers from rich and poor nations. One delegate says: \"Developing nations should cut too!\" Another replies: \"You polluted for 100 years!\"",
        choices: [
          {
            id: "push-equity",
            text: "Push for climate equity — demand fairness",
            nextSceneId: "industry-pushback",
            metricChanges: {
              knowledge: 5,
              relationships: 8,
              happiness: 5
            }
          },
          {
            id: "suggest-universal",
            text: "Suggest a universal, measurable commitment",
            nextSceneId: "industry-pushback",
            metricChanges: {
              knowledge: 8,
              money: 5,
              relationships: 5
            }
          },
          {
            id: "stay-neutral",
            text: "Stay neutral — you want to listen more",
            nextSceneId: "industry-pushback",
            metricChanges: {
              knowledge: 10,
              relationships: 2,
              happiness: 0
            }
          }
        ]
      },
      {
        id: "industry-pushback",
        title: "Industry Pushback",
        description: "Big Oil lobbyists warn, \"Carbon tax will destroy jobs!\" Meanwhile, youth protests chant outside for zero emissions.",
        choices: [
          {
            id: "slow-transition",
            text: "Support a slow transition — reduce backlash",
            nextSceneId: "science-briefing",
            metricChanges: {
              money: 8,
              happiness: -5,
              relationships: 3
            }
          },
          {
            id: "green-jobs",
            text: "Propose a \"green jobs\" offset program",
            nextSceneId: "science-briefing",
            metricChanges: {
              money: 5,
              knowledge: 8,
              relationships: 5
            }
          },
          {
            id: "strict-regulation",
            text: "Push for strict regulation, even if unpopular",
            nextSceneId: "science-briefing",
            metricChanges: {
              knowledge: 10,
              money: -8,
              happiness: 5
            }
          }
        ]
      },
      {
        id: "science-briefing",
        title: "The Science Briefing",
        description: "A secret report shows the world has 8 years to avoid catastrophic damage. But releasing it now could panic investors.",
        choices: [
          {
            id: "leak-anonymously",
            text: "Leak it anonymously",
            nextSceneId: "dilemma-delay",
            metricChanges: {
              knowledge: 5,
              money: -10,
              relationships: -5
            }
          },
          {
            id: "share-leaders",
            text: "Share it with council leaders only",
            nextSceneId: "dilemma-delay",
            metricChanges: {
              knowledge: 8,
              money: 5,
              relationships: 8
            }
          },
          {
            id: "public-release",
            text: "Recommend public release with calm framing",
            nextSceneId: "dilemma-delay",
            metricChanges: {
              knowledge: 10,
              happiness: -5,
              relationships: 5
            }
          }
        ]
      },
      {
        id: "dilemma-delay",
        title: "The Dilemma of Delay",
        description: "A rich nation proposes delaying cuts by 10 years, in exchange for funding green energy in poorer nations.",
        choices: [
          {
            id: "accept-delay",
            text: "Accept — it's better than nothing",
            nextSceneId: "protest-storm",
            metricChanges: {
              money: 10,
              happiness: -5,
              relationships: 3
            }
          },
          {
            id: "reject-delay",
            text: "Reject — delay is deadly",
            nextSceneId: "protest-storm",
            metricChanges: {
              knowledge: 8,
              money: -8,
              happiness: 5
            }
          },
          {
            id: "negotiate-terms",
            text: "Negotiate for legally binding terms",
            nextSceneId: "protest-storm",
            metricChanges: {
              knowledge: 10,
              money: 5,
              relationships: 8
            }
          }
        ]
      },
      {
        id: "protest-storm",
        title: "The Protest Storm",
        description: "Activists storm the council building. Your speech earlier is on their signs — \"NO PLANET B.\" Your rep is rising.",
        choices: [
          {
            id: "join-protest",
            text: "Join the protest",
            nextSceneId: "green-tech-gamble",
            metricChanges: {
              happiness: 10,
              relationships: 8,
              money: -5
            }
          },
          {
            id: "call-dialogue",
            text: "Call for dialogue between both sides",
            nextSceneId: "green-tech-gamble",
            metricChanges: {
              knowledge: 8,
              relationships: 5,
              happiness: 3
            }
          },
          {
            id: "distance-yourself",
            text: "Distance yourself — optics matter",
            nextSceneId: "green-tech-gamble",
            metricChanges: {
              money: 5,
              relationships: -5,
              happiness: -5
            }
          }
        ]
      },
      {
        id: "green-tech-gamble",
        title: "Green Tech Gamble",
        description: "You can back a risky but revolutionary climate tech (like direct air capture). But it's expensive and untested.",
        choices: [
          {
            id: "invest-support",
            text: "Invest full support — this is our moonshot",
            nextSceneId: "deal-or-no-deal",
            metricChanges: {
              knowledge: 10,
              money: -10,
              happiness: 8
            }
          },
          {
            id: "phased-testing",
            text: "Recommend phased testing only",
            nextSceneId: "deal-or-no-deal",
            metricChanges: {
              knowledge: 8,
              money: -5,
              happiness: 3
            }
          },
          {
            id: "known-solutions",
            text: "Prioritize known solutions instead",
            nextSceneId: "deal-or-no-deal",
            metricChanges: {
              knowledge: 5,
              money: 5,
              happiness: 0
            }
          }
        ]
      },
      {
        id: "deal-or-no-deal",
        title: "Deal or No Deal",
        description: "Final treaty terms are brutal: If you agree, there's backlash at home. If you don't, the talks collapse.",
        choices: [
          {
            id: "sign-agree",
            text: "Sign and face the consequences",
            nextSceneId: "local-fallout",
            metricChanges: {
              knowledge: 8,
              money: -8,
              relationships: 5
            }
          },
          {
            id: "walk-out",
            text: "Walk out — it's not good enough",
            nextSceneId: "local-fallout",
            metricChanges: {
              happiness: 5,
              relationships: -5,
              money: 0
            }
          },
          {
            id: "temporary-framework",
            text: "Suggest a temporary framework",
            nextSceneId: "local-fallout",
            metricChanges: {
              knowledge: 10,
              relationships: 8,
              money: 3
            }
          }
        ]
      },
      {
        id: "local-fallout",
        title: "Local Fallout",
        description: "Back home: People are jobless due to the green shift. Protests erupt. News anchors call you a traitor to industry.",
        choices: [
          {
            id: "apologize-relief",
            text: "Apologize and promise economic relief",
            nextSceneId: "ten-years-later",
            metricChanges: {
              relationships: 8,
              money: -5,
              happiness: -3
            }
          },
          {
            id: "defend-choices",
            text: "Defend your choices proudly",
            nextSceneId: "ten-years-later",
            metricChanges: {
              knowledge: 8,
              relationships: -5,
              happiness: 5
            }
          },
          {
            id: "go-silent",
            text: "Go silent — let things cool down",
            nextSceneId: "ten-years-later",
            metricChanges: {
              money: 5,
              relationships: 0,
              happiness: -5
            }
          }
        ]
      },
      {
        id: "ten-years-later",
        title: "10 Years Later",
        description: "You see the effects of your policy: Oceans rising? Cities adapting? Carbon levels dropping? A young kid interviews you: \"What would you do differently if you could go back?\"",
        choices: [
          {
            id: "own-everything",
            text: "Own everything — good and bad",
            nextSceneId: "ending-climate-leader",
            metricChanges: {},
            tooltip: "See how your journey turned out"
          }
        ],
        isEnding: true
      },
      {
        id: "ending-climate-leader",
        title: "Climate Leader",
        description: "Your decisions have shaped global climate policy. Whether perfect or flawed, you stood up when it mattered.",
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
    id: "friend-in-trouble",
    title: "The Friend in Trouble",
    description: "Your friend has made a serious mistake. Will you help them, report them, or find another way?",
    ageGroup: "14-18",
    category: "Ethics",
    thumbnail: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2000&auto=format&fit=crop",
    initialMetrics: {
      health: 80,
      money: 60,
      happiness: 70,
      knowledge: 70,
      relationships: 85
    },
    scenes: [
      {
        id: "start",
        title: "The Midnight Call",
        description: "It's 1:47 AM. Your phone buzzes. It's your best friend. \"Bro, I messed up. Please don't hang up. I don't know who else to call.\" They're out, panicked, and maybe in trouble with the law.",
        choices: [
          {
            id: "ask-what-happened",
            text: "Ask what happened first",
            nextSceneId: "confession",
            metricChanges: {
              knowledge: 8,
              relationships: 5,
              happiness: -3
            },
            tooltip: "Gathering information before acting"
          },
          {
            id: "say-on-way",
            text: "Say you're on your way",
            nextSceneId: "confession",
            metricChanges: {
              relationships: 10,
              happiness: -5,
              health: -5
            },
            tooltip: "Immediate loyalty can strengthen bonds"
          },
          {
            id: "tell-calm-down",
            text: "Tell them to calm down and call their parents",
            nextSceneId: "confession",
            metricChanges: {
              knowledge: 5,
              relationships: -8,
              happiness: 0
            },
            tooltip: "Sometimes the responsible choice isn't popular"
          }
        ]
      },
      {
        id: "confession",
        title: "The Confession",
        description: "They admit it — they were at a party, tried to drive, and crashed a bike. No one is hurt… but there was alcohol involved.",
        choices: [
          {
            id: "turn-themselves-in",
            text: "Tell them to turn themselves in",
            nextSceneId: "secret-ride",
            metricChanges: {
              knowledge: 10,
              relationships: -10,
              happiness: -5
            }
          },
          {
            id: "offer-pickup",
            text: "Offer to pick them up and hide them",
            nextSceneId: "secret-ride",
            metricChanges: {
              relationships: 10,
              happiness: -3,
              health: -5
            }
          },
          {
            id: "think-together",
            text: "Say you'll think of a plan together",
            nextSceneId: "secret-ride",
            metricChanges: {
              knowledge: 5,
              relationships: 8,
              happiness: 0
            }
          }
        ]
      },
      {
        id: "secret-ride",
        title: "The Secret Ride",
        description: "If you choose to meet them, you sneak out and find them bleeding and shaking. A car slowly drives past. Are you being followed?",
        choices: [
          {
            id: "take-home",
            text: "Take them to your place and clean them up",
            nextSceneId: "fallout",
            metricChanges: {
              relationships: 10,
              happiness: -5,
              health: -3
            }
          },
          {
            id: "hospital",
            text: "Drive them to the hospital, anonymously",
            nextSceneId: "fallout",
            metricChanges: {
              knowledge: 8,
              relationships: 5,
              happiness: -3
            }
          },
          {
            id: "call-adult",
            text: "Call a trusted adult to intervene",
            nextSceneId: "fallout",
            metricChanges: {
              knowledge: 10,
              relationships: -5,
              happiness: -5
            }
          }
        ]
      },
      {
        id: "fallout",
        title: "The Fallout",
        description: "By morning, news breaks of a hit-and-run. No one died, but the property damage is severe. Your friend is now a suspect.",
        choices: [
          {
            id: "confront-friend",
            text: "Confront your friend — is this what happened?",
            nextSceneId: "pressure-mounts",
            metricChanges: {
              knowledge: 10,
              relationships: -5,
              happiness: -3
            }
          },
          {
            id: "stay-silent",
            text: "Stay silent — they begged you",
            nextSceneId: "pressure-mounts",
            metricChanges: {
              relationships: 5,
              happiness: -8,
              health: -5
            }
          },
          {
            id: "research-legal",
            text: "Research legal options without telling anyone",
            nextSceneId: "pressure-mounts",
            metricChanges: {
              knowledge: 10,
              happiness: -3,
              money: -3
            }
          }
        ]
      },
      {
        id: "pressure-mounts",
        title: "The Pressure Mounts",
        description: "A detective visits your school asking questions. Your teacher looks concerned. You're pulled aside for a \"friendly chat.\"",
        choices: [
          {
            id: "deny-knowing",
            text: "Deny knowing anything",
            nextSceneId: "breaking-point",
            metricChanges: {
              relationships: 5,
              happiness: -10,
              health: -8
            }
          },
          {
            id: "lie-skillfully",
            text: "Lie skillfully to protect your friend",
            nextSceneId: "breaking-point",
            metricChanges: {
              knowledge: 5,
              relationships: 8,
              happiness: -5
            }
          },
          {
            id: "lawyer-up",
            text: "Say you might know something — ask for a lawyer",
            nextSceneId: "breaking-point",
            metricChanges: {
              knowledge: 10,
              money: -5,
              happiness: -3
            }
          }
        ]
      },
      {
        id: "breaking-point",
        title: "The Breaking Point",
        description: "You're overwhelmed. You've missed homework, can't sleep, and your parents are suspicious. Your phone has 12 unread messages from your friend.",
        choices: [
          {
            id: "confront-falling-apart",
            text: "Confront them — you're falling apart",
            nextSceneId: "truth-leaks",
            metricChanges: {
              relationships: -5,
              happiness: 5,
              health: 8
            }
          },
          {
            id: "ghost-them",
            text: "Ghost them — self-preservation first",
            nextSceneId: "truth-leaks",
            metricChanges: {
              relationships: -10,
              happiness: 3,
              health: 5
            }
          },
          {
            id: "open-up",
            text: "Open up to a counselor or teacher",
            nextSceneId: "truth-leaks",
            metricChanges: {
              knowledge: 8,
              relationships: -3,
              happiness: 5
            }
          }
        ]
      },
      {
        id: "truth-leaks",
        title: "The Truth Leaks",
        description: "A bystander posts CCTV footage. People recognize the jacket your friend wore. Rumors explode.",
        choices: [
          {
            id: "tell-confess",
            text: "Tell your friend to confess and protect you",
            nextSceneId: "ending-integrity",
            metricChanges: {
              knowledge: 8,
              relationships: -5,
              happiness: 5
            },
            tooltip: "See how your journey turned out"
          }
        ],
        isEnding: true
      },
      {
        id: "ending-integrity",
        title: "The Path of Integrity",
        description: "Through this difficult situation, you learned about the true meaning of friendship, integrity, and the importance of making hard choices.",
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
    id: "dream-vs-family",
    title: "The Dream vs Family Expectation",
    description: "Navigate the challenging balance between pursuing your own passion and meeting your family's expectations.",
    ageGroup: "16-20",
    category: "Personal Growth",
    thumbnail: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=2000&auto=format&fit=crop",
    initialMetrics: {
      health: 75,
      money: 50,
      happiness: 65,
      knowledge: 70,
      relationships: 80
    },
    scenes: [
      {
        id: "start",
        title: "The Results Are In",
        description: "Your grades are in. They're decent — but not top university material. You want to pursue your creative passion, but your family already has plans for you.",
        choices: [
          {
            id: "break-news",
            text: "Break the news gently — \"I have a different dream\"",
            nextSceneId: "living-room-debate",
            metricChanges: {
              happiness: 5,
              relationships: -5,
              knowledge: 5
            },
            tooltip: "Honesty may be difficult but builds foundation for understanding"
          },
          {
            id: "stay-silent",
            text: "Stay silent for now — don't rock the boat",
            nextSceneId: "living-room-debate",
            metricChanges: {
              happiness: -5,
              relationships: 5,
              health: -3
            },
            tooltip: "Avoiding conflict sometimes creates inner tension"
          },
          {
            id: "fake-interest",
            text: "Fake interest in their dream while researching your own",
            nextSceneId: "living-room-debate",
            metricChanges: {
              happiness: -3,
              knowledge: 8,
              relationships: 0
            },
            tooltip: "Playing along can buy time to make your own plans"
          }
        ]
      },
      {
        id: "living-room-debate",
        title: "The Living Room Debate",
        description: "You finally bring it up. Your dad sighs. Your mom looks heartbroken. \"Do you want to throw your life away for a hobby?\"",
        choices: [
          {
            id: "prove-serious",
            text: "Try to prove how serious you are",
            nextSceneId: "friends-offer",
            metricChanges: {
              knowledge: 5,
              happiness: 3,
              relationships: -3
            }
          },
          {
            id: "explode",
            text: "Explode — \"It's my life!\"",
            nextSceneId: "friends-offer",
            metricChanges: {
              happiness: 5,
              relationships: -10,
              health: -5
            }
          },
          {
            id: "walk-out",
            text: "Say nothing. Walk out.",
            nextSceneId: "friends-offer",
            metricChanges: {
              happiness: -5,
              relationships: -5,
              health: -3
            }
          }
        ]
      },
      {
        id: "friends-offer",
        title: "A Friend's Offer",
        description: "Your best friend offers to help you build a portfolio/plan/app — but it'll take time and secrecy.",
        choices: [
          {
            id: "accept-secret",
            text: "Accept. Build your dream in secret",
            nextSceneId: "comparison-game",
            metricChanges: {
              knowledge: 10,
              happiness: 5,
              relationships: -3
            }
          },
          {
            id: "tell-family",
            text: "Tell your family — maybe they'll respect the effort",
            nextSceneId: "comparison-game",
            metricChanges: {
              knowledge: 5,
              relationships: 3,
              happiness: 3
            }
          },
          {
            id: "decline-risk",
            text: "Decline — you don't want to risk more tension",
            nextSceneId: "comparison-game",
            metricChanges: {
              relationships: 5,
              happiness: -5,
              knowledge: -3
            }
          }
        ]
      },
      {
        id: "comparison-game",
        title: "The Comparison Game",
        description: "Relatives visit. Your cousin just cracked a top entrance exam. You're asked, \"So, what are you doing next?\"",
        choices: [
          {
            id: "tell-truth",
            text: "Tell the truth proudly",
            nextSceneId: "the-mentor",
            metricChanges: {
              happiness: 8,
              relationships: -8,
              knowledge: 5
            }
          },
          {
            id: "lie-avoid",
            text: "Lie to avoid shame",
            nextSceneId: "the-mentor",
            metricChanges: {
              happiness: -5,
              relationships: 5,
              health: -5
            }
          },
          {
            id: "still-deciding",
            text: "Say \"still deciding\" and escape the convo",
            nextSceneId: "the-mentor",
            metricChanges: {
              happiness: 0,
              relationships: 0,
              knowledge: 0
            }
          }
        ]
      },
      {
        id: "the-mentor",
        title: "The Mentor",
        description: "A teacher notices your talent and offers a connection: internship, contest, bootcamp — but it requires skipping family events.",
        choices: [
          {
            id: "go-break",
            text: "Go — this could be your break",
            nextSceneId: "ultimatum",
            metricChanges: {
              knowledge: 10,
              happiness: 8,
              relationships: -8
            }
          },
          {
            id: "ask-permission",
            text: "Ask family permission first",
            nextSceneId: "ultimatum",
            metricChanges: {
              relationships: 5,
              happiness: -3,
              knowledge: 3
            }
          },
          {
            id: "decline-risky",
            text: "Decline — too risky right now",
            nextSceneId: "ultimatum",
            metricChanges: {
              relationships: 8,
              happiness: -8,
              knowledge: -5
            }
          }
        ]
      },
      {
        id: "ultimatum",
        title: "The Ultimatum",
        description: "Your family sets conditions: \"You want to chase this dream? Fine. No financial support. No excuses.\" Your college deadline is approaching.",
        choices: [
          {
            id: "choose-dream",
            text: "Choose your dream — live with uncertainty",
            nextSceneId: "isolation-period",
            metricChanges: {
              happiness: 8,
              money: -10,
              relationships: -8
            }
          },
          {
            id: "take-path",
            text: "Take their path — buy time",
            nextSceneId: "isolation-period",
            metricChanges: {
              money: 5,
              relationships: 8,
              happiness: -10
            }
          },
          {
            id: "compromise",
            text: "Try for a compromise: double major/minor/flexible path",
            nextSceneId: "isolation-period",
            metricChanges: {
              knowledge: 5,
              relationships: 5,
              happiness: 3
            }
          }
        ]
      },
      {
        id: "isolation-period",
        title: "Isolation Period",
        description: "You feel alone. Your friends don't get it. Family barely speaks. Doubts creep in. \"Am I being selfish? What if I fail?\"",
        choices: [
          {
            id: "seek-therapy",
            text: "Seek therapy or guidance",
            nextSceneId: "ending-balanced",
            metricChanges: {
              health: 10,
              knowledge: 8,
              happiness: 5
            },
            tooltip: "See how your journey turned out"
          }
        ],
        isEnding: true
      },
      {
        id: "ending-balanced",
        title: "The Balanced Path",
        description: "You've learned to navigate the challenging balance between your own dreams and your family's expectations. This journey has helped you grow as a person.",
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
  }
];
