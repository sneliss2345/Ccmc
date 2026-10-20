"""Generate public/voiceover/<id>.mp3 for every line in scripts/narration.json.

Uses an offline Piper voice through sherpa-onnx, so no API key is needed:

    pip install sherpa-onnx soundfile
    curl -LO https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-ru_RU-irina-medium.tar.bz2
    tar xjf vits-piper-ru_RU-irina-medium.tar.bz2
    python scripts/generate_voiceover.py --model-dir vits-piper-ru_RU-irina-medium

Requires ffmpeg on PATH. Prints the duration of every clip in seconds; the
scenes place each clip with an inline `from`, so update those if a line's
length changes noticeably.
"""

import argparse
import json
import pathlib
import subprocess
import tempfile

import sherpa_onnx
import soundfile as sf

ROOT = pathlib.Path(__file__).resolve().parent.parent


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model-dir", required=True, type=pathlib.Path)
    parser.add_argument("--out-dir", default=ROOT / "public" / "voiceover", type=pathlib.Path)
    parser.add_argument("--speed", default=1.0, type=float)
    parser.add_argument("--only", nargs="*", help="Generate only these line ids")
    args = parser.parse_args()

    model = next(args.model_dir.glob("*.onnx"))
    tts = sherpa_onnx.OfflineTts(
        sherpa_onnx.OfflineTtsConfig(
            model=sherpa_onnx.OfflineTtsModelConfig(
                vits=sherpa_onnx.OfflineTtsVitsModelConfig(
                    model=str(model),
                    tokens=str(args.model_dir / "tokens.txt"),
                    data_dir=str(args.model_dir / "espeak-ng-data"),
                ),
                num_threads=4,
            ),
        )
    )

    lines = json.loads((ROOT / "scripts" / "narration.json").read_text(encoding="utf-8"))
    if args.only:
        lines = [line for line in lines if line["id"] in args.only]

    args.out_dir.mkdir(parents=True, exist_ok=True)
    durations = {}
    with tempfile.TemporaryDirectory() as tmp:
        for line in lines:
            audio = tts.generate(line["text"], sid=0, speed=args.speed)
            wav = pathlib.Path(tmp) / f"{line['id']}.wav"
            sf.write(wav, audio.samples, audio.sample_rate)
            subprocess.run(
                ["ffmpeg", "-v", "error", "-y", "-i", str(wav),
                 # Same loudness for every line, so no clip stands out.
                 "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "44100", "-ac", "1", "-b:a", "96k",
                 str(args.out_dir / f"{line['id']}.mp3")],
                check=True,
            )
            durations[line["id"]] = round(len(audio.samples) / audio.sample_rate, 2)

    print(json.dumps(durations, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
