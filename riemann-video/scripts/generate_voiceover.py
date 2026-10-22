"""Generate public/voiceover/<id>.mp3 for every line in scripts/narration.json.

Uses the offline Piper voice ru_RU-irina-medium through the official piper-tts
package, so no API key is needed. Unlike other front ends, its espeak-ng honours
a combining acute accent (U+0301) for stress, e.g. «Ри́мана», and accepts raw
phonemes in [[ ]] blocks, which the narration uses where the default stress is wrong.

    pip install piper-tts
    curl -LO https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-ru_RU-irina-medium.tar.bz2
    tar xjf vits-piper-ru_RU-irina-medium.tar.bz2
    python scripts/generate_voiceover.py --model vits-piper-ru_RU-irina-medium/ru_RU-irina-medium.onnx

Requires ffmpeg on PATH. Prints the duration of every clip in seconds; the
scenes place each clip with an inline `from`, so update those if a line's
length changes noticeably.
"""

import argparse
import json
import pathlib
import subprocess
import tempfile
import wave

from piper import PiperVoice, SynthesisConfig

ROOT = pathlib.Path(__file__).resolve().parent.parent


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", required=True, type=pathlib.Path)
    parser.add_argument("--out-dir", default=ROOT / "public" / "voiceover", type=pathlib.Path)
    parser.add_argument("--only", nargs="*", help="Generate only these line ids")
    # 0.92 speaks about 8% faster than the voice's default, which suits narration.
    parser.add_argument("--length-scale", default=0.92, type=float)
    args = parser.parse_args()

    voice = PiperVoice.load(args.model, config_path=f"{args.model}.json")
    lines = json.loads((ROOT / "scripts" / "narration.json").read_text(encoding="utf-8"))
    if args.only:
        lines = [line for line in lines if line["id"] in args.only]

    args.out_dir.mkdir(parents=True, exist_ok=True)
    durations = {}
    with tempfile.TemporaryDirectory() as tmp:
        for line in lines:
            wav = pathlib.Path(tmp) / f"{line['id']}.wav"
            with wave.open(str(wav), "wb") as out:
                voice.synthesize_wav(
                    line["text"], out, syn_config=SynthesisConfig(length_scale=args.length_scale)
                )
            with wave.open(str(wav), "rb") as clip:
                durations[line["id"]] = round(clip.getnframes() / clip.getframerate(), 2)
            subprocess.run(
                ["ffmpeg", "-v", "error", "-y", "-i", str(wav),
                 # Same loudness for every line, so no clip stands out.
                 "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "44100", "-ac", "1", "-b:a", "96k",
                 str(args.out_dir / f"{line['id']}.mp3")],
                check=True,
            )

    print(json.dumps(durations, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
