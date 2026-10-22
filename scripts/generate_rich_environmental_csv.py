import csv
import re

TXT_PATH = r"C:\Users\doris\Downloads\be_so_calm_it_makes_people_nervous_15min.txt"
CSV_PATH = r"C:\Users\doris\Downloads\be_so_calm_it_makes_people_nervous_15min.csv"

def get_rich_prompt(sn, text):
    t = text.lower()
    
    # 1. Beat 1: Hook & Conference Room (Sentences 1 - 10)
    if sn == 1:
        action = "sitting at the head of a long wooden boardroom table listening attentively"
        env = "inside a crowded corporate glass conference room with modern skyscraper city skyline visible through large windows"
    elif sn == 2:
        action = "observing a colleague seated across the conference table gesturing aggressively"
        env = "inside a bustling corporate glass meeting room under bright fluorescent office lights"
    elif sn == 3:
        action = "looking around calmly as coworkers at the conference table turn their heads in suspense"
        env = "inside a sunlit boardroom with laptop computers, coffee mugs, and notepads on the polished table"
    elif sn == 4:
        action = "placing his hand flat on his chest monitoring his steady internal rhythm with composed focus"
        env = "inside the modern glass conference room with subtle anatomical heart-rate glow graphics floating beside him"
    elif sn == 5:
        action = "resisting the urge to react, keeping his posture grounded and hands resting still on the desk"
        env = "inside the corporate office meeting room with blurred coworkers watching in anticipation"
    elif sn == 6:
        action = "leaning back slightly in his ergonomic office chair with an unshakeable neutral gaze"
        env = "inside the executive conference suite with modern acoustic wall panels"
    elif sn == 7:
        action = "holding quiet eye contact across the conference table without blinking or fidgeting"
        env = "inside the glass-walled boardroom with a sleek presentation screen mounted on the wall"
    elif sn == 8:
        action = "sitting composed as the aggressive colleague shifts uncomfortably in his seat"
        env = "inside the conference room where sunlight streams through tall vertical blinds"
    elif sn == 9:
        action = "observing the subtle psychological power dynamic shift across the conference table"
        env = "inside the meeting room with executive leather chairs and corporate decor"
    elif sn == 10:
        action = "standing beside the conference glass wall looking out with quiet inner authority"
        env = "inside a high-rise executive boardroom with expansive city view outside"

    # 2. Beat 2: Social Power Law & Promise (Sentences 11 - 20)
    elif sn <= 15:
        action = "pointing thoughtfully toward a clear glass marker board illustrating social hierarchy"
        env = "inside a modern psychology research seminar room with warm wooden accents and soft track lighting"
    elif sn <= 20:
        action = "holding an open notebook while explaining emotional self-regulation principles"
        env = "inside an inviting contemporary study with floor-to-ceiling bookshelves and framed certificates"

    # 3. Beat 3: Pain Deepening & Everyday Triggers (Sentences 21 - 40)
    elif "car" in t or "driveway" in t:
        action = "sitting behind the steering wheel in a parked sedan taking a grounding deep breath"
        env = "inside a parked car at twilight with glowing dashboard instruments and warm porch lights shining through the windshield"
    elif "home" in t or "argument" in t or "misunderstanding" in t:
        action = "pausing calmly by the kitchen counter while having a serious conversation"
        env = "inside a warm modern home kitchen with granite countertops, pendant lighting, and wooden cabinets"
    elif "night" in t or "sleep" in t or "replay" in t:
        action = "sitting at the edge of an armchair late at night reflecting with chin in hand"
        env = "inside a dimly lit home study with a warm desk lamp casting a golden pool of light on paperwork"
    elif "email" in t or "message" in t or "phone" in t:
        action = "looking steadily at a glowing smartphone screen without flinching or rushing to type"
        env = "inside a stylish coffee shop with pendant lamps and blurred patrons seated in the background"
    elif sn <= 40:
        action = "walking calmly down an office hallway carrying a clipboard while colleagues rush past"
        env = "inside a bright contemporary office corridor with glass offices and abstract art on the walls"

    # 4. Beat 4: Neuroscience Reversal & Biology (Sentences 41 - 60)
    elif "blood pressure" in t or "heart rate" in t:
        action = "examining an illuminated digital biometric pulse monitor and glowing cardiovascular chart"
        env = "inside a high-tech neuroscience laboratory with digital blue diagnostic screens"
    elif "amygdala" in t or "brain" in t or "neuroscience" in t or "prefrontal" in t:
        action = "pointing at a large glowing 3D holographic model of the human brain highlighting the prefrontal cortex"
        env = "inside a modern university neuroscience amphitheater with chalkboard formulas and anatomical diagrams"
    elif "cortisol" in t or "hormone" in t or "vagus" in t:
        action = "reviewing scientific papers and neural pathway charts on a light table"
        env = "inside a quiet clinical research laboratory with microscopes and scientific reference books"
    elif sn <= 60:
        action = "lecturing at a podium explaining emotional suppression versus neural regulation"
        env = "inside an academic university lecture hall with tiered wooden seating and warm stage illumination"

    # 5. Beat 5: The 6-Level Ladder Map (Sentences 61 - 70)
    elif "level" in t or "ladder" in t or "tier" in t or "framework" in t:
        action = "drawing a clean 6-level ascending psychological hierarchy pyramid on a clear glass board"
        env = "inside a sleek modern design studio with architecture models and warm ambient lighting"
    elif sn <= 70:
        action = "standing beside an illuminated infographic chart mapping psychological leverage"
        env = "inside an executive consulting office with elegant dark wood shelving and clean decor"

    # 6. Beat 6: Levels 1-2 The Trap & Counterfeit Composure (Sentences 71 - 88)
    elif "exhaustion" in t or "moral pride" in t or "trap" in t:
        action = "working late at an office desk surrounded by tall stacks of folders looking composed but weary"
        env = "inside a corporate cubicle under a single desk lamp with city night lights visible through the window"
    elif "smile" in t or "people-pleas" in t or "agree" in t:
        action = "standing politely with hands folded in front while coworkers dump extra files on his desk"
        env = "inside a bustling open-plan corporate office with cubicles and busy staff moving about"
    elif "apolog" in t or "sorry" in t:
        action = "holding his ground calmly without offering unnecessary apologies or bowing his head"
        env = "inside a modern glass boardroom during a tense client negotiation"
    elif sn <= 88:
        action = "analyzing a split-screen infographic comparing fake internal suppression versus real psychological sovereignty"
        env = "inside a modern psychology workshop room with whiteboards and collaborative seating"

    # 7. Beat 7: Levels 3-4 The Turn & Tactical Composure (Sentences 89 - 110)
    elif "six-word" in t or "silence" in t or "hang" in t:
        action = "speaking a concise boundary sentence with calm eye contact and letting the silence linger"
        env = "inside a minimalist executive office across a clean walnut desk from a demanding colleague"
    elif "question" in t or "clarif" in t:
        action = "asking a calm clarifying question while holding an executive pen poised over paper"
        env = "inside a private conference room with frosted glass walls and indirect LED lighting"
    elif "deadline" in t or "monday" in t or "impossible" in t:
        action = "stating firm workplace project boundaries with an unflinching composed posture"
        env = "inside a bright managerial office with a whiteboard calendar and architectural blueprints"
    elif "supervisor" in t or "manager" in t:
        action = "nodding with calm professional firmness as his supervisor pauses in surprise"
        env = "inside the supervisor's glass office doorway with corporate hallway visible behind"
    elif sn <= 110:
        action = "demonstrating calm tactical detachment by stepping back from a heated group discussion"
        env = "inside an open corporate collaboration hub with lounge chairs and whiteboard walls"

    # 8. Beat 8: Levels 5-6 Apex Power & Unshakeable Leverage (Sentences 111 - 130)
    elif "arrogant" in t or "cold" in t or "distant" in t:
        action = "standing calmly composed with hands in pockets while critics whisper in the distance"
        env = "inside a spacious corporate atrium with indoor plants, polished marble floors, and glass elevator"
    elif "leverage" in t or "apex" in t or "power" in t:
        action = "overseeing a high-stakes meeting with serene self-mastery and unshakeable stillness"
        env = "inside a penthouse executive boardroom with panoramic windows overlooking a sprawling metropolis"
    elif "boundary" in t or "defense" in t:
        action = "drawing a firm protective boundary line on a tactical psychology easel"
        env = "inside an executive leadership training room with presentation easel and leather seating"
    elif sn <= 130:
        action = "standing centered and rooted in his physical space as chaos moves around him in motion-blur"
        env = "inside a busy train terminal or urban transit concourse with bustling commuters"

    # 9. Beat 9: 3-Objection Knockdown (Sentences 131 - 145)
    elif "objection" in t or "rude" in t or "pushback" in t:
        action = "holding up three fingers methodically dismantling psychological objections on a whiteboard"
        env = "inside a bright sunlit university seminar room with polished hardwood floors"
    elif "conflict" in t or "fear" in t:
        action = "stepping forward with calm reassuring authority while addressing the audience"
        env = "inside an intimate psychology recording studio with acoustic wall panels and soft amber rim lighting"
    elif sn <= 145:
        action = "gesturing with open palms explaining the natural difference between aggression and quiet firmness"
        env = "inside a contemporary psychology study with built-in bookshelves and a plush reading chair"

    # 10. Beat 10: The One Tool Daily Protocol (Sentences 146 - 158)
    elif "vagus" in t or "exhale" in t or "three seconds" in t or "breath" in t:
        action = "demonstrating the physiological sigh exhale technique with closed eyes and relaxed shoulders"
        env = "inside a peaceful clinical mindfulness room with soft warm lighting and an anatomical vagus nerve diagram overlay"
    elif "daily" in t or "protocol" in t or "morning" in t:
        action = "writing his morning emotional grounding routine in a leather journal at sunrise"
        env = "inside a sunlit home living room with steaming coffee mug on the wooden table and morning light through sheer curtains"
    elif sn <= 158:
        action = "practicing a measured four-second pause before responding during an interaction"
        env = "inside a quiet library study alcove with classic oak tables and vintage green banker lamps"

    # 11. Beat 11: Payoff & Level Confession CTA (Sentences 159 - 169)
    elif "comment" in t or "confess" in t or "tell me" in t:
        action = "gesturing invitingly toward the viewer with an engaging warm professional smile"
        env = "inside the flagship Dr Doris Psych studio with books, camera equipment, and subtle branded channel decor"
    elif "subscribe" in t or "channel" in t:
        action = "standing beside an interactive graphic of the 6 levels of leverage gesturing with open hands"
        env = "inside the Dr Doris Psych educational studio with warm amber spotlight and wooden bookshelf background"
    elif sn == 169:
        action = "delivering the closing psychological principle looking directly at the viewer with serene grounded conviction"
        env = "inside the Dr Doris Psych library studio with rich mahogany bookshelves, framed psychology diplomas, and warm cinematic lighting"
    else:
        action = "standing calmly with composed posture explaining a pivotal behavioral insight"
        env = "inside an elegant psychology consultation suite with comfortable armchairs and framed art on neutral painted walls"

    prompt = (
        f"A cartoon man with glasses in a navy sweater over a white collared shirt {action}, "
        f"{env}, "
        f"2D adult animated sitcom aesthetic, bold thick black outlines, flat solid vibrant colors, detailed atmospheric environment"
    )
    return prompt

def generate_csv():
    with open(TXT_PATH, "r", encoding="utf-8") as f:
        sentences = [line.strip() for line in f if line.strip()]

    rows = []
    for i, s in enumerate(sentences):
        sn = i + 1
        prompt = get_rich_prompt(sn, s)
        rows.append((sn, s, prompt))

    with open(CSV_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["SN", "SCRIPT", "PROMPT"])
        for r in rows:
            writer.writerow(r)

    print(f"Generated {len(rows)} rich environmental prompts in: {CSV_PATH}")

if __name__ == "__main__":
    generate_csv()
