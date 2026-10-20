import csv
import os

csv_path = r"C:\Users\doris\Downloads\why_your_brain_panics_saying_no_true_1min.csv"
txt_path = r"C:\Users\doris\Downloads\why_your_brain_panics_saying_no_true_1min.txt"

sentences = [
    "Every time you prepare to say no to someone, a sudden knot of anxiety tightens in your chest.",
    "Your heart rate accelerates, your palms get warm, and you immediately feel the urge to over-explain yourself.",
    "Most people assume this happens because they are polite, but neuroscience reveals a primal biological survival reflex.",
    "Your brain's amygdala processes social rejection with the exact same neurological alarm as physical abandonment.",
    "To your ancient nervous system, setting a boundary feels like getting cast out of the tribe into the freezing cold.",
    "So you scramble to give long excuses, apologize repeatedly, and sacrifice your peace just to ease their momentary tension.",
    "In clinical psychology, that submissive urge to over-explain is called the counterfeit virtue trap.",
    "You think you are being harmless and accommodating, but you are actually training people to ignore your boundaries.",
    "High-status composure does not come from loud aggression, but from unshakeable, quiet neutrality.",
    "The next time you need to decline an invite or extra work, apply the three-second pause before you speak.",
    "Take one slow breath, hold eye contact, and deliver a calm, complete sentence without a single excuse.",
    "Notice how their tension hangs in the air, and notice how your nervous system instantly recalibrates.",
    "Without your nervous laughter or frantic rambling to cushion their request, the burden of proof shifts back to them.",
    "True self-respect begins the moment you realize that an explanation is a courtesy, never an obligation.",
    "If this gave you permission to stop over-explaining yourself, subscribe to Dr Doris Psych and step into Level 4 today."
]

prompts = [
    "A cartoon man with glasses in a navy sweater over a white collared shirt looking at his vibrating smartphone with mild hesitation, 2D adult animated sitcom aesthetic, bold thick black outlines, flat solid colors, plain solid white background",
    "A cartoon man with glasses in a navy sweater gesturing calmly while an illuminated biometric heart rate icon pulses beside him, 2D adult animated sitcom aesthetic, bold thick black outlines, flat solid colors, plain solid white background",
    "A cartoon man with glasses in a navy sweater pointing at a clean medical whiteboard displaying a stylized colorful brain diagram, 2D adult animated sitcom aesthetic, bold thick black outlines, flat solid colors, plain solid white background",
    "A cartoon man with glasses in a navy sweater examining a glowing amygdala neural pathway on a holographic tablet, 2D adult animated sitcom aesthetic, bold thick black outlines, flat solid colors, plain solid white background",
    "A cartoon man with glasses in a navy sweater standing tall next to a graphic illustration comparing modern office desks and ancient campfires, 2D adult animated sitcom aesthetic, bold thick black outlines, flat solid colors, plain solid white background",
    "A cartoon man with glasses in a navy sweater observing a tangled speech bubble symbolizing over-explanation, 2D adult animated sitcom aesthetic, bold thick black outlines, flat solid colors, plain solid white background",
    "A cartoon man with glasses in a navy sweater pointing to an infographic contrasting fake virtue with authentic boundaries, 2D adult animated sitcom aesthetic, bold thick black outlines, flat solid colors, plain solid white background",
    "A cartoon man with glasses in a navy sweater reviewing a behavioral chart illustrating interpersonal power dynamics, 2D adult animated sitcom aesthetic, bold thick black outlines, flat solid colors, plain solid white background",
    "A cartoon man with glasses in a navy sweater standing composed with hands folded in front of an equilibrium balance scale, 2D adult animated sitcom aesthetic, bold thick black outlines, flat solid colors, plain solid white background",
    "A cartoon man with glasses in a navy sweater demonstrating a 3-second countdown digital timer with a serene expression, 2D adult animated sitcom aesthetic, bold thick black outlines, flat solid colors, plain solid white background",
    "A cartoon man with glasses in a navy sweater holding steady eye contact with a calm and confident expression, 2D adult animated sitcom aesthetic, bold thick black outlines, flat solid colors, plain solid white background",
    "A cartoon man with glasses in a navy sweater taking a deep diaphragmatic breath with an expanding calming blue aura, 2D adult animated sitcom aesthetic, bold thick black outlines, flat solid colors, plain solid white background",
    "A cartoon man with glasses in a navy sweater watching an exclamation point symbol settle into balance, 2D adult animated sitcom aesthetic, bold thick black outlines, flat solid colors, plain solid white background",
    "A cartoon man with glasses in a navy sweater standing in front of a clean podium delivering a powerful thesis with an assertive smile, 2D adult animated sitcom aesthetic, bold thick black outlines, flat solid colors, plain solid white background",
    "A cartoon man with glasses in a navy sweater pointing towards a Dr Doris Psych channel subscribe button with an encouraging smile, 2D adult animated sitcom aesthetic, bold thick black outlines, flat solid colors, plain solid white background"
]

with open(csv_path, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["SN", "SCRIPT", "PROMPT"])
    for idx, (sent, prompt) in enumerate(zip(sentences, prompts), start=1):
        writer.writerow([idx, sent, prompt])

with open(txt_path, "w", encoding="utf-8") as f:
    for sent in sentences:
        f.write(sent + "\n")

print(f"Generated {len(sentences)} rows in CSV and TXT!")
print("CSV Path:", csv_path, f"({os.path.getsize(csv_path)} bytes)")
print("TXT Path:", txt_path, f"({os.path.getsize(txt_path)} bytes)")
