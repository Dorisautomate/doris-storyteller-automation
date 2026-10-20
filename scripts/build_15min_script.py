import os
import csv

OUTPUT_CSV = r"C:\Users\doris\Downloads\be_so_calm_it_makes_people_nervous_15min.csv"
OUTPUT_TXT = r"C:\Users\doris\Downloads\be_so_calm_it_makes_people_nervous_15min.txt"

# 11 Beats following PSY-Ladder Outlier System v1.0 (Target: 2,500-2,850 words)
BEATS = [
    # Beat 1: Hook (Pain Mirror + Curiosity Gap) [0:00 - 0:45]
    [
        "It is Thursday afternoon at 2:15 p.m. in a crowded glass conference room.",
        "A colleague makes a passive-aggressive comment disguised as a harmless friendly joke.",
        "Everyone around the long table looks at you, waiting for your immediate reaction.",
        "Your chest instantly tightens, your heart rate spikes, and your throat goes dry.",
        "Your immediate survival impulse is to laugh along, make an excuse, or over-explain yourself.",
        "Most people call this reflex politeness, good manners, or wanting to keep the peace.",
        "In neuroscience, this sudden panic is recognized as an ancient biological threat response.",
        "Your brain's amygdala treats social disapproval with the exact same terror as physical abandonment.",
        "To your ancient wiring, maintaining harmony feels like the only way to stay alive.",
        "There is an unwritten law of social power that almost nobody will admit out loud.",
        "The quietest, most unshakeable person in the room controls the emotional climate of everyone else."
    ],

    # Beat 2: Stay Line + Promise + Early Comment Question [0:45 - 1:15]
    [
        "In this video, I will walk you through the six psychological levels of emotional command.",
        "You will see why your current coping mechanisms are quietly sabotaging your status.",
        "You will discover the landmark brain research that proves you have been handling tension backwards.",
        "And by the end, you will install the single three-step protocol that creates true Level 5 leverage.",
        "Before we look at the first level, answer this honestly in the comments below.",
        "When someone disrespects you, do you usually get angry, freeze up, or laugh it off?"
    ],

    # Beat 3: Pain Deepening (Identity Loop) [1:15 - 2:30]
    [
        "Maybe it did not happen in a boardroom at all.",
        "Maybe it happened last night in your kitchen at 9:30 p.m. with your shoes still on.",
        "You were standing by the counter, staring blankly at a message on your phone.",
        "A family member or friend demanded an urgent favor you did not have the energy or time to grant.",
        "You spent forty-five exhausting minutes drafting a long, apologetic paragraph.",
        "You gave three different reasons why you were unavailable and apologized five separate times.",
        "When you finally pressed send, you did not feel relief; you felt dirty and depleted.",
        "You sacrificed your evening just to avoid ten seconds of another person's momentary disappointment.",
        "Or maybe it happened at home when a simple misunderstanding escalated into an argument.",
        "You felt your jaw clench, your voice rise, and your arguments become defensive and frantic.",
        "Ten minutes later, you were apologizing for how you reacted instead of standing your ground.",
        "You lie awake at night staring at the ceiling, wondering why you cannot hold your composure.",
        "You ask yourself why other people seem untouchable while your nervous system constantly betrays you.",
        "You wonder if your wiring is fundamentally broken or if you were just born too sensitive."
    ],

    # Beat 4: Science Reversal (Study Authority Spike + Biology) [2:30 - 4:30]
    [
        "Here is the brutal truth that clinical psychology reveals about your panic.",
        "We got the entire concept of emotional composure completely backwards.",
        "You were taught that strong people feel nothing and weak people feel too much.",
        "That belief is biologically wrong and creates endless chronic anxiety.",
        "In 2016, neuroscientist Dr. Steven Maier at the University of Colorado published a breakthrough study.",
        "His laboratory examined how mammalian brains handle acute psychological stressors.",
        "When an individual feels trapped with zero control, a deep brainstem structure fires violently.",
        "That structure is the dorsal raphe nucleus, which floods the entire body with helpless panic.",
        "When the dorsal raphe nucleus fires unchecked, learned helplessness takes over the entire nervous system.",
        "Maier discovered that activating the ventromedial prefrontal cortex immediately shuts off that panic signal.",
        "The prefrontal cortex does not suppress the fear; it asserts agency over the environment.",
        "In other words, calmness is not the absence of emotion, but the presence of perceived leverage.",
        "In 2002, Dr. James Gross at Stanford University evaluated emotional regulation strategies across hundreds of subjects.",
        "Gross proved that emotional suppression causes dramatic spikes in cardiovascular tension and cognitive fatigue.",
        "When you swallow your anger or force a fake smile, your blood pressure sky-rockets.",
        "The people looking at you unconsciously register your micro-expressions and perceive your weakness.",
        "In 2011, Dr. Stephen Porges introduced the Polyvagal Theory, proving that the vagus nerve regulates social engagement.",
        "When your body lacks vagal tone, every minor social boundary feels like a life-or-death crisis.",
        "True composure does not come from biting your tongue or bottling your feelings.",
        "You are not biologically broken; your nervous system was simply never trained in real composure reps."
    ],

    # Beat 5: The Ladder Map (6 Levels Tease) [4:30 - 5:15]
    [
        "There are six distinct levels where psychological leverage develops in human behavior.",
        "Most people spend their entire adult lives trapped between Level 1 and Level 2.",
        "At Level 2, you suffer silently while calling your submissiveness a moral virtue.",
        "Level 3 is where biological reappraisal begins to calm your physical nervous system.",
        "Level 4 is where the people around you realize your boundaries have permanently hardened.",
        "Level 5 gives you asymmetric leverage in high-stakes negotiations and personal conflicts.",
        "And Level 6 is the state of quiet command that actually makes other people nervous.",
        "Make sure you stay through Level 6, because that level comes with a serious personal price."
    ],

    # Beat 6: Levels 1-2: The Trap (Counterfeit & The Cost) [5:15 - 7:30]
    [
        "To understand the ladder, consider an architect named Daniel, thirty-four years old.",
        "Daniel is known by his colleagues, friends, and family as the most dependable man alive.",
        "He never complains, never says no, and always takes on the extra workload without protest.",
        "Daniel is operating at Level 1: Porous Suppression.",
        "At Level 1, you treat your personal boundaries like suggestion boxes that anyone can ignore.",
        "You feel resentment building behind your ribs, but you bury it beneath polite smiles.",
        "You believe that by being harmless, the world will treat you gently and respect your sacrifice.",
        "Psychologist Dr. Robert Glover calls this the covert contract trap.",
        "You subconsciously tell yourself that if you are nice to everyone, nobody will ever hurt you.",
        "The world does not reward harmlessness; it ruthlessly exploits it.",
        "Soon Daniel transitions into Level 2: The Counterfeit Virtue Trap.",
        "At Level 2, you begin taking moral pride in your own mistreatment and emotional exhaustion.",
        "You tell yourself that you are more empathetic, more patient, and more forgiving than others.",
        "In reality, your patience is not patience at all; it is unadulterated fear disguised as virtue.",
        "You do not speak up because you are terrified of confrontation, rejection, and awkwardness.",
        "Every time you smile while swallowing an insult, you run a training rep in self-betrayal.",
        "Your nervous system records that you are not safe in your own body because you refuse to protect yourself.",
        "In 2007, researchers Sonnentag and Fritz at Mannheim University studied chronic workplace boundary collapse.",
        "They found that chronic people-pleasing leads to severe psychological detachment and clinical burnout.",
        "The hidden cost of Level 2 is quiet despair, physical chronic fatigue, and sudden explosive outbursts.",
        "You snap at the grocery cashier or your children over trivial mistakes because your emotional container is overflowing.",
        "Daniel thought he was being a saint, but he was slowly destroying his self-respect from the inside out."
    ],

    # Beat 7: Levels 3-4: The Turn & Counterfeit vs Real [7:30 - 10:30]
    [
        "Breaking out of Level 2 requires stepping onto Level 3: Biological Reappraisal.",
        "At Level 3, you stop viewing physical anxiety as a command to apologize or run away.",
        "When someone attacks or challenges you, your heart will still accelerate and your adrenaline will surge.",
        "Instead of asking what is wrong with you, you recognize that your ancient nervous system is mobilizing energy.",
        "Psychologist Dr. George Bonanno at Columbia University studied emotional resilience across severe trauma survivors.",
        "Bonanno found that resilient individuals possess high regulatory flexibility, adapting their interpretations in real time.",
        "At Level 3, you practice cognitive affect labeling by mentally naming your sensation as mere biological arousal.",
        "You do not rush to speak; you allow the neurochemical surge sixty seconds to run its course.",
        "From Level 3, you graduate into Level 4: Controlled Silence.",
        "Level 4 is the exact threshold where social power permanently flips in your favor.",
        "Let us contrast counterfeit composure against real composure so you can see the difference.",
        "Counterfeit composure looks like clenched teeth, stiff posture, and forced laughter that fools nobody.",
        "Real composure looks like relaxed facial muscles, steady unblinking eye contact, and absolute stillness.",
        "Counterfeit composure rushes to defend itself with paragraphs, citations, and emotional appeals.",
        "Real composure delivers a six-word sentence and lets the resulting silence hang in the room.",
        "When Daniel reached Level 4, his supervisor made an unreasonable demand at 5:00 p.m. on a Friday.",
        "In the past, Daniel would have apologized profusely before reluctantly agreeing to cancel his weekend plans.",
        "This time, Daniel held calm eye contact, paused for three full seconds, and spoke eleven simple words.",
        "He said: That deadline is impossible with current staffing, so I will address it Monday morning.",
        "He did not apologize, he did not explain his weekend plans, and he did not look away.",
        "His supervisor shifted uncomfortably, blinked twice, nodded, and quietly walked out of the office.",
        "When you refuse to fill the silence with nervous chatter, the psychological burden instantly shifts to the other person.",
        "They are forced to sit in the awkwardness they created, while your stillness signals absolute authority.",
        "Psychologist Dr. Albert Mehrabian proved that in high-stakes social interactions, non-verbal presence conveys the majority of credibility.",
        "When your body language shows zero panic, people instinctively calibrate their respect to your stillness."
    ],

    # Beat 8: Levels 5-6: Apex & The Price [10:30 - 12:00]
    [
        "Above controlled silence sits Level 5: Asymmetric Leverage.",
        "At Level 5, you no longer merely defend your boundaries; you set the emotional temperature of the room.",
        "When other people lose their composure and start yelling, your voice drops half an octave and slows down.",
        "Because human mirror neurons subconsciously synchronize with whoever has the most regulated nervous system, they mirror you.",
        "You become the emotional anchor that everyone else's physiology unconsciously aligns with.",
        "You possess the rare ability to walk away from any deal, relationship, or conversation without hesitation.",
        "In negotiations, the person who needs the outcome the least holds all the real power.",
        "And then there is Level 6: Untouchable Command.",
        "Level 6 is the apex of composure, and it is the level that genuine manipulators fear the most.",
        "At Level 6, you are immune to guilt trips, passive aggression, manufactured urgency, and public shame.",
        "You view hostile attacks with the detached curiosity of a scientist observing an interesting specimen.",
        "Here is the brutal part that nobody tells you about reaching Level 6.",
        "Level 6 comes with an unavoidable personal price tag.",
        "When you become impossible to intimidate or guilt-trip, the people who profited from your weakness will get furious.",
        "They will call you cold, unfeeling, distant, stubborn, and arrogant.",
        "They will accuse you of changing because you are no longer willing to set yourself on fire to keep them warm.",
        "You must be willing to lose their shallow approval if you want to keep your self-respect.",
        "Unshakeable power always extracts a social toll from those who prefer your submissiveness.",
        "Those who truly respect you will stay, and those who only wanted your compliance will vanish."
    ],

    # Beat 9: 3-Objection Knockdown [12:00 - 13:30]
    [
        "I hear three distinct objections forming in your mind right now as you listen to this.",
        "Objection number one: This sounds great in theory, but my anxiety is biological and deeply genetic.",
        "Here is why that objection keeps you trapped at Level 2.",
        "Genetic sensitivity gives you raw emotional reactivity, but reactivity is merely unprocessed neurochemical fuel.",
        "Your biology determines your initial impulse, but your training determines your physical reaction.",
        "Objection number two: If I stop explaining myself, won't people think I am rude or unprofessional?",
        "Notice the counterfeit trap hidden inside that question.",
        "You are confusing being clear and direct with being cruel and combative.",
        "Politeness is delivering the truth with respect; people-pleasing is lying to protect yourself from discomfort.",
        "Clear boundaries are the kindest, most respectful gift you can ever give to another human being.",
        "Objection number three: Isn't staying quiet and detached just another form of manipulation or sociopathy?",
        "Manipulators use silence as a weapon to punish, control, and confuse others.",
        "A grounded individual uses silence as a shield to protect their own nervous system from unnecessary chaos.",
        "You are not seeking to control the other person; you are simply refusing to let them control your internal state."
    ],

    # Beat 10: Install: The One Tool [13:30 - 15:00]
    [
        "Now that you understand the ladder, here is the exact protocol to install Level 4 composure starting today.",
        "You do not need to memorize twenty psychological scripts or read another self-help book.",
        "You only need to master one simple three-step ritual called The Three-Second Anchor.",
        "Step one is the physiological breath lock.",
        "The moment you feel challenged, insulted, or pressured, do not open your mouth.",
        "Inhale through your nose and take a long, slow, audibly silent exhale through your mouth.",
        "That extended exhale activates the vagus nerve and slows your heart rate within three seconds.",
        "Step two is the eye contact hold.",
        "Lock your vision onto one of their eyes and relax your forehead, eyebrows, and jaw.",
        "Do not narrow your eyes in hostility, and do not blink rapidly in nervous submission.",
        "Simply observe their face as if you were looking at a painting in an art gallery.",
        "Step three is the unpadded boundary sentence.",
        "Deliver your response in one clean, complete grammatical sentence with zero cushioning.",
        "Do not begin with 'I think', 'I am sorry', 'Unfortunately', or 'I hate to say this, but'.",
        "If they ask for something you cannot do, simply say: I am not available to take that on.",
        "Then close your mouth completely and let the silence do the work for you.",
        "The first time you execute this three-step rep, your stomach will do flips.",
        "By the fifth time you execute it, you will feel a sense of power you have never known."
    ],

    # Beat 11: Payoff & Confession CTA [15:00 - 16:00]
    [
        "True strength is never loud, aggressive, defensive, or chaotic.",
        "True strength is the calm, unshakeable certainty of a person who knows who they are.",
        "When you stop over-explaining your right to exist, the world stops challenging your authority.",
        "You stop begging for respect, and you simply command it through your presence.",
        "Remember the price of Level 6: some people will walk away when you become immune to their control.",
        "Let them walk; the peace you gain in their absence is worth ten times their hollow approval.",
        "Now I want to hear from you directly in the comments.",
        "Which level called you out the most today: Level 2, Level 4, or Level 6?",
        "Type your level in the comments below, because I personally read and respond to every thoughtful confession.",
        "If this breakdown gave you permission to stop over-explaining yourself, subscribe to Dr. Doris Psych.",
        "Share this video with someone you care about who is stuck in the people-pleasing trap.",
        "And remember: an explanation is a courtesy you choose to offer, never an obligation you owe."
    ]
]

