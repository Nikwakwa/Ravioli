export interface TriviaQuestion {
  id: string;
  prompt: string;
  /** Always 3 short choices so they fit cleanly on small phone screens. */
  choices: [string, string, string];
  /** Index into `choices` (0, 1, or 2). */
  answerIndex: 0 | 1 | 2;
  /** Short 1-line fun fact shown right after answering. */
  fact: string;
}

export interface PreparedTriviaQuestion {
  id: string;
  prompt: string;
  choices: [string, string, string];
  answerIndex: 0 | 1 | 2;
  fact: string;
}

export const CAT_TRIVIA_QUESTIONS: readonly TriviaQuestion[] = [
  // ---------------------------------------------------------------------------
  // Cat Body Language & Behavior
  // ---------------------------------------------------------------------------
  {
    id: 'slow_blink',
    prompt: 'What does it mean when a cat gives you a slow blink?',
    choices: ['I love and trust you', 'I want to fight', 'I forgot your name'],
    answerIndex: 0,
    fact: 'A slow blink is a “cat kiss” — blink slowly back to say it too!',
  },
  {
    id: 'kneading',
    prompt: 'Why do cats knead blankets (“making biscuits”)?',
    choices: ['Comfort from kittenhood', 'Sharpening their teeth', 'Testing for crumbs'],
    answerIndex: 0,
    fact: 'Kittens knead to nurse, so adult cats still do it when they feel safe and cozy.',
  },
  {
    id: 'belly_show',
    prompt: 'When a cat rolls onto its back to show its belly, it usually means…',
    choices: ['It feels safe with you', 'It always wants belly rubs', 'It is stuck upside down'],
    answerIndex: 0,
    fact: 'Showing the belly is a sign of trust — though touching it can still be a trap!',
  },
  {
    id: 'head_bunt',
    prompt: 'Why does a cat bonk its forehead gently against you?',
    choices: ['Marking you as family', 'Asking for a hat', 'Checking your height'],
    answerIndex: 0,
    fact: 'Cats have scent glands on their cheeks and forehead to claim their favorite humans.',
  },
  {
    id: 'tail_question_mark',
    prompt: 'A tall tail curved like a question mark means a cat is…',
    choices: ['Happy and friendly', 'About to hiss', 'Fast asleep'],
    answerIndex: 0,
    fact: 'A high, curled-tip tail is the classic cheerful cat greeting.',
  },
  {
    id: 'tail_puffed',
    prompt: 'Why does a startled cat puff its tail up like a bottle brush?',
    choices: ['To look bigger', 'To stay cool', 'To catch treats'],
    answerIndex: 0,
    fact: 'Puffing up fur makes a cat look much larger to scare off threats.',
  },
  {
    id: 'chattering',
    prompt: 'Why do cats chirp or chatter while watching birds through a window?',
    choices: ['Hunting excitement', 'Trying to sing', 'Clearing their throat'],
    answerIndex: 0,
    fact: 'That rapid ek-ek-ek sound is pure hunter excitement when prey is out of reach.',
  },
  {
    id: 'boxes',
    prompt: 'Why are cats so obsessed with sitting in cardboard boxes?',
    choices: ['Safe, cozy walls & warmth', 'They love reading shipping labels', 'Boxes smell like tuna'],
    answerIndex: 0,
    fact: 'Tight spaces help cats feel hidden, warm, and stress-free.',
  },
  {
    id: 'meow_humans',
    prompt: 'Who do adult cats mostly meow at?',
    choices: ['Humans', 'Other adult cats', 'Squirrels'],
    answerIndex: 0,
    fact: 'Adult cats rarely meow at each other — they developed meows mostly to talk to us!',
  },
  {
    id: 'grooming_you',
    prompt: 'If a cat licks your hand or hair, what is it doing?',
    choices: ['Treating you like family', 'Checking if you are salty', 'Polishing your watch'],
    answerIndex: 0,
    fact: 'Social grooming is how bonded cats show affection and share scents.',
  },
  {
    id: 'zoomies',
    prompt: 'What causes sudden late-night “zoomies”?',
    choices: ['Pent-up hunting energy', 'Too many naps in a row', 'Hearing a fridge hum'],
    answerIndex: 0,
    fact: 'Cats are naturally active at dusk and dawn, so extra energy bursts out in sprints!',
  },
  {
    id: 'airplane_ears',
    prompt: 'Flattened sideways “airplane ears” usually signal a cat is…',
    choices: ['Annoyed or nervous', 'Ready for a belly rub', 'Very hungry'],
    answerIndex: 0,
    fact: 'Ears pinned back or sideways protect them and warn that the cat is uneasy.',
  },
  {
    id: 'cover_food',
    prompt: 'Why do some cats scratch the floor beside their food bowl?',
    choices: ['Instinct to hide leftovers', 'Trying to mop the floor', 'Sharpening back claws'],
    answerIndex: 0,
    fact: 'Wild cats bury extra food so predators cannot smell it later.',
  },
  {
    id: 'sleep_on_laptop',
    prompt: 'Why do cats love lying right on warm laptops and keyboards?',
    choices: ['Warmth + your attention', 'They want to send emails', 'They like clicking keys'],
    answerIndex: 0,
    fact: 'A warm machine right where you are looking is prime cat real estate.',
  },
  {
    id: 'high_perches',
    prompt: 'Why do cats love climbing onto shelves and windowsills?',
    choices: ['To watch their territory safely', 'To avoid carpets', 'To stretch their tails'],
    answerIndex: 0,
    fact: 'High spots let cats spot everything around them while staying safe.',
  },
  {
    id: 'sleep_position',
    prompt: 'When a cat curls into a tight ball with its tail over its nose, it is…',
    choices: ['Conserving warmth', 'Hiding from snacks', 'Doing yoga'],
    answerIndex: 0,
    fact: 'The classic “croissant” pose keeps body heat in and vital organs protected.',
  },
  {
    id: 'purr_not_just_happy',
    prompt: 'Besides being happy, why else might a cat purr?',
    choices: ['To soothe itself & heal', 'To scare birds away', 'To charge its whiskers'],
    answerIndex: 0,
    fact: 'Purring vibrations (25–150 Hz) can calm stress and even help bones and muscles heal.',
  },
  {
    id: 'following_bathroom',
    prompt: 'Why do cats follow their humans into the bathroom?',
    choices: ['Curiosity & watching over you', 'They love bathtubs', 'They want the soap'],
    answerIndex: 0,
    fact: 'Closed doors are a mystery to cats, and they like keeping an eye on their favorite human.',
  },

  // ---------------------------------------------------------------------------
  // Cat Biology & Superpowers
  // ---------------------------------------------------------------------------
  {
    id: 'sweet_taste',
    prompt: 'Which flavor can cats NOT taste?',
    choices: ['Sweet', 'Salty', 'Savory'],
    answerIndex: 0,
    fact: 'Cats lack the taste receptor for sweetness — meaty flavors are what excite them!',
  },
  {
    id: 'sleep_hours',
    prompt: 'About how many hours a day does an average adult cat sleep?',
    choices: ['12 to 16 hours', '4 to 6 hours', '22 hours'],
    answerIndex: 0,
    fact: 'Cats spend roughly two-thirds of their lives napping and snoozing.',
  },
  {
    id: 'nose_print',
    prompt: 'What part of a cat is as unique as a human fingerprint?',
    choices: ['Its nose print', 'Its tail tip', 'Its tongue'],
    answerIndex: 0,
    fact: 'Every cat has a one-of-a-kind pattern of ridges and bumps on its nose.',
  },
  {
    id: 'whiskers_purpose',
    prompt: 'What is a cat’s whiskers’ main superpower?',
    choices: ['Measuring gaps & air movement', 'Smelling treats from afar', 'Helping them swim'],
    answerIndex: 0,
    fact: 'Whiskers are roughly as wide as a cat’s body so it can judge tight spaces in the dark.',
  },
  {
    id: 'whiskers_paws',
    prompt: 'Besides their face, where else do cats have whiskers?',
    choices: ['Backs of their front legs', 'Tip of their tail', 'Inside their ears'],
    answerIndex: 0,
    fact: 'Carpal whiskers on their front wrists help cats feel movement right under their paws.',
  },
  {
    id: 'toe_count',
    prompt: 'How many toes does a typical cat have in total?',
    choices: ['18 (5 front, 4 back)', '16 (4 on every paw)', '20 (5 on every paw)'],
    answerIndex: 0,
    fact: 'Most cats have 5 toes on each front paw and 4 on each back paw — 18 adorable beans!',
  },
  {
    id: 'jump_height',
    prompt: 'How high can a healthy cat jump in a single leap?',
    choices: ['Up to 5–6× its length', 'About 2× its length', '15× its length'],
    answerIndex: 0,
    fact: 'Powerful back legs let cats effortlessly leap 5 to 6 times their own body length.',
  },
  {
    id: 'night_vision',
    prompt: 'How much less light do cats need to see compared to humans?',
    choices: ['About 6× less light', 'Pitch black with zero light', 'About the same as humans'],
    answerIndex: 0,
    fact: 'Cats need only about one-sixth the light we do, though they cannot see in total darkness.',
  },
  {
    id: 'ear_muscles',
    prompt: 'About how many muscles control each of a cat’s ears?',
    choices: ['Around 32 muscles', 'Just 4 muscles', 'About 10 muscles'],
    answerIndex: 0,
    fact: 'With 32 muscles per ear, cats can swivel their ears 180° independently like radar dishes!',
  },
  {
    id: 'ear_rotation',
    prompt: 'How far can a cat rotate its ears to pinpoint a sound?',
    choices: ['Up to 180 degrees', 'Only 45 degrees', 'A full 360 degrees'],
    answerIndex: 0,
    fact: 'Cats can swivel their ears half a circle without even moving their head.',
  },
  {
    id: 'sandpaper_tongue',
    prompt: 'Why does a cat’s tongue feel like tiny sandpaper?',
    choices: ['Backward-facing little hooks', 'Dry skin', 'Crumbs from kibble'],
    answerIndex: 0,
    fact: 'Tiny hollow spines called papillae act like a built-in hairbrush and help keep fur cool.',
  },
  {
    id: 'collarbone',
    prompt: 'Why can cats squeeze through surprisingly narrow gaps?',
    choices: ['Free-floating collarbones', 'No ribs at all', 'Rubber elbows'],
    answerIndex: 0,
    fact: 'A cat’s collarbone is not rigidly attached to other bones, letting its shoulders fold inward.',
  },
  {
    id: 'sweat_glands',
    prompt: 'Where do cats mostly sweat to cool down?',
    choices: ['Through their paw pads', 'Across their forehead', 'On their back'],
    answerIndex: 0,
    fact: 'Cats only have sweat glands in small areas like their paw pads — that is why nervous paws get damp!',
  },
  {
    id: 'walk_style',
    prompt: 'How do cats walk silently like ninjas?',
    choices: ['Back paws step in front paw prints', 'They hold their breath', 'They hover slightly'],
    answerIndex: 0,
    fact: 'Called “direct registering,” placing hind paws into front footprints reduces noise and tracks.',
  },
  {
    id: 'orange_cats_gender',
    prompt: 'About what share of orange tabby cats are male?',
    choices: ['Around 80%', 'Around 20%', 'Exactly 50%'],
    answerIndex: 0,
    fact: 'The orange fur gene sits on the X chromosome, so roughly 4 out of 5 ginger cats are boys!',
  },
  {
    id: 'catnip_response',
    prompt: 'Do ALL cats react to catnip?',
    choices: ['No, about 2 in 3 do', 'Yes, 100% of cats do', 'Only orange cats do'],
    answerIndex: 0,
    fact: 'Catnip sensitivity is inherited — and young kittens usually do not react until 3–6 months old.',
  },
  {
    id: 'kitten_eyes',
    prompt: 'What color are almost all newborn kittens’ eyes when they first open?',
    choices: ['Blue', 'Bright green', 'Deep amber'],
    answerIndex: 0,
    fact: 'Kittens are born with blue eyes that gradually shift to their adult color around 6–8 weeks old.',
  },
  {
    id: 'group_of_cats',
    prompt: 'What is a group of cats famously called?',
    choices: ['A clowder', 'A purrpack', 'A whisker'],
    answerIndex: 0,
    fact: 'A group of cats is called a clowder (and a litter of kittens is sometimes called a kindle)!',
  },

  // ---------------------------------------------------------------------------
  // Cat Care & Kitchen Safety
  // ---------------------------------------------------------------------------
  {
    id: 'fountain_water',
    prompt: 'Why do many cats prefer drinking from a water fountain?',
    choices: ['Running water feels fresher', 'They like the bubbles’ noise', 'Bowls are too shiny'],
    answerIndex: 0,
    fact: 'In the wild, flowing water is safer than stagnant puddles — so fountains boost hydration!',
  },
  {
    id: 'cows_milk',
    prompt: 'Is regular cow’s milk a good treat for adult cats?',
    choices: ['No, most are lactose intolerant', 'Yes, every morning', 'Only if it is ice cold'],
    answerIndex: 0,
    fact: 'Most adult cats cannot digest cow’s milk well — fresh water or special cat milk is much safer!',
  },
  {
    id: 'unsafe_food_onion',
    prompt: 'Which human food is dangerous for cats?',
    choices: ['Onions and garlic', 'Plain cooked chicken', 'Plain pumpkin'],
    answerIndex: 0,
    fact: 'Onions, garlic, grapes, and chocolate are toxic to cats and should always stay off their plate.',
  },
  {
    id: 'unsafe_flowers',
    prompt: 'Which common bouquet flower is very toxic to cats?',
    choices: ['Lilies', 'Roses', 'Sunflowers'],
    answerIndex: 0,
    fact: 'Even tiny amounts of lily pollen or petals can be dangerous for cats — always keep lilies away!',
  },
  {
    id: 'whisker_fatigue',
    prompt: 'Why do some cats prefer wide, shallow food bowls?',
    choices: ['So their whiskers don’t bend', 'So they can splash food', 'To see their reflection'],
    answerIndex: 0,
    fact: 'Sensitive whiskers brushing deep narrow bowls can feel uncomfortable — known as whisker fatigue.',
  },
  {
    id: 'scratching_post',
    prompt: 'Why is scratching a post so important for indoor cats?',
    choices: ['Sheds claw husks & stretches', 'Just to be naughty', 'To sharpen their teeth'],
    answerIndex: 0,
    fact: 'Scratching keeps claws healthy, stretches back muscles, and leaves reassuring scent marks.',
  },
  {
    id: 'brushing_benefit',
    prompt: 'How does regular brushing help a cat most?',
    choices: ['Less shedding & fewer hairballs', 'Makes them taller', 'Changes their stripe pattern'],
    answerIndex: 0,
    fact: 'Brushing removes loose fur before a cat swallows it while grooming — plus it feels great!',
  },
  {
    id: 'play_then_eat',
    prompt: 'What daily routine matches a cat’s natural instinct best?',
    choices: ['Play → Eat → Groom → Nap', 'Nap → Nap → Sprint', 'Eat → Immediately sprint'],
    answerIndex: 0,
    fact: 'Hunt, catch, eat, groom, sleep is the natural feline rhythm that keeps indoor cats happy.',
  },
  {
    id: 'litter_clean',
    prompt: 'Why should a cat’s litter box be scooped regularly?',
    choices: ['Cats are very clean & picky', 'It makes the litter glow', 'Cats count the scoops'],
    answerIndex: 0,
    fact: 'Cats have super-sensitive noses and love a fresh, spotless bathroom.',
  },
  {
    id: 'crepuscular',
    prompt: 'When are cats naturally most active and playful?',
    choices: ['Dawn and dusk', 'High noon', 'Only during thunderstorms'],
    answerIndex: 0,
    fact: 'Cats are crepuscular — wired for peak energy right around sunrise and sunset.',
  },
  {
    id: 'laser_ending',
    prompt: 'What is a good way to end a laser pointer play session?',
    choices: ['Let them catch a real toy or treat', 'Turn off all the lights', 'Hide the laser under a rug'],
    answerIndex: 0,
    fact: 'Finishing with a tangible toy or snack satisfies their hunting instinct so they don’t feel frustrated.',
  },
  {
    id: 'trim_whiskers',
    prompt: 'Should you ever trim a cat’s whiskers?',
    choices: ['Never — they need them to navigate', 'Yes, once a month', 'Only in summer'],
    answerIndex: 0,
    fact: 'Whiskers are packed with nerve endings and help cats sense obstacles and balance.',
  },

  // ---------------------------------------------------------------------------
  // Oli & Cozy Cat Life
  // ---------------------------------------------------------------------------
  {
    id: 'oli_treat',
    prompt: 'Which lickable treat makes Oli go completely starry-eyed?',
    choices: ['Churu Tube', 'Pickled radish', 'Sparkling water'],
    answerIndex: 0,
    fact: 'Nothing beats a creamy Churu tube after a great play session!',
  },
  {
    id: 'oli_coat',
    prompt: 'What kind of coat does Oli have?',
    choices: ['Fluffy ginger tabby', 'Jet-black panther', 'Spotted Dalmatian'],
    answerIndex: 0,
    fact: 'Oli is a proud, warm ginger tabby with a cute white tail tip!',
  },
  {
    id: 'oli_favorite_box',
    prompt: 'What is Oli’s motto whenever a cardboard delivery arrives?',
    choices: ['If it fits, I sits!', 'Return to sender!', 'No boxes allowed'],
    answerIndex: 0,
    fact: 'Even with a plush sofa bed right nearby, a cardboard box is always irresistible.',
  },
  {
    id: 'oli_rain_tv',
    prompt: 'Where does Oli love watching raindrops slide down the glass?',
    choices: ['By the window or balcony', 'Under the sink', 'Inside the closet'],
    answerIndex: 0,
    fact: 'Rainy days are prime Cat TV from the cozy windowsill!',
  },
  {
    id: 'oli_tummy',
    prompt: 'What happens if Oli eats too many treats in a row?',
    choices: ['He gets a tummy ache', 'He learns to fly', 'He grows extra ears'],
    answerIndex: 0,
    fact: 'Moderation keeps whiskers happy — brushing or calming mist helps soothe a sore tummy!',
  },
  {
    id: 'oli_forever',
    prompt: 'Once Oli grows into Adult Oli, what happens next?',
    choices: ['He stays Adult Oli forever!', 'He moves to Mars', 'He turns into a puppy'],
    answerIndex: 0,
    fact: 'Adult Oli stays healthy and young forever — he never grows old!',
  },
];

