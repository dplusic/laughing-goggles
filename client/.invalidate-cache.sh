#!/bin/bash

if [ -z "${DISTRIBUTION_ID}" ]; then
  exit 0
fi

echo "Invalidate CloudFront cache: ${DISTRIBUTION_ID}"

aws cloudfront create-invalidation \
  --distribution-id "${DISTRIBUTION_ID}" \
  --paths "/" "/index.html"

