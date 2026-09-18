#!/usr/bin/env python3
"""
Hero photo reel: web copies of the photo bank.

Drop full-size photos (straight off a phone or camera) into assets/photos/reel/.
This writes a web-sized copy of each into assets/photos/reel-web/, which is what the
site serves:
  - fits within 1600px, JPEG quality 82, progressive
  - rotated upright from the camera's orientation tag
  - ALL metadata stripped (camera, timestamps, GPS location)
  - filename lowercased with spaces -> hyphens, so filename order is kept

The originals stay local (git ignores them); only the web copies are published.
Copies are only regenerated when the original changes, and copies whose original
was removed are deleted.

Usage: python3 scripts/optimize-reel.py   (run by `npm run build`)
"""
import os
import re
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE = os.path.join(ROOT, 'assets', 'photos', 'reel')
OUTPUT = os.path.join(ROOT, 'assets', 'photos', 'reel-web')
MAX_SIDE = 1600
QUALITY = 82
IMAGE = re.compile(r'\.(jpe?g|png|webp|heic|tiff?)$', re.IGNORECASE)

try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit('optimize-reel: Pillow is required (python3 -m pip install Pillow)')

try:  # iPhone photos
    from pillow_heif import register_heif_opener
    register_heif_opener()
except ImportError:
    pass


def open_image(path):
    """Open with Pillow; for formats it can't read (iPhone HEIC without pillow-heif),
    fall back to converting a temporary JPEG with macOS's built-in `sips`."""
    try:
        return Image.open(path)
    except OSError:
        if sys.platform != 'darwin':
            raise
        tmp = tempfile.NamedTemporaryFile(suffix='.jpg', delete=False)
        tmp.close()
        subprocess.run(['sips', '-s', 'format', 'jpeg', path, '--out', tmp.name],
                       check=True, capture_output=True)
        im = Image.open(tmp.name)
        im.load()
        os.remove(tmp.name)
        return im


def web_name(filename):
    stem = os.path.splitext(filename)[0]
    return re.sub(r'[^a-z0-9]+', '-', stem.lower()).strip('-') + '.jpg'


def main():
    os.makedirs(SOURCE, exist_ok=True)
    os.makedirs(OUTPUT, exist_ok=True)

    wanted = set()
    for filename in sorted(os.listdir(SOURCE)):
        if not IMAGE.search(filename):
            continue
        src = os.path.join(SOURCE, filename)
        dest_name = web_name(filename)
        dest = os.path.join(OUTPUT, dest_name)
        wanted.add(dest_name)
        if os.path.exists(dest) and os.path.getmtime(dest) >= os.path.getmtime(src):
            continue
        try:
            with open_image(src) as im:
                im = ImageOps.exif_transpose(im).convert('RGB')
                im.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)
                # Saving without exif= drops every metadata block, including GPS
                im.save(dest, 'JPEG', quality=QUALITY, optimize=True, progressive=True)
        except (OSError, subprocess.CalledProcessError) as err:
            print(f'  ✗ skipped {filename}: {err}')
            continue
        before = os.path.getsize(src) / 1e6
        after = os.path.getsize(dest) / 1e6
        print(f'  ✓ {filename} → reel-web/{dest_name} ({before:.1f} MB → {after:.2f} MB)')

    for existing in os.listdir(OUTPUT):
        if existing.endswith('.jpg') and existing not in wanted:
            os.remove(os.path.join(OUTPUT, existing))
            print(f'  removed reel-web/{existing} (original is gone)')

    print(f'✓ Photo reel: {len(wanted)} photo(s)')


if __name__ == '__main__':
    main()
