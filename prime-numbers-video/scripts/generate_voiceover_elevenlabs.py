"""Re-voice a video's narration with ElevenLabs, keeping every clip's current length.

The scenes place each clip and its on-screen cues at fixed times, so each new clip is
time-stretched (ffmpeg atempo) to the length of the clip it replaces. The animations
then stay in sync without touching the scene code. Lines whose natural length differs
by more than 15 % are reported, since stronger stretching starts to sound unnatural.

    export ELEVENLABS_API_KEY=...   # stored as an environment secret, never in the repo
    python scripts/generate_voiceover_elevenlabs.py --voice-id <id>
    python scripts/generate_voiceover_elevenlabs.py --voice-id <id> --project ../prime-numbers-video

Requires ffmpeg and ffprobe on PATH. Only the standard library is used.
"""

import argparse
import json
import os
import pathlib
import re
import subprocess
import tempfile
import urllib.request

HERE = pathlib.Path(__file__).resolve().parent.parent

# Raw-phoneme blocks used for the offline Piper voice, spelled out for ElevenLabs.
PHONEME_WORDS = {"rʲˈimənə": "Римана", "dʲɪɭʲˈinʲ": "Делинь"}


def plain_text(text: str) -> str:
    def word(match: re.Match) -> str:
        inner = match.group(1).strip()
        stripped = inner.rstrip(".")
        return PHONEME_WORDS.get(stripped, stripped) + inner[len(stripped):]

    text = re.sub(r"\[\[(.*?)\]\]", word, text)
    text = text.replace("́", "")  # stress marks
    return text.replace("дзэта", "дзета").replace("Дзэта", "Дзета")


def duration(path: pathlib.Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        capture_output=True, text=True, check=True,
    )
    return float(out.stdout.strip())


def synthesize(text: str, voice_id: str, model: str, previous: str, following: str) -> bytes:
    body = {
        "text": text,
        "model_id": model,
        "language_code": "ru",
        # Neighbouring lines keep the intonation continuous across clips.
        "previous_text": previous,
        "next_text": following,
        "voice_settings": {"stability": 0.5, "similarity_boost": 0.75, "style": 0.2},
    }
    request = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}?output_format=mp3_44100_128",
        data=json.dumps(body).encode("utf-8"),
        headers={
            "xi-api-key": os.environ["ELEVENLABS_API_KEY"],
            "Content-Type": "application/json",
            "Accept": "audio/mpeg",
        },
    )
    with urllib.request.urlopen(request, timeout=120) as response:
        return response.read()


def atempo_chain(factor: float) -> str:
    # A single atempo filter accepts 0.5–2.0; chain filters for anything outside that.
    parts = []
    while factor > 2.0:
        parts.append("atempo=2.0")
        factor /= 2.0
    while factor < 0.5:
        parts.append("atempo=0.5")
        factor /= 0.5
    parts.append(f"atempo={factor:.5f}")
    return ",".join(parts)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--voice-id", required=True)
    parser.add_argument("--model", default="eleven_multilingual_v2")
    parser.add_argument("--project", default=HERE, type=pathlib.Path)
    parser.add_argument("--only", nargs="*", help="Generate only these line ids")
    args = parser.parse_args()

    project = args.project.resolve()
    lines = json.loads((project / "scripts" / "narration.json").read_text(encoding="utf-8"))
    texts = [plain_text(line["text"]) for line in lines]
    out_dir = project / "public" / "voiceover"
    report = {}

    with tempfile.TemporaryDirectory() as tmp:
        for i, line in enumerate(lines):
            if args.only and line["id"] not in args.only:
                continue
            target = out_dir / f"{line['id']}.mp3"
            old_length = duration(target)
            raw = pathlib.Path(tmp) / f"{line['id']}.mp3"
            raw.write_bytes(
                synthesize(
                    texts[i], args.voice_id, args.model,
                    texts[i - 1] if i > 0 else "", texts[i + 1] if i + 1 < len(texts) else "",
                )
            )
            new_length = duration(raw)
            factor = new_length / old_length
            subprocess.run(
                ["ffmpeg", "-v", "error", "-y", "-i", str(raw),
                 "-af", f"{atempo_chain(factor)},loudnorm=I=-16:TP=-1.5:LRA=11",
                 "-ar", "44100", "-ac", "1", "-b:a", "128k", "-t", f"{old_length:.3f}", str(target)],
                check=True,
            )
            report[line["id"]] = {"natural": round(new_length, 2), "fitted_to": round(old_length, 2),
                                  "stretch": round(factor, 3)}
            flag = "  <-- check" if abs(factor - 1) > 0.15 else ""
            print(f"{line['id']:18s} {new_length:6.2f}s -> {old_length:6.2f}s  x{factor:.3f}{flag}")

    (project / "scripts" / "elevenlabs-report.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=1), encoding="utf-8"
    )


if __name__ == "__main__":
    main()