const LS_TRIVIA_SEEN = 'ravioli:v1:trivia_seen';

export function loadSeenTriviaIds(): string[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const raw = window.localStorage.getItem(LS_TRIVIA_SEEN);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === 'string');
  } catch {
    return [];
  }
}

export function saveSeenTriviaIds(ids: string[]): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(LS_TRIVIA_SEEN, JSON.stringify(ids));
  } catch {
    // ignore storage errors
  }
}

function shuffleWithRng<T>(items: readonly T[], rng: () => number): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Shuffles a question's 3 choices so players cannot memorize slot positions.
 */
export function prepareTriviaQuestion(
  q: TriviaQuestion,
  rng: () => number = Math.random,
): PreparedTriviaQuestion {
  const indexed = q.choices.map((text, idx) => ({ text, isAnswer: idx === q.answerIndex }));
  const shuffled = shuffleWithRng(indexed, rng);
  const answerIndex = shuffled.findIndex((item) => item.isAnswer) as 0 | 1 | 2;
  return {
    id: q.id,
    prompt: q.prompt,
    choices: [shuffled[0].text, shuffled[1].text, shuffled[2].text],
    answerIndex,
    fact: q.fact,
  };
}

/**
 * Picks `count` fresh trivia questions, avoiding recently seen IDs until the deck is exhausted.
 */
