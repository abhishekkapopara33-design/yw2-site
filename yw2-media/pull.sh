#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

S3_URI="$(python3 scripts/sam_s3_info.py --field s3uri)"
REGION="$(python3 scripts/sam_s3_info.py --field region)"

aws s3 sync "$S3_URI/" "./s3/" \
  --region "$REGION" \
  --delete