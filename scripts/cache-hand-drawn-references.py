#!/usr/bin/env python3
"""Cache required references without changing the upstream manifest or files."""
import argparse
import json
import os
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.parse import quote
from urllib.request import urlopen

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'vendor/hand-drawn/scripts'))
import hosted_images
import render_prompt

# Last original-image revision before Netlify migration; bytes must match the pinned manifest.
ARCHIVE_REVISION = 'cdfd004c89164096c861ad06ebab2aa1527d1710'


def cache_reference(key, verify_only=False):
    record = hosted_images.image_record(key)
    target = hosted_images.cache_path(key, record)
    if target.is_file():
        try:
            hosted_images.verify_image_bytes(target.read_bytes(), record, key)
            return {'key':key, 'path':str(target), 'verified':True, 'source':'cache'}
        except ValueError:
            pass
    if verify_only or os.environ.get('HAND_DRAWN_OFFLINE') == '1':
        raise ValueError(f'No valid cached reference: {key}')
    try:
        data = hosted_images.download_image(key, record)
        origin = record['url']
    except ValueError:
        origin = f'https://raw.githubusercontent.com/threerocks/hand-drawn-styles/{ARCHIVE_REVISION}/{quote(key, safe="/")}'
        with urlopen(origin, timeout=30) as response:
            data = response.read(record['bytes'] + 1)
        hosted_images.verify_image_bytes(data, record, key)
    hosted_images.write_atomic(target, data)
    return {'key':key, 'path':str(target), 'verified':True, 'source':origin}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--style', help='Upstream style number or alias; omitted selects all required references')
    parser.add_argument('--verify-only', action='store_true', help='Check cached bytes without network access')
    args = parser.parse_args()
    try:
        selected = render_prompt.canonical_style_id(args.style) if args.style else None
        styles = [item for item in render_prompt.list_styles() if selected is None or item['style_id'] == selected]
        keys = sorted({hosted_images.key_for_url(url) for item in styles for url in item['references']})
        with ThreadPoolExecutor(max_workers=5) as pool:
            report = list(pool.map(lambda key: cache_reference(key, args.verify_only), keys))
        print(json.dumps(report, ensure_ascii=False, indent=2))
    except (OSError, ValueError) as error:
        print(f'Hand-drawn reference check failed: {error}', file=sys.stderr)
        sys.exit(2)