export function pickTriviaQuestions(
  count: number,
  seenIds: readonly string[] = [],
  rng: () => number = Math.random,
): { questions: PreparedTriviaQuestion[]; nextSeenIds: string[] } {
  const seenSet = new Set(seenIds);
  const unseen = CAT_TRIVIA_QUESTIONS.filter((q) => !seenSet.has(q.id));

  let chosen: TriviaQuestion[];
  let resetDeck = false;

  if (unseen.length >= count) {
    chosen = shuffleWithRng(unseen, rng).slice(0, count);
  } else {
    // Use remaining unseen first, then start a fresh cycle from the rest without duplicating this batch
    const firstPart = shuffleWithRng(unseen, rng);
    const chosenIds = new Set(firstPart.map((q) => q.id));
    const refillPool = CAT_TRIVIA_QUESTIONS.filter((q) => !chosenIds.has(q.id));
    const needed = Math.max(0, count - firstPart.length);
    chosen = [...firstPart, ...shuffleWithRng(refillPool, rng).slice(0, needed)];
    resetDeck = true;
  }

  const nextSeenIds = resetDeck
    ? chosen.map((q) => q.id)
    : [...seenIds, ...chosen.map((q) => q.id)];

  return {
    questions: chosen.map((q) => prepareTriviaQuestion(q, rng)),
    nextSeenIds,
  };
}
