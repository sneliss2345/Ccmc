"""Re-voice a video's narration with Yandex SpeechKit, keeping every clip's current length.

Works like generate_voiceover_elevenlabs.py and reuses its helpers: each new clip is fitted
to the length of the clip it replaces, so the scenes stay in sync without code changes, and
scripts/speechkit-report.json records how much each line was stretched. Uses the v1 REST API,
which bills per character; stress marks from narration.json become SpeechKit's "+" markup.

    export YANDEX_API_KEY=...   # service account API key, stored as an environment secret
    python scripts/generate_voiceover_speechkit.py --voice alena
    python scripts/generate_voiceover_speechkit.py --voice alena --only definition-2 --speed 1.2

Requires ffmpeg and ffprobe on PATH. Only the standard library is used.
"""

import argparse
import json
import os
import pathlib
import re
import subprocess
import tempfile
import urllib.parse
import urllib.request

from generate_voiceover_elevenlabs import atempo_chain, duration, plain_text, trim_silence

HERE = pathlib.Path(__file__).resolve().parent.parent
STRESS = "́"


def speechkit_text(text: str) -> str:
    # SpeechKit marks stress with "+" before the vowel; narration.json puts U+0301 after it.
    return plain_text(re.sub(rf"(\w){STRESS}", r"+\1", text))


def synthesize(text: str, voice: str, speed: float) -> bytes:
    body = urllib.parse.urlencode(
        {"text": text, "lang": "ru-RU", "voice": voice, "speed": speed, "format": "oggopus"}
    )
    request = urllib.request.Request(
        "https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize",
        data=body.encode("utf-8"),
        headers={"Authorization": f"Api-Key {os.environ['YANDEX_API_KEY']}"},
    )
    with urllib.request.urlopen(request, timeout=120) as response:
        return response.read()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--voice", required=True)
    parser.add_argument("--project", default=HERE, type=pathlib.Path)
    parser.add_argument("--only", nargs="*", help="Generate only these line ids")
    parser.add_argument("--speed", type=float, default=1.0, help="SpeechKit speaking speed, 0.1–3.0")
    args = parser.parse_args()

    project = args.project.resolve()
    lines = json.loads((project / "scripts" / "narration.json").read_text(encoding="utf-8"))
    out_dir = project / "public" / "voiceover"
    report_path = project / "scripts" / "speechkit-report.json"
    # With --only, keep the entries of the lines that are not regenerated.
    report = json.loads(report_path.read_text(encoding="utf-8")) if args.only and report_path.exists() else {}

    with tempfile.TemporaryDirectory() as tmp:
        for line in lines:
            if args.only and line["id"] not in args.only:
                continue
            target = out_dir / f"{line['id']}.mp3"
            old_length = duration(target)
            raw = pathlib.Path(tmp) / f"{line['id']}.ogg"
            raw.write_bytes(synthesize(speechkit_text(line["text"]), args.voice, args.speed))
            new_length = duration(raw)
            if new_length > old_length:
                # Cut the silence at the ends before speeding up the speech, and pad the end
                # with silence rather than slow down if the cut is enough.
                trimmed = raw.with_suffix(".wav")
                trim_silence(raw, trimmed)
                raw, new_length = trimmed, duration(trimmed)
                factor = max(new_length / old_length, 1.0)
            else:
                factor = new_length / old_length
            subprocess.run(
                ["ffmpeg", "-v", "error", "-y", "-i", str(raw),
                 "-af", f"{atempo_chain(factor)},loudnorm=I=-16:TP=-1.5:LRA=11,apad",
                 "-ar", "44100", "-ac", "1", "-b:a", "128k", "-t", f"{old_length:.3f}", str(target)],
                check=True,
            )
            report[line["id"]] = {"natural": round(new_length, 2), "fitted_to": round(old_length, 2),
                                  "stretch": round(factor, 3)}
            flag = "  <-- check" if abs(factor - 1) > 0.15 else ""
            print(f"{line['id']:18s} {new_length:6.2f}s -> {old_length:6.2f}s  x{factor:.3f}{flag}")

    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=1), encoding="utf-8")


if __name__ == "__main__":
    main()