PROMPT_TEMPLATE = (
    "A cartoon man with glasses in a navy sweater over a white collared shirt {action}, "
    "2D adult animated sitcom aesthetic, bold thick black outlines, flat solid colors, plain solid white background"
)

def generate_script_assets():
    all_sentences = []
    for beat in BEATS:
        for s in beat:
            all_sentences.append(s.strip())

    total_scenes = len(all_sentences)
    total_words = sum(len(s.split()) for s in all_sentences)
    print(f"[Script Generator] Total Sentences / Scenes: {total_scenes}")
    print(f"[Script Generator] Total Word Count: {total_words} words")
    print(f"[Script Generator] Estimated Duration at 170 wpm: {total_words / 170:.2f} minutes")

    rows = []
    for i, sentence in enumerate(all_sentences):
        sn = i + 1
        prompt = PROMPT_TEMPLATE.format(action=f"demonstrating scene {sn} with calm grounded psychological posture and expressive body language")
        rows.append((sn, sentence, prompt))

    with open(OUTPUT_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["SN", "SCRIPT", "PROMPT"])
        for r in rows:
            writer.writerow(r)
    print(f"[Disk] Saved CSV: {OUTPUT_CSV} ({total_scenes} rows)")

    with open(OUTPUT_TXT, "w", encoding="utf-8") as f:
        for r in rows:
            f.write(r[1] + "\n")
    print(f"[Disk] Saved TXT: {OUTPUT_TXT} ({total_scenes} lines)")

if __name__ == "__main__":
    generate_script_assets()
